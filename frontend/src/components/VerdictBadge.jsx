import { CheckCircle, Warning, ShieldWarning } from "@phosphor-icons/react";

export function verdictMeta(verdict) {
  if (verdict === "Safe")
    return {
      cls: "pg-badge-safe",
      color: "var(--pg-safe)",
      icon: CheckCircle,
      label: "Safe",
    };
  if (verdict === "Suspicious")
    return {
      cls: "pg-badge-warn",
      color: "var(--pg-warn)",
      icon: Warning,
      label: "Suspicious",
    };
  return {
    cls: "pg-badge-danger",
    color: "var(--pg-danger)",
    icon: ShieldWarning,
    label: "Malicious",
  };
}

export default function VerdictBadge({ verdict, dataTestId }) {
  const m = verdictMeta(verdict);
  const Icon = m.icon;
  return (
    <span className={`pg-badge ${m.cls}`} data-testid={dataTestId}>
      <Icon size={14} weight="bold" /> {m.label}
    </span>
  );
}
