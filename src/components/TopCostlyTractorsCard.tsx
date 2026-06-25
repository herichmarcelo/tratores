import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select } from './ui/select';
import { useTratores, useAbastecimentos, useManutencoes } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { Loader2, AlertCircle } from 'lucide-react';

interface TractorCostData {
  tratorId: string;
  patrimonio: string;
  combustivel: number;
  manutencao: number;
  total: number;
  horasTrabalhadas: number;
  custoPorHora: number;
}

export const TopCostlyTractorsCard: React.FC = () => {
  const { theme } = useTheme();
  const { data: tratores, isLoading: tratoresLoading, error: tratoresError } = useTratores();
  const { data: abastecimentos, isLoading: abastecimentosLoading, error: abastecimentosError } = useAbastecimentos();
  const { data: manutencoes, isLoading: manutencoesLoading, error: manutencoesError } = useManutencoes();
  const [sortBy, setSortBy] = useState<'total' | 'combustivel' | 'manutencao' | 'custoPorHora'>('total');

  const tractorCosts: TractorCostData[] = useMemo(() => {
    if (!tratores || !abastecimentos || !manutencoes) return [];

    const combustivelMap = new Map<string, number>();
    const horimetroMinMap = new Map<string, number>();
    const horimetroMaxMap = new Map<string, number>();

    abastecimentos.forEach(a => {
      if (a.trator_id) {
        // Sum combustível
        const currentCombustivel = combustivelMap.get(a.trator_id) || 0;
        combustivelMap.set(a.trator_id, currentCombustivel + (a.valor_total || 0));

        // Track min/max horimetro
        const currentMin = horimetroMinMap.get(a.trator_id) || Infinity;
        const currentMax = horimetroMaxMap.get(a.trator_id) || -Infinity;
        const newMin = Math.min(currentMin, a.horimetro_inicial || 0);
        const newMax = Math.max(currentMax, a.horimetro_final || 0);
        horimetroMinMap.set(a.trator_id, newMin);
        horimetroMaxMap.set(a.trator_id, newMax);
      }
    });

    const manutencaoMap = new Map<string, number>();
    manutencoes.forEach(m => {
      if (m.trator_id) {
        const current = manutencaoMap.get(m.trator_id) || 0;
        manutencaoMap.set(m.trator_id, current + (m.valor || 0));
      }
    });

    return tratores.map(trator => {
      const combustivel = combustivelMap.get(trator.id) || 0;
      const manutencao = manutencaoMap.get(trator.id) || 0;
      const total = combustivel + manutencao;
      const horimetroMin = horimetroMinMap.get(trator.id) || 0;
      const horimetroMax = horimetroMaxMap.get(trator.id) || 0;
      const horasTrabalhadas = horimetroMax - horimetroMin;
      const custoPorHora = horasTrabalhadas > 0 ? total / horasTrabalhadas : 0;

      return {
        tratorId: trator.id,
        patrimonio: trator.patrimonio,
        combustivel,
        manutencao,
        total,
        horasTrabalhadas,
        custoPorHora,
      };
    }).sort((a, b) => {
      switch (sortBy) {
        case 'combustivel': return b.combustivel - a.combustivel;
        case 'manutencao': return b.manutencao - a.manutencao;
        case 'custoPorHora': return b.custoPorHora - a.custoPorHora;
        default: return b.total - a.total;
      }
    });
  }, [tratores, abastecimentos, manutencoes, sortBy]);

  const maxTotal = useMemo(() => {
    return Math.max(...tractorCosts.map(t => t.total), 0);
  }, [tractorCosts]);

  const tratorMenosEficiente = useMemo(() => {
    const withCusto = tractorCosts.filter(t => t.custoPorHora > 0);
    if (withCusto.length === 0) return null;
    return withCusto.reduce((max, current) => 
      current.custoPorHora > max.custoPorHora ? current : max
    );
  }, [tractorCosts]);

  const getRankColor = (index: number) => {
    const colors = ['#EF4444', '#F97316', '#FACC15', '#D4B000', '#22C55E'];
    return colors[index % colors.length];
  };

  const getCustoPorHoraIndicator = (custo: number) => {
    if (custo <= 20) return { emoji: '🟢', label: 'Excelente' };
    if (custo <= 35) return { emoji: '🟡', label: 'Atenção' };
    return { emoji: '🔴', label: 'Crítico' };
  };

  const isLoading = tratoresLoading || abastecimentosLoading || manutencoesLoading;
  const error = tratoresError || abastecimentosError || manutencoesError;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatCustoPorHora = (value: number) => {
    if (value === 0) return '-';
    return `${formatCurrency(value)}/h`;
  };

  return (
    <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm rounded-2xl">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Tratores que Mais Custam
        </CardTitle>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'total' | 'combustivel' | 'manutencao' | 'custoPorHora')}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="total">Por custo total</option>
          <option value="combustivel">Por combustível</option>
          <option value="manutencao">Por manutenção</option>
          <option value="custoPorHora">Por custo por hora</option>
        </select>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-4" />
            <p className="text-gray-500 dark:text-[#B3B3B3]">Carregando...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-gray-500 dark:text-[#B3B3B3]">Erro ao carregar dados</p>
          </div>
        ) : tractorCosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 dark:text-[#B3B3B3]">Nenhum trator encontrado</p>
          </div>
        ) : (
          <>
            {/* Trator Menos Eficiente KPI */}
            {tratorMenosEficiente && (
              <div className="mb-6 p-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trator Menos Eficiente</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {tratorMenosEficiente.patrimonio}
                  </span>
                  <span className="font-bold text-lg text-red-600 dark:text-red-400">
                    {formatCustoPorHora(tratorMenosEficiente.custoPorHora)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {/* Header Row */}
              <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr_80px] gap-2 py-2 px-2 text-xs font-medium text-gray-500 dark:text-[#B3B3B3] whitespace-nowrap">
                <div className="text-center">#</div>
                <div>Trator</div>
                <div className="text-right">Combustível</div>
                <div className="text-right">Manutenção</div>
                <div className="text-right">Total</div>
                <div className="text-right">Custo/Hora</div>
                <div className="text-center">Status</div>
              </div>

              {/* Data Rows */}
              {tractorCosts.map((tractor, index) => {
                const indicator = getCustoPorHoraIndicator(tractor.custoPorHora);
                return (
                  <div key={tractor.tratorId} className="relative">
                    {/* Bar Background */}
                    <div className="absolute inset-x-0 top-0 bottom-0 opacity-10">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: maxTotal > 0 ? `${(tractor.total / maxTotal) * 100}%` : '0%',
                          backgroundColor: getRankColor(index),
                        }}
                      />
                    </div>
                    <div className="relative grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr_80px] gap-2 py-3 px-2 items-center text-sm whitespace-nowrap">
                      <div className="text-center">
                        <span className="font-bold text-xs" style={{ color: getRankColor(index) }}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {tractor.patrimonio}
                        </span>
                      </div>
                      <div className="text-right text-gray-700 dark:text-[#B3B3B3]">
                        {formatCurrency(tractor.combustivel)}
                      </div>
                      <div className="text-right text-gray-700 dark:text-[#B3B3B3]">
                        {formatCurrency(tractor.manutencao)}
                      </div>
                      <div className="text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(tractor.total)}
                      </div>
                      <div className="text-right font-semibold text-gray-900 dark:text-white">
                        {formatCustoPorHora(tractor.custoPorHora)}
                      </div>
                      <div className="text-center">
                        <span className="text-lg">{indicator.emoji}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
