// formats numbers as brazilian real: 1284.5 -> "R$ 1.284,50"
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: number): string {
  // intl uses a non-breaking space after R$; normalize to a regular space
  return brl.format(value).replace(/\u00a0/g, " ");
}
