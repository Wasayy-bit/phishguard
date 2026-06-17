"""
PhishGuard Backend — FastAPI + MongoDB + JWT
Author: Ahmed Abdul Wasay (F2024408023)
Course: SE-494 Open Source Software Development
"""

from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# All other imports below
import os
import re
import logging
import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import Annotated, List, Optional, Literal

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
from fastapi.security import HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, ConfigDict
from starlette.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Config & DB
# ---------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_MIN = 60 * 24  # 24h for academic dev
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@phishguard.io")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@PhishGuard2026")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("phishguard")

# ---------------------------------------------------------------------------
# Pydantic helpers
# ---------------------------------------------------------------------------

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    return dt.astimezone(timezone.utc).isoformat()


def serialize_doc(doc: dict) -> dict:
    """Turn a Mongo document into a JSON-safe dict (no ObjectId, ISO dates)."""
    if doc is None:
        return None
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = iso(v)
        else:
            out[k] = v
    out.pop("password_hash", None)
    return out


# ---------------------------------------------------------------------------
# Auth utilities
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": now_utc() + timedelta(minutes=ACCESS_TOKEN_TTL_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(request: Request) -> dict:
    """Read JWT from Authorization header (Bearer) or access_token cookie."""
    token = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user


# ---------------------------------------------------------------------------
# Phishing detection engine (rule-based heuristic)
# ---------------------------------------------------------------------------

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "account", "secure", "update", "confirm",
    "bank", "paypal", "appleid", "signin", "wallet", "password",
    "support", "billing", "invoice", "gift", "free", "bonus",
]
SUSPICIOUS_TLDS = {"tk", "ml", "ga", "cf", "gq", "xyz", "top", "click", "zip", "country"}
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "buff.ly",
    "ow.ly", "rebrand.ly", "cutt.ly", "shorturl.at",
}
TRUSTED_DOMAINS = {
    "google.com", "github.com", "microsoft.com", "apple.com", "amazon.com",
    "stackoverflow.com", "wikipedia.org", "mozilla.org", "cloudflare.com",
    "fastapi.tiangolo.com", "mongodb.com", "umt.edu.pk",
}
IPV4_RE = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")


def analyze_url(raw_url: str) -> dict:
    """Return a structured analysis with score (0-100), verdict and features."""
    url = (raw_url or "").strip()
    features = []
    score = 0

    if not url:
        return {"risk_score": 0, "verdict": "Safe", "features": [], "url": ""}

    if not re.match(r"^https?://", url, re.IGNORECASE):
        url_to_parse = "http://" + url
    else:
        url_to_parse = url

    try:
        parsed = urllib.parse.urlparse(url_to_parse)
        host = (parsed.hostname or "").lower()
        scheme = parsed.scheme.lower()
        path = parsed.path or ""
        query = parsed.query or ""
        full_url = url
    except Exception:
        return {
            "risk_score": 100,
            "verdict": "Malicious",
            "features": [{"name": "PARSE_ERROR", "weight": 100, "passed": False,
                          "detail": "URL could not be parsed"}],
            "url": url,
        }

    def add(name, weight, passed, detail):
        nonlocal score
        if not passed:
            score += weight
        features.append({"name": name, "weight": weight, "passed": passed, "detail": detail})

    # 1. HTTPS
    add("HTTPS Scheme", 15, scheme == "https",
        f"Scheme detected: {scheme.upper()}" + ("" if scheme == "https" else " — site does not use TLS"))

    # 2. IP in host
    add("No IP-Based Host", 25, not bool(IPV4_RE.match(host)),
        "Host is a domain name" if not IPV4_RE.match(host) else f"Host is a raw IP address ({host})")

    # 3. URL length
    url_len = len(full_url)
    add("Reasonable URL Length", 10, url_len < 75,
        f"URL is {url_len} characters " + ("(reasonable)" if url_len < 75 else "(very long — common in phishing)"))

    # 4. Excess subdomains
    parts = host.split(".") if host else []
    sub_depth = max(0, len(parts) - 2)
    add("Subdomain Depth", 10, sub_depth <= 2,
        f"{sub_depth} subdomain levels detected " + ("(normal)" if sub_depth <= 2 else "(excessive)"))

    # 5. Suspicious TLD
    tld = parts[-1] if parts else ""
    add("Reputable TLD", 15, tld not in SUSPICIOUS_TLDS,
        f".{tld} top-level domain " + ("is acceptable" if tld not in SUSPICIOUS_TLDS else "is commonly abused"))

    # 6. URL shortener
    base_domain = ".".join(parts[-2:]) if len(parts) >= 2 else host
    add("Not a URL Shortener", 10, base_domain not in URL_SHORTENERS,
        f"Domain {base_domain} " + ("is not a known shortener" if base_domain not in URL_SHORTENERS else "is a URL shortening service"))

    # 7. Suspicious keywords
    bad_kw = [k for k in SUSPICIOUS_KEYWORDS if k in (host + path + query).lower()]
    add("No Suspicious Keywords", 15, len(bad_kw) == 0,
        "No phishing keywords found" if not bad_kw else "Found suspicious keywords: " + ", ".join(bad_kw[:5]))

    # 8. '@' or '//' in path
    has_at = "@" in full_url.split("//", 1)[-1].split("/", 1)[0]
    add("No '@' in Authority", 10, not has_at,
        "URL authority is clean" if not has_at else "URL contains '@' — used to disguise destination")

    # 9. Excessive hyphens
    hyphens = host.count("-")
    add("Low Hyphen Count", 5, hyphens <= 2,
        f"{hyphens} hyphens in host " + ("(normal)" if hyphens <= 2 else "(brand-impersonation pattern)"))

    # 10. Punycode (IDN homograph)
    is_puny = "xn--" in host
    add("No Punycode", 10, not is_puny,
        "No internationalised characters" if not is_puny else "Punycode detected — possible homograph attack")

    # Trusted domain rebate
    if base_domain in TRUSTED_DOMAINS:
        score = max(0, score - 30)

    score = min(100, score)
    if score < 25:
        verdict = "Safe"
    elif score < 60:
        verdict = "Suspicious"
    else:
        verdict = "Malicious"

    return {
        "risk_score": score,
        "verdict": verdict,
        "features": features,
        "url": full_url,
        "host": host,
        "scheme": scheme,
    }


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    display_name: str = Field(min_length=1, max_length=80)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    role: str
    created_at: Optional[str] = None


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    password: Optional[str] = Field(default=None, min_length=6, max_length=128)


class ScanIn(BaseModel):
    url: str = Field(min_length=3, max_length=2048)


class ReportIn(BaseModel):
    url: str = Field(min_length=3, max_length=2048)
    target_brand: str = Field(min_length=1, max_length=80)
    description: str = Field(min_length=10, max_length=2000)
    evidence: List[str] = Field(default_factory=list)


class ReportStatusUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected"]


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer_index: int


class ModuleIn(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    category: str = Field(min_length=2, max_length=60)
    content: str = Field(min_length=10)
    quiz: List[QuizQuestion] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# FastAPI app + router
# ---------------------------------------------------------------------------

app = FastAPI(title="PhishGuard API",
              description="Phishing URL Detection, Reporting & Cyber-Awareness Platform.",
              version="1.0.0")

api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"app": "PhishGuard", "version": "1.0.0", "status": "ok"}


# ----------------------------- AUTH -----------------------------

@api.post("/auth/register", response_model=AuthOut)
async def register(payload: RegisterIn):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing is not None:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "display_name": payload.display_name.strip(),
        "role": "user",
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    res = await db.users.insert_one(doc)
    user_id = str(res.inserted_id)
    token = create_access_token(user_id, email, "user")
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id, "email": email, "display_name": doc["display_name"],
            "role": "user", "created_at": iso(doc["created_at"]),
        },
    }


@api.post("/auth/login", response_model=AuthOut)
async def login(payload: LoginIn):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if user is None or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(str(user["_id"]), email, user.get("role", "user"))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "display_name": user["display_name"],
            "role": user.get("role", "user"),
            "created_at": iso(user.get("created_at")),
        },
    }


@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "display_name": user["display_name"],
        "role": user.get("role", "user"),
        "created_at": iso(user.get("created_at")),
    }


@api.put("/users/me", response_model=UserOut)
async def update_me(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    update = {"updated_at": now_utc()}
    if payload.display_name:
        update["display_name"] = payload.display_name.strip()
    if payload.password:
        update["password_hash"] = hash_password(payload.password)
    await db.users.update_one({"_id": user["_id"]}, {"$set": update})
    fresh = await db.users.find_one({"_id": user["_id"]})
    return {
        "id": str(fresh["_id"]),
        "email": fresh["email"],
        "display_name": fresh["display_name"],
        "role": fresh.get("role", "user"),
        "created_at": iso(fresh.get("created_at")),
    }


# ----------------------------- SCAN -----------------------------

@api.post("/scan")
async def submit_scan(payload: ScanIn, user: dict = Depends(get_current_user)):
    analysis = analyze_url(payload.url)
    doc = {
        "user_id": user["_id"],
        "url": analysis["url"],
        "host": analysis.get("host", ""),
        "scheme": analysis.get("scheme", ""),
        "risk_score": analysis["risk_score"],
        "verdict": analysis["verdict"],
        "features": analysis["features"],
        "created_at": now_utc(),
    }
    res = await db.scans.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.get("/scan/history")
async def scan_history(user: dict = Depends(get_current_user), limit: int = 50):
    cursor = db.scans.find({"user_id": user["_id"]}).sort("created_at", -1).limit(limit)
    items = [serialize_doc(d) async for d in cursor]
    return {"items": items, "count": len(items)}


@api.get("/scan/{scan_id}")
async def get_scan(scan_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(scan_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid scan id")
    doc = await db.scans.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Scan not found")
    if doc["user_id"] != user["_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize_doc(doc)


@api.delete("/scan/{scan_id}")
async def delete_scan(scan_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(scan_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid scan id")
    res = await db.scans.delete_one({"_id": oid, "user_id": user["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"deleted": True, "id": scan_id}


# ----------------------------- REPORTS -----------------------------

@api.post("/reports")
async def submit_report(payload: ReportIn, user: dict = Depends(get_current_user)):
    doc = {
        "submitted_by": user["_id"],
        "submitted_by_name": user.get("display_name"),
        "url": payload.url.strip(),
        "target_brand": payload.target_brand.strip(),
        "description": payload.description.strip(),
        "evidence": [e.strip() for e in payload.evidence if e.strip()],
        "status": "pending",
        "created_at": now_utc(),
        "reviewed_at": None,
    }
    res = await db.reports.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.get("/reports")
async def list_reports(
    user: dict = Depends(get_current_user),
    status: Optional[str] = None,
    brand: Optional[str] = None,
    q: Optional[str] = None,
    mine: bool = False,
    limit: int = 100,
):
    query = {}
    if mine:
        query["submitted_by"] = user["_id"]
    else:
        # non-admins only see approved unless they ask for their own
        if user.get("role") != "admin":
            if status and status != "approved":
                raise HTTPException(status_code=403, detail="Only admins may filter non-approved reports.")
            query["status"] = "approved"
        elif status:
            query["status"] = status
    if brand:
        query["target_brand"] = {"$regex": re.escape(brand), "$options": "i"}
    if q:
        query["$or"] = [
            {"url": {"$regex": re.escape(q), "$options": "i"}},
            {"target_brand": {"$regex": re.escape(q), "$options": "i"}},
            {"description": {"$regex": re.escape(q), "$options": "i"}},
        ]
    cursor = db.reports.find(query).sort("created_at", -1).limit(limit)
    items = [serialize_doc(d) async for d in cursor]
    return {"items": items, "count": len(items)}


@api.get("/reports/{report_id}")
async def get_report(report_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = await db.reports.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    if doc["status"] != "approved" and doc["submitted_by"] != user["_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Report not visible")
    return serialize_doc(doc)


@api.put("/reports/{report_id}")
async def update_report_status(report_id: str, payload: ReportStatusUpdate,
                               admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    res = await db.reports.update_one(
        {"_id": oid},
        {"$set": {"status": payload.status, "reviewed_at": now_utc()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    doc = await db.reports.find_one({"_id": oid})
    return serialize_doc(doc)


@api.delete("/reports/{report_id}")
async def delete_report(report_id: str, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    res = await db.reports.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"deleted": True, "id": report_id}


# ----------------------------- MODULES -----------------------------

@api.get("/modules")
async def list_modules(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    cursor = db.modules.find(query).sort("created_at", -1)
    items = [serialize_doc(d) async for d in cursor]
    return {"items": items, "count": len(items)}


@api.get("/modules/{module_id}")
async def get_module(module_id: str):
    try:
        oid = ObjectId(module_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = await db.modules.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Module not found")
    return serialize_doc(doc)


@api.post("/modules")
async def create_module(payload: ModuleIn, admin: dict = Depends(require_admin)):
    doc = {
        "title": payload.title.strip(),
        "category": payload.category.strip(),
        "content": payload.content.strip(),
        "quiz": [q.model_dump() for q in payload.quiz],
        "created_by": admin["_id"],
        "created_at": now_utc(),
    }
    res = await db.modules.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.put("/modules/{module_id}")
async def update_module(module_id: str, payload: ModuleIn, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(module_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    update = {
        "title": payload.title.strip(),
        "category": payload.category.strip(),
        "content": payload.content.strip(),
        "quiz": [q.model_dump() for q in payload.quiz],
        "updated_at": now_utc(),
    }
    res = await db.modules.update_one({"_id": oid}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    doc = await db.modules.find_one({"_id": oid})
    return serialize_doc(doc)


@api.delete("/modules/{module_id}")
async def delete_module(module_id: str, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(module_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    res = await db.modules.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"deleted": True, "id": module_id}


# ----------------------------- ADMIN STATS -----------------------------

@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    users_total = await db.users.count_documents({})
    admins_total = await db.users.count_documents({"role": "admin"})
    scans_total = await db.scans.count_documents({})
    scans_malicious = await db.scans.count_documents({"verdict": "Malicious"})
    scans_suspicious = await db.scans.count_documents({"verdict": "Suspicious"})
    scans_safe = await db.scans.count_documents({"verdict": "Safe"})
    reports_pending = await db.reports.count_documents({"status": "pending"})
    reports_approved = await db.reports.count_documents({"status": "approved"})
    reports_rejected = await db.reports.count_documents({"status": "rejected"})
    modules_total = await db.modules.count_documents({})

    # recent scans (last 5)
    recent = []
    async for d in db.scans.find({}).sort("created_at", -1).limit(5):
        recent.append(serialize_doc(d))

    return {
        "users": {"total": users_total, "admins": admins_total},
        "scans": {
            "total": scans_total,
            "malicious": scans_malicious,
            "suspicious": scans_suspicious,
            "safe": scans_safe,
        },
        "reports": {
            "pending": reports_pending,
            "approved": reports_approved,
            "rejected": reports_rejected,
        },
        "modules": {"total": modules_total},
        "recent_scans": recent,
    }


@api.get("/admin/users")
async def list_users(admin: dict = Depends(require_admin)):
    cursor = db.users.find({}).sort("created_at", -1)
    items = [serialize_doc(d) async for d in cursor]
    return {"items": items, "count": len(items)}


# ----------------------------- INCLUDE & CORS -----------------------------

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup: indexes + seed
# ---------------------------------------------------------------------------

DEFAULT_MODULES = [
    {
        "title": "What is Phishing?",
        "category": "Fundamentals",
        "content": (
            "Phishing is a form of social engineering where an attacker tricks a user into "
            "revealing sensitive information — usually credentials, payment details or one-time "
            "passcodes — by impersonating a trusted brand or person.\n\n"
            "Common channels include email, SMS (smishing), instant messaging and fraudulent "
            "websites. Modern phishing kits can clone a legitimate login page in minutes, so "
            "vigilance and tooling such as PhishGuard are essential."
        ),
        "quiz": [
            {
                "question": "Which is NOT a typical phishing channel?",
                "options": ["Email", "SMS", "Printed newspaper ads", "Instant messaging"],
                "answer_index": 2,
            }
        ],
    },
    {
        "title": "Spotting a Phishing URL",
        "category": "Detection",
        "content": (
            "Inspect the URL before clicking. Red flags include:\n"
            "• An IP address instead of a domain (http://192.168.x.x/login).\n"
            "• Suspicious top-level domains (.tk, .ml, .ga, .xyz).\n"
            "• Long URLs packed with random characters and brand keywords.\n"
            "• Use of URL shorteners that hide the real destination.\n"
            "• '@' symbols or punycode (xn--) in the authority section.\n\n"
            "When in doubt, type the brand's domain directly into your browser."
        ),
        "quiz": [
            {
                "question": "Which TLD is more commonly abused for phishing?",
                "options": [".gov", ".edu", ".tk", ".org"],
                "answer_index": 2,
            }
        ],
    },
    {
        "title": "If You Clicked — Now What?",
        "category": "Response",
        "content": (
            "Don't panic. Take these steps:\n"
            "1. Disconnect from the network if you suspect malware delivery.\n"
            "2. Change passwords for affected accounts, starting with email.\n"
            "3. Enable multi-factor authentication everywhere.\n"
            "4. Report the incident to your IT/security team and to the impersonated brand.\n"
            "5. Submit the URL to PhishGuard so the community can be warned."
        ),
        "quiz": [],
    },
]


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.scans.create_index([("user_id", 1), ("created_at", -1)])
    await db.reports.create_index([("status", 1), ("created_at", -1)])
    await db.reports.create_index("target_brand")
    await db.modules.create_index("category")

    # Seed admin (idempotent)
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if existing is None:
        await db.users.insert_one({
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "display_name": "PhishGuard Admin",
            "role": "admin",
            "created_at": now_utc(),
            "updated_at": now_utc(),
        })
        logger.info("Seeded admin user: %s", ADMIN_EMAIL)
    else:
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.users.update_one(
                {"_id": existing["_id"]},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD),
                          "role": "admin", "updated_at": now_utc()}},
            )
            logger.info("Refreshed admin password for: %s", ADMIN_EMAIL)

    # Seed default modules if collection empty
    count = await db.modules.count_documents({})
    if count == 0:
        admin = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
        admin_id = admin["_id"] if admin else None
        docs = []
        for m in DEFAULT_MODULES:
            docs.append({**m, "created_by": admin_id, "created_at": now_utc()})
        if docs:
            await db.modules.insert_many(docs)
            logger.info("Seeded %d default learning modules", len(docs))


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
