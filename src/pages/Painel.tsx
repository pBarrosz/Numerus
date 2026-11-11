import { Link } from "react-router-dom";
import ConexaoPluggy from "../components/ConexaoPluggy";
import { Badge, Card, KpiTile, PageHeader, ProgressBar } from "../components/ui";
import { formatBRL } from "../lib/currency";
import { resumoPorCategoria, totalGasto, totalTeto } from "../lib/data";
import { useFinancas } from "../lib/financas";
import { carregarMetas } from "../lib/metas";

// only the essentials: balance, spend vs cap, main goal and what needs attention
export default function Painel() {
  const { dados } = useFinancas();
  const gasto = totalGasto(dados);
  const media = dados.meses > 1;
  const teto = totalTeto(dados);
  const atencao = resumoPorCategoria(dados).filter((c) => c.spent >= c.cap * 0.9);

  const meta = carregarMetas()[0];
  const metaPct = meta ? Math.min(100, Math.round((meta.guardado / meta.alvo) * 100)) : null;

  return (
    <>
      <PageHeader eyebrow={dados.periodo} title="PAINEL" />
      <div className="nm-content">
        <div className="nm-row">
          <KpiTile label={dados.origem === "pluggy" ? (media ? "ENTRADAS − GASTOS / MÊS" : "ENTRADAS − GASTOS") : "SALDO DO MÊS"} value={formatBRL(dados.renda - gasto)} variant="dark" />
          <KpiTile label={`${media ? "GASTO MÉDIO/MÊS" : "GASTO"} · TETO ${formatBRL(teto)}`} value={formatBRL(gasto)} />
          <KpiTile label={meta ? `META: ${meta.nome.toUpperCase()}` : "META"} value={metaPct === null ? "—" : `${metaPct}%`} variant="accent" />
        </div>

        <Card title="PRECISA DE ATENÇÃO" meta={`${atencao.length} CATEGORIA(S)${media ? " · MÉDIA/MÊS" : ""}`}>
          {atencao.length === 0 ? (
            <p style={{ margin: 0, fontWeight: 700 }}>Tudo dentro do teto. Bom trabalho.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {atencao.map((c) => (
                <ProgressBar key={c.id} label={c.label} spent={c.spent} cap={c.cap} />
              ))}
            </div>
          )}
          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/app/categorias" style={{ fontWeight: 800 }}>VER TODAS AS CATEGORIAS ↗</Link>
            {!meta && <Link to="/app/metas" style={{ fontWeight: 800 }}>CRIAR UMA META ↗</Link>}
          </div>
        </Card>

        <ConexaoPluggy />

        {dados.origem === "exemplo" && <div><Badge>DADOS DE EXEMPLO</Badge></div>}
      </div>
    </>
  );
}
