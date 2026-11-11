import { useState } from "react";
import { Badge, Card, PageHeader } from "../components/ui";
import { formatBRL } from "../lib/currency";
import { useFinancas } from "../lib/financas";

const fmtData = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);

// every spend in the period, newest first, filterable by category
export default function Transacoes() {
  const { dados } = useFinancas();
  const [filtro, setFiltro] = useState("todas");
  const labels = new Map(dados.categorias.map((c) => [c.id, c.label]));

  const lista = dados.transacoes
    .filter((t) => filtro === "todas" || t.categoria === filtro)
    .sort((a, b) => b.data.localeCompare(a.data));
  const total = lista.reduce((s, t) => s + t.valor, 0);

  return (
    <>
      <PageHeader eyebrow={dados.periodo} title="TRANSAÇÕES" />
      <div className="nm-content">
        <div className="nm-row" style={{ alignItems: "end" }}>
          <label className="nm-field" style={{ flex: "0 1 260px" }}>
            <span className="nm-eyebrow">CATEGORIA</span>
            <select className="nm-input" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todas">TODAS</option>
              {dados.categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          {dados.origem === "pluggy" ? <Badge dark>VIA PLUGGY</Badge> : <Badge>DADOS DE EXEMPLO</Badge>}
        </div>

        <Card title="LANÇAMENTOS" meta={`${lista.length} · ${formatBRL(total)}`}>
          {lista.length === 0 ? (
            <p style={{ margin: 0 }}>Nenhum gasto neste período.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {lista.map((t) => (
                <li key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--nm-grid)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ background: "var(--nm-black)", color: "var(--nm-off-white)", fontWeight: 800, padding: "2px 6px", fontSize: 12 }}>{fmtData(t.data)}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.descricao}</span>
                    <Badge>{labels.get(t.categoria) ?? "OUTROS"}</Badge>
                  </span>
                  <span style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{formatBRL(t.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
