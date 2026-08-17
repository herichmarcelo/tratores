/** Cálculo de preview do CMP para entrada (compra) — espelha a lógica do PostgreSQL */
export const calcularNovoCmpEntrada = (
  saldoAtual: number,
  cmpAtual: number,
  litrosComprados: number,
  precoCompra: number,
): { novoSaldo: number; novoCmp: number; novoCustoTotal: number } => {
  const novoSaldo = saldoAtual + litrosComprados;
  const novoCmp = saldoAtual === 0
    ? precoCompra
    : (saldoAtual * cmpAtual + litrosComprados * precoCompra) / novoSaldo;
  const novoCustoTotal = novoSaldo * novoCmp;
  return { novoSaldo, novoCmp, novoCustoTotal };
};

/** Cálculo de saída — CMP permanece, apenas reduz saldo e valor em estoque */
export const calcularSaidaTanque = (
  saldoAtual: number,
  cmpAtual: number,
  litrosSaida: number,
): { novoSaldo: number; valorSaida: number; novoCustoTotal: number } => {
  const novoSaldo = saldoAtual - litrosSaida;
  const valorSaida = litrosSaida * cmpAtual;
  const novoCustoTotal = novoSaldo * cmpAtual;
  return { novoSaldo, valorSaida, novoCustoTotal };
};

export const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatLiters = (value: number) =>
  `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;

export const formatCmp = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/L`;
