import type { CSSProperties, ReactNode } from "react";
import { formatBRL } from "../lib/currency";

// kpi tile — variants follow the painel design
type KpiVariant = "dark" | "light" | "accent";
const kpiBg: Record<KpiVariant, CSSProperties> = {
  dark: { background: "var(--nm-black)", color: "var(--nm-off-white)" },
  light: { background: "var(--nm-off-white)", color: "var(--nm-black)" },
  accent: { background: "var(--nm-green)", color: "var(--nm-black)" },
};

export function KpiTile({ label, value, variant = "light" }: { label: string; value: string; variant?: KpiVariant }) {
  return (
    <div style={{ flex: "1 1 220px", border: "var(--nm-border-card)", padding: 18, display: "flex", flexDirection: "column", gap: 10, ...kpiBg[variant] }}>
      <span className="nm-eyebrow">{label}</span>
      <span style={{ fontSize: "var(--nm-size-kpi)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</span>
    </div>
  );
}

// card with section header bar
export function Card({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section style={{ border: "var(--nm-border-card)", background: "var(--nm-off-white)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", borderBottom: "4px solid var(--nm-black)", padding: "12px 16px", fontSize: 13, fontWeight: 800, letterSpacing: "0.08em" }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>{title}</h2>
        {meta && <span>{meta}</span>}
      </header>
      <div style={{ padding: "18px 16px" }}>{children}</div>
    </section>
  );
}

// primary = green fill + hard shadow; secondary = black fill
export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const primary = variant === "primary";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        fontFamily: "var(--nm-font)",
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: "0.06em",
        padding: "12px 18px",
        border: "var(--nm-border-button)",
        background: primary ? "var(--nm-green)" : "var(--nm-black)",
        color: primary ? "var(--nm-black)" : "var(--nm-off-white)",
        boxShadow: primary ? "var(--nm-shadow)" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

// budget bar — green only when over the cap
export function ProgressBar({ label, spent, cap }: { label: string; spent: number; cap: number }) {
  const over = spent > cap;
  const pct = Math.min(100, Math.round((spent / cap) * 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
        <span>
          {label}{" "}
          {over && <span style={{ background: "var(--nm-black)", color: "var(--nm-off-white)", padding: "2px 6px", fontSize: 11 }}>ACIMA</span>}
        </span>
        <span>{formatBRL(spent)} / {formatBRL(cap)}</span>
      </div>
      <div style={{ height: 16, border: "var(--nm-border-row)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: over ? "var(--nm-green)" : "var(--nm-black)" }} />
      </div>
    </div>
  );
}

export function Badge({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      style={{
        border: "var(--nm-border-row)",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.1em",
        padding: "2px 6px",
        background: dark ? "var(--nm-black)" : "transparent",
        color: dark ? "var(--nm-off-white)" : "var(--nm-black)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <header className="nm-page-header">
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="nm-eyebrow">{eyebrow}</span>
        <h1 className="nm-h1">{title}</h1>
      </div>
      {action}
    </header>
  );
}
