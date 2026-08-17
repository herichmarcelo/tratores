import React from 'react';
import { AlertTriangle, Wrench } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Tractor } from '../types';
import { buildAlertaManutencao, getNivelBadgeClasses } from '../utils/manutencaoAlerts';

interface MaintenanceAlertBadgeProps {
  trator: Tractor;
  size?: 'sm' | 'md';
  className?: string;
}

const nivelLabel = {
  verde: 'Em dia',
  amarelo: 'Manutenção próxima',
  laranja: 'Crítico',
  vermelho: 'Manutenção vencida',
} as const;

export const MaintenanceAlertBadge: React.FC<MaintenanceAlertBadgeProps> = ({
  trator,
  size = 'sm',
  className = '',
}) => {
  const alerta = buildAlertaManutencao(trator);

  if (trator.alerta_manutencao_ativo === false || alerta.nivel === 'verde') return null;

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const Icon = alerta.nivel === 'vermelho' ? Wrench : AlertTriangle;

  return (
    <Badge className={`${textSize} border shrink-0 ${getNivelBadgeClasses(alerta.nivel)} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {nivelLabel[alerta.nivel]}
    </Badge>
  );
};
