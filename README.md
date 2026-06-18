# 🛡️ PhishGuard

### An Open-Source Phishing URL Detection, Reporting, and Cyber-Awareness Platform

**Final Semester Project | Department of Cyber Security**
*   **Course:** SE-494 Open Source Software Development (Section Y9)
*   **Institution:** University of Management and Technology

PhishGuard is an advanced cyber security intelligence platform designed to detect malicious web indicators, provide visual threat analysis dashboards, and deliver structured cyber-awareness learning modules. Built with an asynchronous decoupled architecture, it combines a reactive frontend application with a secure distributed backend cluster.

---

## 🌐 Live Deployments & Production Links

*   **Live Frontend Web Application (Vercel):** [https://phishguard-2.vercel.app](https://phishguard-2.vercel.app)
*   **Live Backend API Gateway (Render):** [https://phishguard-jvei.onrender.com](https://phishguard-jvei.onrender.com)
*   **Interactive API Documentation (Swagger UI):** [https://phishguard-jvei.onrender.com/docs](https://phishguard-jvei.onrender.com/docs)
*   **Source Code Repository:** [https://github.com/Wasayy-bit/phishguard](https://github.com/Wasayy-bit/phishguard)

---

## 🚀 Key Features

*   **Real-time Phishing Detection:** Asynchronous URL threat evaluation utilizing cryptographic integrity checks, 10+ lexical heuristics, and security metadata inspection.
*   **Cyber-Awareness Hub:** Interactive, cloud-seeded learning modules tailored to educate end-users on vector mechanics and current phishing strategies.
*   **Threat Reporting Pipeline:** Automated framework for users to submit suspicious URLs, logging telemetry into a centralized database repository.
*   **Role-Based Analytics Dashboard:** Secure authentication workflows allowing system operators to audit reported threat vectors and manage system states.

---

## 🛠️ Tech Stack & Architecture

### Frontend Application
*   **Framework:** React.js (Bootstrapped with Vite for high-concurrency architecture)
*   **Styling Engine:** Tailwind CSS & PostCSS (Fluid utility-first interface styling)
*   **State Management & Routing:** Axios Interceptors (JWT state isolation) & React Router DOM

### Backend Infrastructure
*   **Core Engine:** FastAPI (Python compatible, asynchronous high-performance concurrency framework)
*   **Database Driver:** Motor (Non-blocking asynchronous MongoDB connectivity driver)
*   **Security Layer:** PyJWT (JSON Web Tokens) & Passlib with Bcrypt (Salted cryptographic password hashing)

### Database Layer
*   **Cloud Infrastructure:** MongoDB Atlas (Cloud-Native Shared Cluster Free Tier)

⚙️ Runtime System Installation & Local Setup
1. Backend Engine Initialization
Navigate to the backend directory, isolate dependencies within a virtual environment, and execute the ASGI production server:

PowerShell
cd backend
python -m venv .venv

# Activation on Windows:
.\.venv\Scripts\activate

# Installation of dependencies:
pip install -r requirements.txt

# Run local development server:
uvicorn server:app --reload --port 8000
Note: Ensure your local configuration points to the appropriate cloud URI or local environment variables inside your service configurations.

2. Frontend Application Initialization
Navigate to the frontend directory, compile the asset tree, and run the Vite high-speed compilation server:

PowerShell
cd frontend
npm install
npm run dev
📸 Deployment Visual Evaluation & Screenshots
1. Production Frontend Deployment (Vercel)
Visual evaluation of edge-network compilation and active route configuration on Vercel.

2. Cloud Production Backend Runtime (Render)
Asynchronous log auditing and container provisioning layout indicating functional runtime health on Render.

3. Cloud-Native Distributed Storage (MongoDB Atlas)
Telemetry configurations and schema documents showing live users collection registries.

4. Interactive Core Application Dashboards
Real-time interface scans exhibiting explainable threat heuristic scores and user history collection layers.

👥 Student & Course Governance
Student Name: Ahmed Abdul Wasay

Roll Number: F2024408023

Program: Bachelor of Science in Cyber Security

Course Code & Title: SE-494 Open Source Software Development

Course Section: Y9

Project Context: Final Semester Project Evaluation Document

© 2026 PhishGuard • Department of Cyber Security • University of Management and Technology

## 📦 Directory Structure

```text
PhishGuard/
├── README.md                # Central project system architecture manual
├── backend/
│   ├── app/                 # Application routes, controllers, and core logic
│   ├── plugins/             # Webpack and runtime configuration hooks
│   ├── server.py            # FastAPI entry-point & automatic cloud seeding
│   └── requirements.txt     # Python ecosystem backend dependencies
├── frontend/
│   ├── public/              # System assets, static media, and Favicon configuration
│   ├── src/
│   │   ├── components/      # Reusable global interface components
│   │   ├── constants/       # Centralized end-to-end testing element registries
│   │   ├── context/         # React global state management contexts
│   │   ├── hooks/           # Custom operational React hooks
│   │   ├── lib/             # Encapsulated network layer configurations (Axios config)
│   │   ├── pages/           # Complete view boundaries (Dashboard, Login, Scan UI)
│   │   ├── App.css          # Custom core style overrides
│   │   ├── App.jsx          # Root layout configuration and routing layout
│   │   └── main.jsx         # Application root DOM initialization bridge
│   ├── package.json         # Frontend runtime script registry and packages
│   └── vite.config.js       # Vite compilation engine environment setup
└── screenshots/             # System deployment visual evaluation documentation
    ├── database/            # Database storage state visualizations (MongoDB Atlas)
    ├── project/             # Complete end-user application views & scan dashboards
    ├── render/              # Cloud production backend runtime deployment evidence
    └── vercel/              # Production frontend hosting and edge network analytics
