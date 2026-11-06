import { Link, NavLink, Outlet } from "react-router-dom";
import Mark from "./Mark";

const NAV = [
  { to: "/app", label: "PAINEL", end: true },
  { to: "/app/transacoes", label: "TRANSAÇÕES" },
  { to: "/app/metas", label: "METAS" },
  { to: "/app/assistente", label: "ASSISTENTE" },
];

export default function AppShell() {
  return (
    <div className="nm-shell">
      <aside className="nm-sidebar">
        <Link to="/app" className="nm-brand" aria-label="NUMERUS, painel">
          <Mark size={40} />
          NUMERUS
        </Link>
        <nav className="nm-nav" aria-label="App">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="nm-main">
        <Outlet />
      </main>
    </div>
  );
}
