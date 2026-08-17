import type { AlertaManutencao, NivelAlerta, Tractor } from '../types';

export const buildAlertaManutencao = (trator: Tractor): AlertaManutencao => {
  const horimetroAtual = trator.horimetro_atual || 0;
  const ultimaManutencao = trator.horimetro_ultima_manutencao || 0;
  const intervalo = trator.intervalo_manutencao_horas || 500;
  const proximaManutencao = ultimaManutencao + intervalo;
  const horasRestantes = proximaManutencao - horimetroAtual;
  const horasUsadas = horimetroAtual - ultimaManutencao;
  const percentualUso = intervalo > 0 ? (horasUsadas / intervalo) * 100 : 0;

  let nivel: NivelAlerta = 'verde';
  let mensagem = `✅ Normal: ${horasRestantes.toFixed(0)}h até próxima manutenção`;

  if (horasRestantes <= 0) {
    nivel = 'vermelho';
    mensagem = `⚠️ URGENTE: Manutenção vencida há ${Math.abs(horasRestantes).toFixed(0)}h!`;
  } else if (horasRestantes <= 50) {
    nivel = 'laranja';
    mensagem = `🔴 Crítico: Apenas ${horasRestantes.toFixed(0)}h até a manutenção`;
  } else if (horasRestantes <= 100) {
    nivel = 'amarelo';
    mensagem = `⚡ Atenção: ${horasRestantes.toFixed(0)}h restantes para manutenção`;
  }

  return {
    trator_id: trator.id,
    patrimonio: trator.patrimonio,
    marca_modelo: `${trator.marca || ''} ${trator.modelo || ''}`.trim(),
    horimetro_atual: horimetroAtual,
    proxima_manutencao: proximaManutencao,
    horas_restantes: horasRestantes,
    percentual_uso: percentualUso,
    nivel,
    mensagem,
  };
};

export const getNivelBadgeClasses = (nivel: NivelAlerta) => {
  switch (nivel) {
    case 'vermelho':
      return 'bg-ff-danger/15 text-ff-danger border-ff-danger/30';
    case 'laranja':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'amarelo':
      return 'bg-ff-warning/15 text-ff-warning border-ff-warning/30';
    default:
      return 'bg-ff-green-active/15 text-ff-green-active border-ff-green-active/30';
  }
};

export const getNivelProgressColor = (nivel: NivelAlerta) => {
  switch (nivel) {
    case 'vermelho':
      return 'bg-ff-danger';
    case 'laranja':
      return 'bg-orange-500';
    case 'amarelo':
      return 'bg-ff-warning';
    default:
      return 'bg-ff-green-active';
  }
};

export interface AlertaManutencaoBanner {
  nivel: NivelAlerta;
  mensagem: string;
  bgClass: string;
  textClass: string;
}

export const getAlertaManutencaoBanner = (trator: Tractor | undefined): AlertaManutencaoBanner | null => {
  if (!trator || trator.alerta_manutencao_ativo === false || trator.status !== 'ativo') return null;

  const alerta = buildAlertaManutencao(trator);

  if (alerta.nivel === 'verde') return null;

  if (alerta.nivel === 'vermelho') {
    return {
      nivel: 'vermelho',
      mensagem: `⚠️ MANUTENÇÃO VENCIDA: Trator precisa de revisão (vencida há ${Math.abs(alerta.horas_restantes).toFixed(0)}h)`,
      bgClass: 'bg-red-900/20 border-red-800',
      textClass: 'text-red-200',
    };
  }
  if (alerta.nivel === 'laranja') {
    return {
      nivel: 'laranja',
      mensagem: `🔴 ATENÇÃO: Apenas ${alerta.horas_restantes.toFixed(0)}h até a manutenção preventiva`,
      bgClass: 'bg-orange-900/20 border-orange-800',
      textClass: 'text-orange-200',
    };
  }
  return {
    nivel: 'amarelo',
    mensagem: `⚡ Manutenção preventiva em ${alerta.horas_restantes.toFixed(0)}h`,
    bgClass: 'bg-yellow-900/20 border-yellow-800',
    textClass: 'text-yellow-200',
  };
};

export const getProximaManutencaoTexto = (
  horimetroAtual: number,
  horimetroUltima: number,
  intervalo: number,
): string => {
  const horasRestantes = (horimetroUltima + intervalo) - horimetroAtual;
  if (horasRestantes <= 0) {
    return `Manutenção vencida há ${Math.abs(horasRestantes).toFixed(0)} horas`;
  }
  return `Próxima manutenção em: ${horasRestantes.toFixed(0)} horas`;
};
