import { useState } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { useFinancas } from "../lib/financas";
import { criarConnectToken, rotuloPeriodo } from "../lib/pluggy";
import SeletorPeriodo from "./SeletorPeriodo";
import { Badge, Button, Card } from "./ui";
import { formatBRL } from "../lib/currency";

// connect / refresh / disconnect a bank through the pluggy connect widget (sandbox)
export default function ConexaoPluggy() {
  const { estado, erro, configurado, itemId, dados, dias, conectar, desconectar, atualizar } = useFinancas();
  const [token, setToken] = useState<string | null>(null);
  const [modoUpdate, setModoUpdate] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const [erroWidget, setErroWidget] = useState<string | null>(null);

  async function abrir(update: boolean) {
    setAbrindo(true);
    setErroWidget(null);
    try {
      setToken(await criarConnectToken(update && itemId ? itemId : undefined));
      setModoUpdate(update);
    } catch (e) {
      setErroWidget(e instanceof Error ? e.message : String(e));
    } finally {
      setAbrindo(false);
    }
  }

  const conectado = estado === "conectado";

  return (
    <Card title="CONEXÃO BANCÁRIA" meta="PLUGGY · SANDBOX">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Badge dark={conectado}>
            {estado === "carregando" ? "CARREGANDO…" : conectado ? "CONECTADO" : estado === "erro" ? "ERRO" : "DADOS DE EXEMPLO"}
          </Badge>
          {conectado && <span style={{ fontWeight: 700 }}>{dados.transacoes.length} gastos · últimos {rotuloPeriodo(dias).toLowerCase()}</span>}
          <span style={{ marginLeft: "auto" }}><SeletorPeriodo /></span>
        </div>

        {!configurado && (
          <p style={{ margin: 0 }}>
            Para conectar, crie o arquivo <code>.env</code> com <code>PLUGGY_CLIENT_ID</code> e <code>PLUGGY_CLIENT_SECRET</code> (veja <code>.env.example</code>) e reinicie o <code>npm run dev</code>.
          </p>
        )}

        {configurado && !itemId && (
          <p style={{ margin: 0 }}>
            No widget, escolha o conector <strong>Pluggy Bank</strong> (sandbox) e entre com usuário <code>user-ok</code> e senha <code>password-ok</code>. Se pedir código, use <code>123456</code>.
          </p>
        )}

        {conectado && dados.contas.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, border: "var(--nm-border-row)" }}>
            {dados.contas.map((c) => (
              <li key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 12px", borderBottom: "1px solid var(--nm-grid)" }}>
                <span style={{ fontWeight: 700 }}>
                  {c.nome} <span style={{ fontWeight: 500 }}>· {c.tipo === "CREDIT" ? "CARTÃO" : "CONTA"}</span>
                </span>
                <span style={{ fontWeight: 800 }}>{formatBRL(c.saldo)}</span>
              </li>
            ))}
          </ul>
        )}

        {(erro || erroWidget) && (
          <p style={{ margin: 0, fontWeight: 700 }}>Erro: {erroWidget ?? erro}</p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {!itemId ? (
            <Button onClick={() => abrir(false)} disabled={!configurado || abrindo}>
              {abrindo ? "ABRINDO…" : "CONECTAR BANCO"}
            </Button>
          ) : (
            <>
              <Button onClick={atualizar} disabled={estado === "carregando"}>ATUALIZAR DADOS</Button>
              <Button variant="secondary" onClick={() => abrir(true)} disabled={!configurado || abrindo}>RECONECTAR</Button>
              <Button variant="secondary" onClick={desconectar}>DESCONECTAR</Button>
            </>
          )}
        </div>
      </div>

      {token && (
        <PluggyConnect
          connectToken={token}
          includeSandbox
          language="pt"
          updateItem={modoUpdate && itemId ? itemId : undefined}
          onSuccess={({ item }) => {
            setToken(null);
            conectar(item.id);
          }}
          onError={({ message }) => setErroWidget(message)}
          onClose={() => setToken(null)}
        />
      )}
    </Card>
  );
}
