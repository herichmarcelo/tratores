import type { Tractor } from '../types';

export type MaintenanceAlertLevel = 'ok' | 'warning' | 'overdue' | 'disabled';

export interface MaintenanceStatus {
  level: MaintenanceAlertLevel;
  horasDesdeUltima: number;
  horasRestantes: number;
  percentualUsado: number;
  intervalo: number;
  horimetroUltima: number;
  horimetroAtual: number;
  vencido: boolean;
  proximoVencimento: boolean;
}

/** Alerta quando faltam ≤20% do intervalo (80% consumido) */
export const WARNING_THRESHOLD = 0.8;

export const DEFAULT_INTERVALO_HORAS = 500;

export const getUltimaManutencaoHorimetro = (trator: Tractor): number => {
  if (trator.horimetro_ultima_manutencao != null) {
    return trator.horimetro_ultima_manutencao;
  }
  return trator.horimetro_atual ?? 0;
};

export const getMaintenanceStatus = (trator: Tractor): MaintenanceStatus => {
  const intervalo = trator.intervalo_manutencao_horas ?? DEFAULT_INTERVALO_HORAS;
  const horimetroAtual = trator.horimetro_atual ?? 0;
  const horimetroUltima = getUltimaManutencaoHorimetro(trator);
  const horasDesdeUltima = Math.max(0, horimetroAtual - horimetroUltima);
  const horasRestantes = intervalo - horasDesdeUltima;
  const percentualUsado = intervalo > 0 ? (horasDesdeUltima / intervalo) * 100 : 0;

  if (trator.alerta_manutencao_ativo === false) {
    return {
      level: 'disabled',
      horasDesdeUltima,
      horasRestantes,
      percentualUsado,
      intervalo,
      horimetroUltima,
      horimetroAtual,
      vencido: false,
      proximoVencimento: false,
    };
  }

  const vencido = horasDesdeUltima >= intervalo;
  const proximoVencimento = !vencido && percentualUsado >= WARNING_THRESHOLD * 100;

  let level: MaintenanceAlertLevel = 'ok';
  if (vencido) level = 'overdue';
  else if (proximoVencimento) level = 'warning';

  return {
    level,
    horasDesdeUltima,
    horasRestantes,
    percentualUsado,
    intervalo,
    horimetroUltima,
    horimetroAtual,
    vencido,
    proximoVencimento,
  };
};

export const hasMaintenanceAlert = (trator: Tractor): boolean => {
  const status = getMaintenanceStatus(trator);
  return status.level === 'overdue' || status.level === 'warning';
};

export const getTratoresComAlerta = (tratores: Tractor[] | undefined) => {
  if (!tratores) return { vencidos: [] as Tractor[], proximos: [] as Tractor[], todos: [] as Tractor[] };

  const comAlerta = tratores
    .map((t) => ({ trator: t, status: getMaintenanceStatus(t) }))
    .filter(({ status }) => status.level === 'overdue' || status.level === 'warning');

  const vencidos = comAlerta.filter(({ status }) => status.level === 'overdue').map(({ trator }) => trator);
  const proximos = comAlerta.filter(({ status }) => status.level === 'warning').map(({ trator }) => trator);

  return {
    vencidos,
    proximos,
    todos: comAlerta.map(({ trator }) => trator),
  };
};

export const formatHorasManutencao = (horas: number) =>
  `${horas.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} h`;

export const getMaintenanceAlertLabel = (level: MaintenanceAlertLevel): string => {
  switch (level) {
    case 'overdue':
      return 'Manutenção vencida';
    case 'warning':
      return 'Manutenção próxima';
    case 'disabled':
      return 'Alerta desativado';
    default:
      return 'Em dia';
  }
};
