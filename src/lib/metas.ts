import { resumoPorCategoria, totalTeto, type Dados } from "./data";

export type Meta = {
  id: string;
  nome: string;
  alvo: number; // quanto quer juntar
  guardado: number; // quanto já juntou
  prazo: string; // yyyy-mm
  obs: string;
};

const KEY = "numerus.metas";

export function carregarMetas(): Meta[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Meta[]) : [];
  } catch {
    return [];
  }
}

export function salvarMetas(metas: Meta[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(metas));
  } catch {
    // storage unavailable (private mode) — goals just won't persist
  }
}

// whole months from the current month until the deadline, at least 1
export function mesesAte(prazo: string, hoje = new Date()): number {
  const [ano, mes] = prazo.split("-").map(Number);
  const diff = (ano - hoje.getFullYear()) * 12 + (mes - 1 - hoje.getMonth());
  return Math.max(1, diff);
}

// a flexible category can be cut by at most this share of its cap
const CORTE_MAX = 0.3;

export type Corte = { label: string; cap: number; novoCap: number };

export type Plano = {
  restante: number;
  meses: number;
  mensal: number; // quanto guardar por mês
  sobra: number; // renda - tetos - outras metas
  estouros: { label: string; excesso: number }[]; // categorias acima do teto agora
  cortes: Corte[]; // sugestão de redução de teto
  viavel: boolean;
  mesesSugeridos?: number; // prazo realista quando nem os cortes bastam
};

// how to reach a goal using the gap between income and the category caps.
// `comprometido` = monthly amount already reserved for other goals.
export function planejar(meta: Meta, comprometido: number, d: Dados): Plano {
  const restante = Math.max(0, meta.alvo - meta.guardado);
  const meses = mesesAte(meta.prazo);
  const mensal = restante / meses;
  const sobra = Math.max(0, d.renda - totalTeto(d) - comprometido);

  const categorias = resumoPorCategoria(d);
  const estouros = categorias
    .filter((c) => c.spent > c.cap)
    .map((c) => ({ label: c.label, excesso: c.spent - c.cap }));

  if (restante === 0 || mensal <= sobra) {
    return { restante, meses, mensal, sobra, estouros, cortes: [], viavel: true };
  }

  // spread the deficit across flexible caps, proportional to each cap
  const deficit = mensal - sobra;
  const flexiveis = categorias.filter((c) => !c.fixa);
  const capFlex = flexiveis.reduce((s, c) => s + c.cap, 0);
  const maxCorte = capFlex * CORTE_MAX;
  const corteTotal = Math.min(deficit, maxCorte);
  const cortes = flexiveis
    .map((c) => {
      const corte = Math.ceil((corteTotal * c.cap) / capFlex / 10) * 10;
      return { label: c.label, cap: c.cap, novoCap: Math.max(0, c.cap - corte) };
    })
    .filter((c) => c.novoCap < c.cap);

  const viavel = deficit <= maxCorte;
  const mesesSugeridos = viavel ? undefined : Math.ceil(restante / (sobra + maxCorte || 1));
  return { restante, meses, mensal, sobra, estouros, cortes, viavel, mesesSugeridos };
}
