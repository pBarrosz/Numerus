import { useFinancas } from "../lib/financas";
import { PERIODOS, rotuloPeriodo } from "../lib/pluggy";

// segmented control for the pluggy analysis window; hidden on sample data
export default function SeletorPeriodo() {
  const { dados, dias, setDias, estado } = useFinancas();
  if (dados.origem !== "pluggy" && estado !== "carregando") return null;

  return (
    <div role="group" aria-label="Período da análise" style={{ display: "flex", border: "var(--nm-border-button)" }}>
      {PERIODOS.map((p, i) => {
        const ativo = p === dias;
        return (
          <button
            key={p}
            type="button"
            aria-pressed={ativo}
            disabled={estado === "carregando"}
            onClick={() => setDias(p)}
            style={{
              fontFamily: "var(--nm-font)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.06em",
              padding: "8px 12px",
              border: "none",
              borderLeft: i ? "var(--nm-border-row)" : "none",
              background: ativo ? "var(--nm-green)" : "var(--nm-off-white)",
              color: "var(--nm-black)",
              cursor: estado === "carregando" ? "wait" : "pointer",
            }}
          >
            {rotuloPeriodo(p)}
          </button>
        );
      })}
    </div>
  );
}
