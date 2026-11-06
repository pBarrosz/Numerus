import { Link } from "react-router-dom";
import Mark from "../components/Mark";

// public landing — placeholder, build from the home artboard
export default function Home() {
  return (
    <div className="nm-shell" style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Mark size={100} stroke={5} />
        <div style={{ width: 8, height: 84, background: "var(--nm-black)" }} />
        <span style={{ fontSize: "var(--nm-size-hero)", fontWeight: 800, letterSpacing: "var(--nm-tracking-display)" }}>NUMERUS</span>
      </div>
      <Link
        to="/app"
        style={{ textDecoration: "none", background: "var(--nm-green)", border: "var(--nm-border-button)", padding: "12px 18px", fontWeight: 800, letterSpacing: "0.06em", boxShadow: "var(--nm-shadow)" }}
      >
        ENTRAR NO APP ↗
      </Link>
    </div>
  );
}
