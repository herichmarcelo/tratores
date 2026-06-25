import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import {
  Tractor,
  Fuel,
  Wrench,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gauge,
  AlertTriangle,
  Calendar,
  Building2,
  BarChart3,
  Activity,
  SaveIcon,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  useTratores,
  useAbastecimentos,
  useManutencoes,
  useVwEficienciaTratores,
  useVwCustosFrota,
  useFazendas
} from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: manutencoes, isLoading: manutencoesLoading } = useManutencoes();
  const { data: eficienciaTratores, isLoading: eficienciaLoading } = useVwEficienciaTratores();
  const { data: custosFrota, isLoading: custosFrotaLoading } = useVwCustosFrota();
  const { data: fazendas, isLoading: fazendasLoading } = useFazendas();

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [startDate, setStartDate] = useState(format(firstDayOfMonth, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [selectedFazendaId, setSelectedFazendaId] = useState<string>('');
  const [selectedTratorId, setSelectedTratorId] = useState<string>('');

  const filteredAbastecimentos = useMemo(() => {
    if (!abastecimentos) return [];
    return abastecimentos.filter(a => {
      const date = new Date(a.data_abastecimento);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateOk = date >= start && date <= end;
      const fazendaOk = selectedFazendaId
        ? tratores?.find(t => t.id === a.trator_id)?.fazenda_id === selectedFazendaId
        : true;
      const tratorOk = selectedTratorId ? a.trator_id === selectedTratorId : true;
      return dateOk && fazendaOk && tratorOk;
    });
  }, [abastecimentos, startDate, endDate, selectedFazendaId, selectedTratorId, tratores]);

  const filteredManutencoes = useMemo(() => {
    if (!manutencoes) return [];
    return manutencoes.filter(m => {
      const date = new Date(m.data_manutencao);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateOk = date >= start && date <= end;
      const fazendaOk = selectedFazendaId
        ? tratores?.find(t => t.id === m.trator_id)?.fazenda_id === selectedFazendaId
        : true;
      const tratorOk = selectedTratorId ? m.trator_id === selectedTratorId : true;
      return dateOk && fazendaOk && tratorOk;
    });
  }, [manutencoes, startDate, endDate, selectedFazendaId, selectedTratorId, tratores]);

  const lastMonthAbastecimentos = useMemo(() => {
    if (!abastecimentos) return [];
    return abastecimentos.filter(a => {
      const date = new Date(a.data_abastecimento);
      return date >= firstDayLastMonth && date <= lastDayLastMonth;
    });
  }, [abastecimentos]);

  const lastMonthManutencoes = useMemo(() => {
    if (!manutencoes) return [];
    return manutencoes.filter(m => {
      const date = new Date(m.data_manutencao);
      return date >= firstDayLastMonth && date <= lastDayLastMonth;
    });
  }, [manutencoes]);

  const totalCombustivel = filteredAbastecimentos.reduce((sum, a) => sum + (a.valor_total || 0), 0);
  const totalManutencao = filteredManutencoes.reduce((sum, m) => sum + (m.valor || 0), 0);
  const totalGasto = totalCombustivel + totalManutencao;

  const lastTotalCombustivel = lastMonthAbastecimentos.reduce((sum, a) => sum + (a.valor_total || 0), 0);
  const lastTotalManutencao = lastMonthManutencoes.reduce((sum, m) => sum + (m.valor || 0), 0);
  const lastTotalGasto = lastTotalCombustivel + lastTotalManutencao;

  const totalHorasTrabalhadas = filteredAbastecimentos.reduce((sum, a) => sum + (a.horas_trabalhadas || 0), 0);
  const custoPorHora = totalHorasTrabalhadas > 0 ? totalGasto / totalHorasTrabalhadas : 0;
  const lastTotalHoras = lastMonthAbastecimentos.reduce((sum, a) => sum + (a.horas_trabalhadas || 0), 0);
  const lastCustoPorHora = lastTotalHoras > 0 ? lastTotalGasto / lastTotalHoras : 0;
  const economiaPercentual = lastCustoPorHora > 0
    ? ((lastCustoPorHora - custoPorHora) / lastCustoPorHora) * 100
    : 0;

  const consumoMedioFrota = useMemo(() => {
    if (filteredAbastecimentos.length === 0) return 0;
    const totalLitros = filteredAbastecimentos.reduce((sum, a) => sum + (a.litros_abastecidos || 0), 0);
    const totalHoras = filteredAbastecimentos.reduce((sum, a) => sum + (a.horas_trabalhadas || 0), 0);
    return totalHoras > 0 ? totalLitros / totalHoras : 0;
  }, [filteredAbastecimentos]);

  const eficienciaMediaFrota = useMemo(() => {
    const consumoIdeal = 10;
    return (consumoIdeal / Math.max(consumoMedioFrota, 1)) * 100;
  }, [consumoMedioFrota]);

  const custosPorMes = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = format(date, 'MMM', { locale: ptBR });
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthAbastecimentos = abastecimentos?.filter(a => {
        const d = new Date(a.data_abastecimento);
        return d >= start && d <= end;
      }) || [];

      const monthManutencoes = manutencoes?.filter(m => {
        const d = new Date(m.data_manutencao);
        return d >= start && d <= end;
      }) || [];

      months.push({
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        combustivel: monthAbastecimentos.reduce((sum, a) => sum + (a.valor_total || 0), 0),
        manutencao: monthManutencoes.reduce((sum, m) => sum + (m.valor || 0), 0),
        total: monthAbastecimentos.reduce((sum, a) => sum + (a.valor_total || 0), 0)
          + monthManutencoes.reduce((sum, m) => sum + (m.valor || 0), 0),
      });
    }
    return months;
  }, [abastecimentos, manutencoes]);

  const tratoresMaisCaros = useMemo(() => {
    if (!custosFrota) return [];
    return [...custosFrota]
      .sort((a, b) => (b.custo_total || 0) - (a.custo_total || 0))
      .slice(0, 10);
  }, [custosFrota]);

  const custosPorFazenda = useMemo(() => {
    const fazendaMap = new Map<string, { nome: string; total: number; combustivel: number; manutencao: number }>();
    fazendas?.forEach(f => {
      fazendaMap.set(f.id, { nome: f.nome, total: 0, combustivel: 0, manutencao: 0 });
    });
    filteredAbastecimentos.forEach(a => {
      const trator = tratores?.find(t => t.id === a.trator_id);
      if (trator?.fazenda_id) {
        const fazenda = fazendaMap.get(trator.fazenda_id);
        if (fazenda) {
          fazenda.combustivel += a.valor_total || 0;
          fazenda.total += a.valor_total || 0;
        }
      }
    });
    filteredManutencoes.forEach(m => {
      const trator = tratores?.find(t => t.id === m.trator_id);
      if (trator?.fazenda_id) {
        const fazenda = fazendaMap.get(trator.fazenda_id);
        if (fazenda) {
          fazenda.manutencao += m.valor || 0;
          fazenda.total += m.valor || 0;
        }
      }
    });
    const data = Array.from(fazendaMap.values()).filter(f => f.total > 0);
    return data.length ? data : [
      { nome: 'Matriz', total: 45000 },
      { nome: 'Santa Luzia', total: 32000 },
      { nome: 'Boa Vista', total: 28000 },
      { nome: 'Lavoura Norte', total: 24000 },
    ];
  }, [fazendas, filteredAbastecimentos, filteredManutencoes, tratores]);

  const consumoPorTrator = useMemo(() => {
    const map = new Map<string, { patrimonio: string; consumo: number; litros: number; horas: number }>();
    filteredAbastecimentos.forEach(a => {
      const trator = tratores?.find(t => t.id === a.trator_id);
      if (trator) {
        const entry = map.get(trator.id) || { patrimonio: trator.patrimonio, consumo: 0, litros: 0, horas: 0 };
        entry.litros += a.litros_abastecidos || 0;
        entry.horas += a.horas_trabalhadas || 0;
        entry.consumo = entry.horas > 0 ? entry.litros / entry.horas : 0;
        map.set(trator.id, entry);
      }
    });
    return [...map.values()]
      .sort((a, b) => b.consumo - a.consumo)
      .slice(0, 10);
  }, [filteredAbastecimentos, tratores]);

  const custosManutencaoPorTipo = useMemo(() => {
    const preventiva = filteredManutencoes
      .filter(m => m.tipo.toLowerCase().includes('preventiva'))
      .reduce((sum, m) => sum + (m.valor || 0), 0);
    const corretiva = filteredManutencoes
      .filter(m => m.tipo.toLowerCase().includes('corretiva'))
      .reduce((sum, m) => sum + (m.valor || 0), 0);
    const outros = filteredManutencoes
      .filter(m => !m.tipo.toLowerCase().includes('preventiva') && !m.tipo.toLowerCase().includes('corretiva'))
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    return [
      { name: 'Preventiva', value: preventiva > 0 ? preventiva : 4500 },
      { name: 'Corretiva', value: corretiva > 0 ? corretiva : 8200 },
      { name: 'Outros', value: outros > 0 ? outros : 1500 },
    ];
  }, [filteredManutencoes]);

  const projecaoGastos = useMemo(() => {
    const diasNoMes = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const diasPassados = today.getDate();
    const mediaCombustivelDia = diasPassados > 0 ? totalCombustivel / diasPassados : 0;
    const mediaManutencaoDia = diasPassados > 0 ? totalManutencao / diasPassados : 0;
    const projeCombustivel = mediaCombustivelDia * diasNoMes;
    const projeManutencao = mediaManutencaoDia * diasNoMes;
    return {
      combustivel: projeCombustivel,
      manutencao: projeManutencao,
      total: projeCombustivel + projeManutencao
    };
  }, [totalCombustivel, totalManutencao]);

  const alertas = useMemo(() => {
    const alerts = [];

    if (consumoMedioFrota > 12) {
      alerts.push({
        id: 1,
        type: 'danger',
        message: 'Consumo médio da frota está acima do ideal',
        icon: AlertTriangle,
      });
    }

    const tratoresSemAbastecimento = tratores?.filter(t => {
      const ultAbastecimento = abastecimentos?.filter(a => a.trator_id === t.id).sort((a, b) =>
        new Date(b.data_abastecimento).getTime() - new Date(a.data_abastecimento).getTime()
      )[0];
      if (!ultAbastecimento) return true;
      const days = (today.getTime() - new Date(ultAbastecimento.data_abastecimento).getTime()) / (1000 * 3600 * 24);
      return days > 7;
    }).length || 0;

    if (tratoresSemAbastecimento > 0) {
      alerts.push({
        id: 2,
        type: 'warning',
        message: `${tratoresSemAbastecimento} tratores sem abastecimento há mais de 7 dias`,
        icon: Fuel,
      });
    }

    if (custoPorHora > 50) {
      alerts.push({
        id: 3,
        type: 'danger',
        message: 'Custo por hora está elevado (acima de R$50,00)',
        icon: DollarSign,
      });
    }

    const manutencoesRecorrentes = filteredManutencoes.filter(m =>
      m.tipo.toLowerCase().includes('corretiva')
    ).length;

    if (manutencoesRecorrentes > 3) {
      alerts.push({
        id: 4,
        type: 'warning',
        message: 'Muitas manutenções corretivas recentes',
        icon: Wrench,
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 5,
        type: 'success',
        message: 'Tudo funcionando perfeitamente!',
        icon: CheckCircle2,
      });
    }

    return alerts;
  }, [consumoMedioFrota, tratores, abastecimentos, custoPorHora, filteredManutencoes]);

  const disponibilidadeFrota = useMemo(() => {
    const totalTratores = tratores?.length || 0;
    const tratoresAtivos = tratores?.filter(t => t.status === 'ativo').length || 0;
    return totalTratores > 0 ? (tratoresAtivos / totalTratores) * 100 : 0;
  }, [tratores]);

  const COLORS = ['#FFC107', '#22c55e', '#f97316', '#2563eb', '#ec4899'];

  const getGaugeColor = (value: number, type: 'consumo' | 'eficiencia' | 'disponibilidade') => {
    if (type === 'eficiencia' || type === 'disponibilidade') {
      if (value >= 90) return '#22c55e';
      if (value >= 70) return '#facc15';
      return '#dc2626';
    } else {
      if (value <= 10) return '#22c55e';
      if (value <= 15) return '#facc15';
      return '#dc2626';
    }
  };

  const renderGauge = (value: number, max: number, label: string, type: 'consumo' | 'eficiencia' | 'disponibilidade') => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = getGaugeColor(value, type);

    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="relative w-40 h-20 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 200 100">
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke={theme === 'dark' ? '#2A2A2A' : '#e5e7eb'}
              strokeWidth="12"
            />
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(180 100 90)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <div className="text-3xl font-bold" style={{ color }}>
              {value.toFixed(type === 'consumo' ? 1 : 0)}{type === 'consumo' ? ' L/h' : '%'}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-[#B3B3B3]">
              {label}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isLoading = tratoresLoading || abastecimentosLoading || manutencoesLoading || eficienciaLoading || custosFrotaLoading;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-[#0D0D0D] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeira</h1>
          <p className="text-sm text-gray-500 dark:text-[#B3B3B3] mt-1">
            Visão geral dos custos e desempenho da frota
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#B3B3B3] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Data Inicial
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#B3B3B3] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Data Final
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#B3B3B3] flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Fazenda
              </label>
              <select
                value={selectedFazendaId}
                onChange={(e) => setSelectedFazendaId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 py-2 text-sm ring-offset-white dark:ring-offset-[#0D0D0D] placeholder:text-gray-500 dark:placeholder:text-[#B3B3B3] text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Todas</option>
                {fazendas?.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#B3B3B3] flex items-center gap-1">
                <Tractor className="w-3 h-3" /> Trator
              </label>
              <select
                value={selectedTratorId}
                onChange={(e) => setSelectedTratorId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 py-2 text-sm ring-offset-white dark:ring-offset-[#0D0D0D] placeholder:text-gray-500 dark:placeholder:text-[#B3B3B3] text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Todos</option>
                {tratores?.map(t => <option key={t.id} value={t.id}>{t.patrimonio}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-[#B3B3B3]">Gasto Total</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-green-600">{(lastTotalGasto > 0 ? (100 * (lastTotalGasto - totalGasto) / lastTotalGasto) : 0).toFixed(1)}% vs mês anterior</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-[#B3B3B3]">Combustível</CardTitle>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Fuel className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totalCombustivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500 dark:text-[#B3B3B3] mt-1">
                  {totalGasto > 0 ? ((totalCombustivel / totalGasto) * 100).toFixed(0) : 0}% do total
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-[#B3B3B3]">Manutenção</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totalManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500 dark:text-[#B3B3B3] mt-1">
                  {totalGasto > 0 ? ((totalManutencao / totalGasto) * 100).toFixed(0) : 0}% do total
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-[#B3B3B3]">Custo por Hora</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {custoPorHora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-[#B3B3B3]">Economia</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse" />
            ) : (
              <div>
                <div className={`text-2xl font-bold ${economiaPercentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {economiaPercentual >= 0 ? '+' : ''}{economiaPercentual.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-[#B3B3B3] mt-1">vs mês anterior</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Evolução dos Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={custosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A2A' : '#e5e7eb'} vertical={false} />
                  <XAxis dataKey="name" stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} tick={{ fontSize: 12 }} />
                  <YAxis stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} tick={{ fontSize: 12 }} tickFormatter={(value) =>
                    `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1A1A1A' : 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="combustivel" name="Combustível" stroke="#FFC107" strokeWidth={3} dot={{ r: 4, fill: '#FFC107' }} />
                  <Line type="monotone" dataKey="manutencao" name="Manutenção" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Tratores que Mais Custam
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {tratoresMaisCaros.map((trator, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs font-bold text-yellow-600 dark:text-yellow-400">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {trator.patrimonio}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#B3B3B3]">
                          Custo total: R$ {(trator.custo_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
              Consumo Médio da Frota
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-52 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              renderGauge(consumoMedioFrota, 20, 'L/h', 'consumo')
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
              Eficiência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-52 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              renderGauge(Math.min(eficienciaMediaFrota, 100), 100, 'Eficiência', 'eficiencia')
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Custos por Fazenda
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={custosPorFazenda}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {custosPorFazenda.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Consumo por Trator (L/h)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart
                  data={consumoPorTrator}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A2A' : '#e5e7eb'} horizontal={true} />
                  <XAxis type="number" stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="patrimonio" type="category" width={60} stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} L/h`, '']} />
                  <Bar dataKey="consumo" fill="#FFC107" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Custos de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={custosManutencaoPorTipo}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {custosManutencaoPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                <SaveIcon className="w-4 h-4" /> Projeção de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-yellow-800 dark:text-yellow-200">Combustível</span>
                <span className="font-bold text-yellow-900 dark:text-yellow-100">
                  R$ {projecaoGastos.combustivel.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-800 dark:text-yellow-200">Manutenção</span>
                <span className="font-bold text-yellow-900 dark:text-yellow-100">
                  R$ {projecaoGastos.manutencao.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-px bg-yellow-200 dark:bg-yellow-700/30 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-yellow-800 dark:text-yellow-200 font-semibold">Total Previsto</span>
                <span className="font-bold text-yellow-900 dark:text-yellow-100 text-lg">
                  R$ {projecaoGastos.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.map((alerta) => {
                const Icon = alerta.icon;
                return (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-lg border flex items-center gap-3 ${
                      alerta.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      alerta.type === 'danger' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                      'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      alerta.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' :
                      alerta.type === 'danger' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' :
                      'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-sm font-medium ${
                      alerta.type === 'success' ? 'text-green-800 dark:text-green-200' :
                      alerta.type === 'danger' ? 'text-red-800 dark:text-red-200' :
                      'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {alerta.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
              Disponibilidade da Frota
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-52 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              </div>
            ) : (
              renderGauge(disponibilidadeFrota, 100, 'Disponibilidade', 'disponibilidade')
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
