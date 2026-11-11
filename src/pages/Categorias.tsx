import SeletorPeriodo from "../components/SeletorPeriodo";
import { Badge, Card, KpiTile, PageHeader } from "../components/ui";
import { formatBRL } from "../lib/currency";
import { gastoPorMes, resumoPorCategoria, totalGasto, totalPeriodo, totalTeto, type ResumoCategoria } from "../lib/data";
import { useFinancas } from "../lib/financas";

const fmtData = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);

// horizontal bars: spend per category (black, green when over cap) + cap tick
function GraficoCategorias({ dados, total }: { dados: ResumoCategoria[]; total: number }) {
  const W = 820;
  const LABEL_W = 150;
  const VALUE_W = 190;
  const ROW = 56;
  const BAR = 26;
  const plotW = W - LABEL_W - VALUE_W;
  const max = Math.max(1, ...dados.map((d) => Math.max(d.spent, d.cap)));
  const x = (v: number) => LABEL_W + (v / max) * plotW;
  const H = dados.length * ROW + 30;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Gasto por categoria comparado ao teto" style={{ fontFamily: "var(--nm-font)", display: "block" }}>
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={x(max * f)} x2={x(max * f)} y1={0} y2={H - 24} stroke="var(--nm-grid)" strokeWidth={2} />
          <text x={x(max * f)} y={H - 6} fontSize={11} fontWeight={700} textAnchor="middle" fill="var(--nm-black)">
            {Math.round(max * f)}
          </text>
        </g>
      ))}
      {dados.map((d, i) => {
        const y = i * ROW + (ROW - BAR) / 2;
        const over = d.spent > d.cap;
        const pct = total ? Math.round((d.spent / total) * 100) : 0;
        return (
          <g key={d.id}>
            <title>{`${d.label}: ${formatBRL(d.spent)} de ${formatBRL(d.cap)} (${pct}% do total)`}</title>
            <text x={0} y={y + BAR / 2 + 5} fontSize={13} fontWeight={800} fill="var(--nm-black)">{d.label}</text>
            <rect x={LABEL_W} y={y} width={x(d.cap) - LABEL_W} height={BAR} fill="none" stroke="var(--nm-black)" strokeWidth={3} />
            <rect x={LABEL_W} y={y} width={Math.max(0, x(d.spent) - LABEL_W)} height={BAR} fill={over ? "var(--nm-green)" : "var(--nm-black)"} stroke="var(--nm-black)" strokeWidth={3} />
            {/* cap tick */}
            <rect x={x(d.cap) - 3} y={y - 8} width={6} height={BAR + 16} fill="var(--nm-black)" />
            <text x={W - VALUE_W + 14} y={y + BAR / 2 + 5} fontSize={13} fontWeight={700} fill="var(--nm-black)">
              {formatBRL(d.spent)} · {pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Categorias() {
  const { dados: fonte } = useFinancas();
  const dados = resumoPorCategoria(fonte);
  const total = totalGasto(fonte);
  const media = fonte.meses > 1;
  const porMes = gastoPorMes(fonte);
  const acima = dados.filter((d) => d.spent > d.cap);
  const maior = dados[0];

  return (
    <>
      <PageHeader eyebrow={fonte.periodo} title="CATEGORIAS" action={<SeletorPeriodo />} />
      <div className="nm-content">
        <div className="nm-row">
          <KpiTile label={media ? "TOTAL NO PERÍODO" : "TOTAL GASTO"} value={formatBRL(totalPeriodo(fonte))} variant="dark" />
          {media && <KpiTile label={`MÉDIA / MÊS (${String(fonte.meses).replace(".", ",")} MESES)`} value={formatBRL(total)} />}
          <KpiTile label="MAIOR CATEGORIA" value={maior ? maior.label : "—"} />
          <KpiTile label="ACIMA DO TETO" value={String(acima.length)} variant={acima.length ? "accent" : "light"} />
        </div>

        <Card title="GASTOS POR CATEGORIA" meta={media ? "MÉDIA/MÊS · % DO TOTAL" : "GASTO · % DO TOTAL"}>
          <GraficoCategorias dados={dados} total={total} />
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14, fontSize: 12, fontWeight: 700 }}>
            <span><Swatch fill="var(--nm-black)" /> GASTO</span>
            <span><Swatch fill="var(--nm-green)" /> ACIMA DO TETO</span>
            <span><Swatch fill="none" /> TETO</span>
          </div>
        </Card>

        {porMes.length > 1 && (
          <Card title="GASTO POR MÊS" meta="TOTAL · TETO SOMADO">
            <GraficoMensal meses={porMes} teto={totalTeto(fonte)} />
          </Card>
        )}

        <Card title="AGRUPAMENTO" meta={`${dados.reduce((s, d) => s + d.transacoes.length, 0)} LANÇAMENTOS`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dados.map((d) => (
              <details key={d.id} className="nm-cluster" style={{ border: "var(--nm-border-row)" }}>
                <summary style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 12px", fontWeight: 800 }}>
                  <span>
                    ▸ {d.label} <span style={{ fontWeight: 500 }}>({d.transacoes.length})</span>{" "}
                    {d.spent > d.cap && <Badge dark>ACIMA</Badge>}
                  </span>
                  <span>{formatBRL(d.total)}</span>
                </summary>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "var(--nm-border-row)" }}>
                  {d.transacoes.map((t) => (
                    <li key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--nm-grid)" }}>
                      <span>
                        <span style={{ background: "var(--nm-black)", color: "var(--nm-off-white)", fontWeight: 800, padding: "2px 6px", marginRight: 10, fontSize: 12 }}>{fmtData(t.data)}</span>
                        {t.descricao}
                      </span>
                      <span style={{ fontWeight: 700 }}>{formatBRL(t.valor)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// vertical bars: total spend per calendar month, with the summed caps as a reference line
function GraficoMensal({ meses, teto }: { meses: { mes: string; total: number }[]; teto: number }) {
  const W = 820;
  const H = 260;
  const TOP = 24;
  const BASE = H - 34;
  const max = Math.max(teto, ...meses.map((m) => m.total)) * 1.08;
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const slot = W / meses.length;
  const bar = Math.min(80, slot * 0.6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Gasto por mês comparado ao teto total" style={{ fontFamily: "var(--nm-font)", display: "block" }}>
      <line x1={0} x2={W} y1={BASE} y2={BASE} stroke="var(--nm-black)" strokeWidth={3} />
      {meses.map((m, i) => {
        const over = m.total > teto;
        const cx = slot * i + slot / 2;
        const [ano, mm] = m.mes.split("-");
        return (
          <g key={m.mes}>
            <title>{`${MESES[Number(mm) - 1]}/${ano}: ${formatBRL(m.total)}`}</title>
            <rect x={cx - bar / 2} y={y(m.total)} width={bar} height={BASE - y(m.total)} fill={over ? "var(--nm-green)" : "var(--nm-black)"} stroke="var(--nm-black)" strokeWidth={3} />
            <text x={cx} y={y(m.total) - 6} fontSize={11} fontWeight={700} textAnchor="middle" fill="var(--nm-black)">{Math.round(m.total)}</text>
            <text x={cx} y={H - 12} fontSize={12} fontWeight={800} textAnchor="middle" fill="var(--nm-black)">{MESES[Number(mm) - 1]}/{ano.slice(2)}</text>
          </g>
        );
      })}
      <line x1={0} x2={W} y1={y(teto)} y2={y(teto)} stroke="var(--nm-black)" strokeWidth={3} strokeDasharray="10 6" />
      <text x={W - 4} y={y(teto) - 6} fontSize={11} fontWeight={800} textAnchor="end" fill="var(--nm-black)">TETO {Math.round(teto)}</text>
    </svg>
  );
}

function Swatch({ fill }: { fill: string }) {
  return <span style={{ display: "inline-block", width: 14, height: 14, verticalAlign: "-2px", marginRight: 6, background: fill === "none" ? "transparent" : fill, border: "3px solid var(--nm-black)" }} />;
}
