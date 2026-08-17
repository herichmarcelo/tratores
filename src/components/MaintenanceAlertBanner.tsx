import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Wrench, ChevronRight } from 'lucide-react';
import type { Tractor } from '../types';
import { formatHorasManutencao, getMaintenanceStatus } from '../utils/manutencao';

interface MaintenanceAlertBannerProps {
  trator: Tractor | undefined;
  showLink?: boolean;
  compact?: boolean;
}

export const MaintenanceAlertBanner: React.FC<MaintenanceAlertBannerProps> = ({
  trator,
  showLink = true,
  compact = false,
}) => {
  if (!trator) return null;

  const status = getMaintenanceStatus(trator);
  if (status.level !== 'overdue' && status.level !== 'warning') return null;

  const isOverdue = status.level === 'overdue';
  const Icon = isOverdue ? Wrench : AlertTriangle;

  const message = isOverdue
    ? `Manutenção preventiva vencida há ${formatHorasManutencao(Math.abs(status.horasRestantes))}. O trator continua operando normalmente.`
    : `Manutenção preventiva em ${formatHorasManutencao(status.horasRestantes)}. Acompanhe o horímetro.`;

  return (
    <div
      className={`rounded-xl border flex items-start gap-3 ${
        compact ? 'p-3' : 'p-4'
      } ${
        isOverdue
          ? 'border-ff-danger/40 bg-ff-danger/10'
          : 'border-ff-warning/40 bg-ff-warning/10'
      }`}
    >
      <Icon
        className={`shrink-0 mt-0.5 w-5 h-5 ${
          isOverdue ? 'text-ff-danger' : 'text-ff-warning'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm ${
            isOverdue ? 'text-ff-danger' : 'text-ff-warning'
          }`}
        >
          {isOverdue ? 'Manutenção Vencida' : 'Manutenção Próxima'}
        </p>
        <p className="text-xs text-gray-600 dark:text-[#B3B3B3] mt-0.5">
          {message}
        </p>
        {!compact && (
          <p className="text-[11px] text-gray-500 dark:text-[#888] mt-1">
            {formatHorasManutencao(status.horasDesdeUltima)} desde a última · Intervalo: {status.intervalo} h
          </p>
        )}
      </div>
      {showLink && (
        <Link
          to="/manutencao"
          className={`shrink-0 flex items-center gap-1 text-xs font-semibold hover:underline ${
            isOverdue ? 'text-ff-danger' : 'text-ff-warning'
          }`}
        >
          Registrar
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
};
