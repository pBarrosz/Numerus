// pluggy api client — runs server-side only (inside the vite dev/preview server).
// the client secret never reaches the browser; the frontend only gets
// short-lived connect tokens and already-fetched data.
import type { Connect, Plugin } from "vite";

const API = "https://api.pluggy.ai";

type Credenciais = { clientId: string; clientSecret: string };

let cache: { apiKey: string; expira: number } | null = null;

async function apiKey({ clientId, clientSecret }: Credenciais): Promise<string> {
  if (cache && cache.expira > Date.now()) return cache.apiKey;
  const res = await fetch(`${API}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!res.ok) throw new Error(`Pluggy /auth falhou (${res.status}). Confira PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET.`);
  const { apiKey } = (await res.json()) as { apiKey: string };
  // api key lasts 2h; refresh a bit earlier
  cache = { apiKey, expira: Date.now() + 110 * 60 * 1000 };
  return apiKey;
}

async function pluggy<T>(cred: Credenciais, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-API-KEY": await apiKey(cred), ...init.headers },
  });
  if (!res.ok) throw new Error(`Pluggy ${path.split("?")[0]} falhou (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

type Pagina<T> = { results: T[] };

// GET /v2/transactions — cursor pagination. `next` is a ready-to-use query
// string for the next page (or null when done).
async function transacoes(cred: Credenciais, accountId: string, from: string, to: string) {
  const todas: unknown[] = [];
  let path: string | null = `/v2/transactions?${new URLSearchParams({ accountId, dateFrom: from, dateTo: to })}`;
  for (let guarda = 0; path && guarda < 50; guarda++) {
    const r: { results: unknown[]; next?: string | null } = await pluggy(cred, path);
    todas.push(...r.results);
    const next = r.next;
    if (!next) path = null;
    else if (next.startsWith("/")) path = next;
    else if (next.startsWith("?")) path = `/v2/transactions${next}`;
    // a bare cursor value: keep the filters and add `after`
    else path = `/v2/transactions?${new URLSearchParams({ accountId, dateFrom: from, dateTo: to, after: next })}`;
  }
  return todas;
}

function json(res: Parameters<Connect.NextHandleFunction>[1], status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function lerCorpo(req: Connect.IncomingMessage): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// routes:
//   GET  /api/pluggy/status              → { configurado }
//   POST /api/pluggy/connect-token       → { accessToken }   body: { itemId? }
//   GET  /api/pluggy/dados?itemId&from&to → { contas, transacoes }
function middleware(cred: Credenciais | null): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = new URL(req.url ?? "", "http://localhost");
    if (!url.pathname.startsWith("/api/pluggy/")) return next();
    const rota = url.pathname.slice("/api/pluggy/".length);

    if (rota === "status") return json(res, 200, { configurado: cred !== null });
    if (!cred) return json(res, 503, { erro: "Pluggy não configurado. Crie o arquivo .env (veja .env.example)." });

    try {
      if (rota === "connect-token" && req.method === "POST") {
        const { itemId } = await lerCorpo(req);
        const body = typeof itemId === "string" ? { itemId } : {};
        const { accessToken } = await pluggy<{ accessToken: string }>(cred, "/connect_token", { method: "POST", body: JSON.stringify(body) });
        return json(res, 200, { accessToken });
      }

      if (rota === "dados" && req.method === "GET") {
        const itemId = url.searchParams.get("itemId");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        if (!itemId || !from || !to) return json(res, 400, { erro: "itemId, from e to são obrigatórios" });
        const contas = (await pluggy<Pagina<{ id: string }>>(cred, `/accounts?itemId=${encodeURIComponent(itemId)}`)).results;
        const porConta = await Promise.all(contas.map((c) => transacoes(cred, c.id, from, to)));
        return json(res, 200, { contas, transacoes: porConta.flat() });
      }

      return json(res, 404, { erro: "rota desconhecida" });
    } catch (e) {
      return json(res, 502, { erro: e instanceof Error ? e.message : String(e) });
    }
  };
}

export function pluggyApi(env: Record<string, string>): Plugin {
  const cred =
    env.PLUGGY_CLIENT_ID && env.PLUGGY_CLIENT_SECRET
      ? { clientId: env.PLUGGY_CLIENT_ID, clientSecret: env.PLUGGY_CLIENT_SECRET }
      : null;
  return {
    name: "numerus-pluggy-api",
    configureServer(server) {
      server.middlewares.use(middleware(cred));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(cred));
    },
  };
}
