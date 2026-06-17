import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import { UserCircle, LockSimple, Check } from "@phosphor-icons/react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.display_name || "");
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const body = {};
      if (name && name !== user.display_name) body.display_name = name.trim();
      if (pwd) body.password = pwd;
      if (!Object.keys(body).length) {
        setErr("Nothing to update.");
        setSaving(false);
        return;
      }
      const { data } = await api.put("/users/me", body);
      setUser({ ...user, display_name: data.display_name });
      setOk("Profile updated.");
      setPwd("");
    } catch (e) {
      setErr(formatApiError(e, "Could not update profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-2 mb-8">
        <span className="pg-overline">Account</span>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">
          Profile & Settings
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="pg-card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 border border-white/10 flex items-center justify-center mb-4">
              <UserCircle
                size={48}
                weight="duotone"
                className="text-[var(--pg-brand)]"
              />
            </div>
            <p className="font-display text-xl">{user?.display_name}</p>
            <p className="mono text-xs text-white/50 mt-1">{user?.email}</p>
            <span className="pg-badge pg-badge-neutral mt-4">
              {user?.role === "admin" ? "Administrator" : "Member"}
            </span>
          </div>
          <div className="pg-divider my-6" />
          <p className="pg-overline mb-2">Member since</p>
          <p className="mono text-xs text-white/70">
            {user?.created_at
              ? new Date(user.created_at).toLocaleString()
              : "—"}
          </p>
        </div>

        <form onSubmit={save} className="pg-card p-6 lg:col-span-2 space-y-5">
          <div>
            <label className="pg-overline mb-2 block">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pg-input"
              data-testid="profile-name-input"
            />
          </div>
          <div>
            <label className="pg-overline mb-2 block">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="pg-input mono opacity-60"
            />
            <p className="text-xs text-white/40 mt-1">
              Email cannot be changed.
            </p>
          </div>
          <div>
            <label className="pg-overline mb-2 block">New password</label>
            <div className="flex items-center gap-2 pg-input">
              <LockSimple size={18} className="text-white/40" />
              <input
                type="password"
                minLength={6}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Leave blank to keep current"
                className="flex-1 bg-transparent outline-none mono text-sm"
                data-testid="profile-password-input"
              />
            </div>
          </div>
          {err && (
            <p
              className="text-sm text-[var(--pg-danger)]"
              data-testid="profile-error"
            >
              {err}
            </p>
          )}
          {ok && (
            <p
              className="text-sm text-[var(--pg-safe)] flex items-center gap-2"
              data-testid="profile-success"
            >
              <Check size={14} /> {ok}
            </p>
          )}
          <button
            type="submit"
            className="pg-btn-primary"
            disabled={saving}
            data-testid="profile-save-btn"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
