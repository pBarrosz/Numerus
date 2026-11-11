import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Badge, Button, Card, PageHeader } from "../components/ui";
import { formatBRL } from "../lib/currency";
import { useFinancas } from "../lib/financas";
import { carregarMetas, planejar, salvarMetas, type Meta, type Plano } from "../lib/metas";

function mesAtual(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const fmtPrazo = (p: string) => p.slice(5, 7) + "/" + p.slice(0, 4);

const VAZIO = { nome: "", alvo: "", guardado: "", prazo: mesAtual(12), obs: "" };

export default function Metas() {
  const { dados } = useFinancas();
  const [metas, setMetas] = useState<Meta[]>(carregarMetas);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(VAZIO);

  useEffect(() => salvarMetas(metas), [metas]);

  const alvo = Number(form.alvo);
  const valido = form.nome.trim() !== "" && alvo > 0 && form.prazo !== "";

  function criar(e: FormEvent) {
    e.preventDefault();
    if (!valido) return;
    const nova: Meta = {
      id: crypto.randomUUID(),
      nome: form.nome.trim(),
      alvo,
      guardado: Math.max(0, Number(form.guardado) || 0),
      prazo: form.prazo,
      obs: form.obs.trim(),
    };
    setMetas((m) => [...m, nova]);
    setForm(VAZIO);
    setAberto(false);
  }

  const remover = (id: string) => setMetas((m) => m.filter((x) => x.id !== id));
  const depositar = (id: string, valor: number) =>
    setMetas((m) => m.map((x) => (x.id === id ? { ...x, guardado: Math.max(0, x.guardado + valor) } : x)));

  // earlier goals reserve their monthly amount first
  let comprometido = 0;
  const planos = metas.map((m) => {
    const p = planejar(m, comprometido, dados);
    comprometido += p.mensal;
    return p;
  });

  return (
    <>
      <PageHeader eyebrow={dados.periodo} title="METAS" action={<Button onClick={() => setAberto((a) => !a)}>{aberto ? "CANCELAR" : "+ NOVA META"}</Button>} />
      <div className="nm-content">
        {aberto && (
          <Card title="NOVA META">
            <form onSubmit={criar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="nm-row" style={{ gap: 16 }}>
                <Campo label="NOME">
                  <input className="nm-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Reserva de emergência" autoFocus />
                </Campo>
                <Campo label="QUANTO QUER JUNTAR (R$)">
                  <input className="nm-input" type="number" min={1} step="0.01" value={form.alvo} onChange={(e) => setForm({ ...form, alvo: e.target.value })} placeholder="10000" />
                </Campo>
                <Campo label="JÁ GUARDADO (R$)">
                  <input className="nm-input" type="number" min={0} step="0.01" value={form.guardado} onChange={(e) => setForm({ ...form, guardado: e.target.value })} placeholder="0" />
                </Campo>
                <Campo label="PRAZO">
                  <input className="nm-input" type="month" min={mesAtual(1)} value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
                </Campo>
              </div>
              <Campo label="OBSERVAÇÕES">
                <textarea className="nm-input" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} placeholder="Por que essa meta importa, detalhes, links…" />
              </Campo>
              <div>
                <Button type="submit" disabled={!valido}>CRIAR META</Button>
              </div>
            </form>
          </Card>
        )}

        {metas.length === 0 && !aberto ? (
          <Card title="NENHUMA META AINDA">
            <p style={{ marginTop: 0 }}>Crie uma meta e o NUMERUS calcula quanto guardar por mês e onde cortar, a partir dos seus gastos e tetos por categoria.</p>
            <Button onClick={() => setAberto(true)}>+ CRIAR PRIMEIRA META</Button>
          </Card>
        ) : (
          <div className="nm-cards">
            {metas.map((m, i) => (
              <CardMeta key={m.id} meta={m} plano={planos[i]} onRemover={() => remover(m.id)} onDepositar={(v) => depositar(m.id, v)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="nm-field">
      <span className="nm-eyebrow">{label}</span>
      {children}
    </label>
  );
}

function CardMeta({ meta, plano, onRemover, onDepositar }: { meta: Meta; plano: Plano; onRemover: () => void; onDepositar: (v: number) => void }) {
  const [valor, setValor] = useState("");
  const pct = Math.min(100, Math.round((meta.guardado / meta.alvo) * 100));
  const concluida = plano.restante === 0;

  return (
    <section style={{ border: "var(--nm-border-card)", background: "var(--nm-off-white)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: "4px solid var(--nm-black)", padding: "12px 16px", background: concluida ? "var(--nm-green)" : "transparent" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, letterSpacing: "0.04em" }}>{meta.nome.toUpperCase()}</h2>
        <button className="nm-icon-btn" onClick={onRemover} aria-label={`Excluir meta ${meta.nome}`}>EXCLUIR</button>
      </header>

      <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
            <span>{formatBRL(meta.guardado)} / {formatBRL(meta.alvo)}</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 16, border: "var(--nm-border-row)" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: concluida ? "var(--nm-green)" : "var(--nm-black)" }} />
          </div>
          <div className="nm-eyebrow" style={{ marginTop: 8 }}>PRAZO {fmtPrazo(meta.prazo)} · {plano.meses} {plano.meses === 1 ? "MÊS" : "MESES"}</div>
        </div>

        {concluida ? (
          <p style={{ margin: 0, fontWeight: 800 }}>META ATINGIDA.</p>
        ) : (
          <ComoAtingir plano={plano} />
        )}

        {meta.obs && (
          <div>
            <span className="nm-eyebrow">OBSERVAÇÕES</span>
            <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{meta.obs}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = Number(valor);
            if (v) onDepositar(v);
            setValor("");
          }}
          style={{ display: "flex", gap: 10 }}
        >
          <input className="nm-input" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Valor guardado (R$)" aria-label="Valor a depositar" />
          <Button type="submit" variant="secondary" disabled={!Number(valor)}>DEPOSITAR</Button>
        </form>
      </div>
    </section>
  );
}

function ComoAtingir({ plano }: { plano: Plano }) {
  return (
    <div style={{ border: "var(--nm-border-row)", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span className="nm-eyebrow">COMO ATINGIR</span>
        <Badge dark={!plano.viavel}>{plano.viavel ? (plano.cortes.length ? "COM AJUSTES" : "NO RITMO") : "PRAZO APERTADO"}</Badge>
      </div>

      <p style={{ margin: 0 }}>
        Guarde <strong>{formatBRL(plano.mensal)}</strong> por mês. Respeitando os tetos, sobram <strong>{formatBRL(plano.sobra)}</strong> por mês
        {plano.cortes.length === 0 ? " — isso já cobre a meta." : "."}
      </p>

      {plano.cortes.length > 0 && (
        <div>
          <p style={{ margin: "0 0 6px" }}>Para fechar a conta, reduza os tetos:</p>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            {plano.cortes.map((c) => (
              <li key={c.label}>
                <strong>{c.label}</strong>: {formatBRL(c.cap)} → {formatBRL(c.novoCap)} (−{formatBRL(c.cap - c.novoCap)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {!plano.viavel && plano.mesesSugeridos && (
        <p style={{ margin: 0, fontWeight: 700 }}>
          Mesmo com os cortes não fecha no prazo. Prazo realista: {plano.mesesSugeridos} meses.
        </p>
      )}

      {plano.estouros.length > 0 && (
        <p style={{ margin: 0 }}>
          Atenção: {plano.estouros.map((e) => `${e.label} está ${formatBRL(e.excesso)} acima do teto`).join("; ")}. Voltar ao teto é o primeiro passo.
        </p>
      )}
    </div>
  );
}
