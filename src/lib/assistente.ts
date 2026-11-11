import { formatBRL } from "./currency";
import { resumoPorCategoria, totalGasto, totalTeto, type Dados } from "./data";
import { carregarMetas, planejar } from "./metas";

export type Mensagem = { id: string; autor: "user" | "bot"; texto: string };

// local stand-in for the AI backend: answers from the app's own data.
// swap this function for a call to a real model api — the chat ui only
// depends on its signature.
export async function responder(historico: Mensagem[], d: Dados): Promise<string> {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
  const pergunta = historico[historico.length - 1]?.texto ?? "";
  const q = pergunta
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const cats = resumoPorCategoria(d);
  const gasto = totalGasto(d);
  const teto = totalTeto(d);

  const cat = cats.find((c) => q.includes(c.label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")));
  if (cat) {
    const top = [...cat.transacoes].sort((a, b) => b.valor - a.valor).slice(0, 3);
    const status = cat.spent > cat.cap ? `${formatBRL(cat.spent - cat.cap)} acima do teto` : `${formatBRL(cat.cap - cat.spent)} livres até o teto`;
    return `${cat.label}: ${formatBRL(cat.spent)} de ${formatBRL(cat.cap)} (${status}).\nMaiores lançamentos:\n${top.map((t) => `• ${t.descricao} — ${formatBRL(t.valor)}`).join("\n")}`;
  }

  if (/meta|guardar|poupar|economizar|juntar/.test(q)) {
    const metas = carregarMetas();
    if (metas.length === 0) return "Você ainda não tem metas. Crie uma na aba METAS e eu te mostro quanto guardar por mês e onde cortar.";
    let comprometido = 0;
    const linhas = metas.map((m) => {
      const p = planejar(m, comprometido, d);
      comprometido += p.mensal;
      const extra = p.cortes.length ? ` Sugestão: ${p.cortes.map((c) => `${c.label} −${formatBRL(c.cap - c.novoCap)}`).join(", ")}.` : "";
      return `• ${m.nome}: faltam ${formatBRL(p.restante)} → ${formatBRL(p.mensal)}/mês.${extra}`;
    });
    return `Suas metas:\n${linhas.join("\n")}`;
  }

  if (/acima|estour|passou|teto|limite/.test(q)) {
    const acima = cats.filter((c) => c.spent > c.cap);
    if (acima.length === 0) return "Nenhuma categoria passou do teto este mês.";
    return `Categorias acima do teto:\n${acima.map((c) => `• ${c.label}: ${formatBRL(c.spent - c.cap)} acima`).join("\n")}\nTente segurar esses gastos até o fim do mês.`;
  }

  if (/onde|cortar|reduzir|maior|mais gast/.test(q)) {
    const flex = cats.filter((c) => !c.fixa).slice(0, 2);
    return `Seus maiores gastos variáveis são ${flex.map((c) => `${c.label} (${formatBRL(c.spent)})`).join(" e ")}. É onde um corte rende mais. Moradia é custo fixo, então não entra na conta.`;
  }

  if (/conta|banco|pluggy|conect/.test(q)) {
    if (d.origem === "exemplo") return "Você está vendo dados de exemplo. Conecte um banco pelo Pluggy (sandbox) no PAINEL para eu analisar movimentações de verdade.";
    const contas = d.contas.map((c) => `• ${c.nome} (${c.tipo === "CREDIT" ? "cartão" : "conta"}): ${formatBRL(c.saldo)}`).join("\n");
    return `Contas conectadas via Pluggy:\n${contas}\n${d.transacoes.length} gastos analisados (${d.periodo.toLowerCase()}).`;
  }

  if (/gast|quanto|saldo|sobr|resumo|mes/.test(q)) {
    return `Resumo (${d.periodo.toLowerCase()}):\n• Gasto${d.meses > 1 ? " médio/mês" : ""}: ${formatBRL(gasto)} de ${formatBRL(teto)} de teto\n• Renda${d.meses > 1 ? " média/mês" : ""}: ${formatBRL(d.renda)}\n• Saldo: ${formatBRL(d.renda - gasto)}\n• Maior categoria: ${cats[0]?.label ?? "—"} (${formatBRL(cats[0]?.spent ?? 0)})`;
  }

  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai)/.test(q)) {
    return "Oi! Pergunte sobre seus gastos, categorias, tetos ou metas.";
  }

  return "Ainda não sei responder isso. Tente perguntar: \"quanto gastei?\", \"o que passou do teto?\", \"onde posso cortar?\" ou \"como estão minhas metas?\".";
}
