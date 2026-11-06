import { Button, Card, KpiTile, PageHeader, ProgressBar } from "../components/ui";
import { formatBRL } from "../lib/currency";

// sample data until the api exists
const CATEGORIAS = [
  { label: "MERCADO", spent: 820, cap: 1000 },
  { label: "MORADIA", spent: 1450, cap: 1450 },
  { label: "TRANSPORTE", spent: 310, cap: 400 },
  { label: "LAZER", spent: 385, cap: 350 },
  { label: "SAÚDE", spent: 150, cap: 300 },
];

export default function Painel() {
  return (
    <>
      <PageHeader eyebrow="NOVEMBRO / SEMANA 1" title="PAINEL" action={<Button>+ NOVO GASTO</Button>} />
      <div className="nm-content">
        <div className="nm-row">
          <KpiTile label="DISPONÍVEL ATÉ 30/11" value={formatBRL(1284.5)} variant="dark" />
          <KpiTile label="GASTO EM NOVEMBRO" value={formatBRL(3115.2)} />
          <KpiTile label="CONTAS A VENCER (7 DIAS)" value={formatBRL(642)} />
          <KpiTile label="META RESERVA" value="62%" variant="accent" />
        </div>
        <Card title="ORÇAMENTO POR CATEGORIA" meta="GASTO / TETO">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CATEGORIAS.map((c) => (
              <ProgressBar key={c.label} {...c} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
