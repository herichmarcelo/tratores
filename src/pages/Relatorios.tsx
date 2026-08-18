import React, { useState, useMemo } from 'react';
import {
  Fuel,
  Clock,
  DollarSign,
  ChevronRight,
  Home,
  FileText,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  Gauge,
  Leaf,
  Wrench,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { DatePicker } from '../components/ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TractorImage } from '../components/TractorImage';
import {
  useTratores,
  useAbastecimentos,
  useManutencoes,
  useChecklists,
  useFazendas,
  useVwEficienciaTratores,
} from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { format, subDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#3EC300', '#FFC107', '#F97316', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function TrendBadge({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) {
    return <span className="text-xs text-gray-500 dark:text-[#B3B3B3]">Sem dados anteriores</span>;
  }
  const isPositive = invert ? value < 0 : value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive
    ? 'text-green-600 dark:text-ff-green-active'
    : 'text-red-600 dark:text-ff-danger';
  return (
    <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
      <Icon className="w-3 h-3" />
      <span>{value > 0 ? '+' : ''}{value.toFixed(1)}% vs período anterior</span>
    </div>
  );
}

const Relatorios: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(format(firstDayOfMonth, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [selectedFazendaId, setSelectedFazendaId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: manutencoes, isLoading: manutencoesLoading } = useManutencoes();
  const { data: checklists, isLoading: checklistsLoading } = useChecklists();
  const { data: fazendas } = useFazendas();
  const { data: eficienciaData } = useVwEficienciaTratores();

  const isLoading = tratoresLoading || abastecimentosLoading || manutencoesLoading || checklistsLoading;

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  const periodDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(differenceInDays(end, start) + 1, 1);
  }, [startDate, endDate]);

  const prevPeriod = useMemo(() => {
    const start = new Date(startDate);
    return {
      start: subDays(start, periodDays),
      end: subDays(start, 1),
    };
  }, [startDate, periodDays]);

  const filterByPeriod = <T extends { data_abastecimento?: Date | string; data_manutencao?: Date | string; data_checklist?: Date | string }>(
    items: T[] | undefined,
    dateField: 'data_abastecimento' | 'data_manutencao' | 'data_checklist',
    start: Date,
    end: Date,
  ) => {
    if (!items) return [];
    return items.filter(item => {
      const raw = item[dateField];
      if (!raw) return false;
      const date = new Date(raw);
      return date >= start && date <= end;
    });
  };

  const matchesFazenda = (tratorId: string) => {
    if (!selectedFazendaId) return true;
    return tratores?.find(t => t.id === tratorId)?.fazenda_id === selectedFazendaId;
  };

  const filteredAbastecimentos = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return filterByPeriod(abastecimentos, 'data_abastecimento', start, end)
      .filter(a => matchesFazenda(a.trator_id));
  }, [abastecimentos, startDate, endDate, selectedFazendaId, tratores]);

  const filteredManutencoes = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return filterByPeriod(manutencoes, 'data_manutencao', start, end)
      .filter(m => matchesFazenda(m.trator_id));
  }, [manutencoes, startDate, endDate, selectedFazendaId, tratores]);

  const filteredChecklists = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return filterByPeriod(checklists, 'data_checklist', start, end)
      .filter(c => matchesFazenda(c.trator_id));
  }, [checklists, startDate, endDate, selectedFazendaId, tratores]);

  const prevAbastecimentos = useMemo(() => {
    return filterByPeriod(abastecimentos, 'data_abastecimento', prevPeriod.start, prevPeriod.end)
      .filter(a => matchesFazenda(a.trator_id));
  }, [abastecimentos, prevPeriod, selectedFazendaId, tratores]);

  const prevManutencoes = useMemo(() => {
    return filterByPeriod(manutencoes, 'data_manutencao', prevPeriod.start, prevPeriod.end)
      .filter(m => matchesFazenda(m.trator_id));
  }, [manutencoes, prevPeriod, selectedFazendaId, tratores]);

  const totalLitros = filteredAbastecimentos.reduce((s, a) => s + (a.litros_abastecidos || 0), 0);
  const totalCustoAbast = filteredAbastecimentos.reduce((s, a) => s + (a.valor_total || 0), 0);
  const totalCustoManut = filteredManutencoes.reduce((s, m) => s + (m.valor || 0), 0);
  const totalCusto = totalCustoAbast + totalCustoManut;
  const totalHoras = filteredAbastecimentos.reduce((s, a) => s + (a.horas_trabalhadas || 0), 0);
  const consumoMedio = totalHoras > 0 ? totalLitros / totalHoras : 0;
  const totalManutencoes = filteredManutencoes.length;

  const prevLitros = prevAbastecimentos.reduce((s, a) => s + (a.litros_abastecidos || 0), 0);
  const prevCusto = prevAbastecimentos.reduce((s, a) => s + (a.valor_total || 0), 0)
    + prevManutencoes.reduce((s, m) => s + (m.valor || 0), 0);
  const prevHoras = prevAbastecimentos.reduce((s, a) => s + (a.horas_trabalhadas || 0), 0);
  const prevConsumo = prevHoras > 0 ? prevLitros / prevHoras : 0;
  const prevManutencoesCount = prevManutencoes.length;

  const eficienciaMap = useMemo(() => {
    const map = new Map<string, number>();
    eficienciaData?.forEach(e => {
      if (e.trator_id && e.eficiencia_percentual != null) {
        map.set(e.trator_id, e.eficiencia_percentual);
      }
    });
    return map;
  }, [eficienciaData]);

  const eficienciaMedia = useMemo(() => {
    const consumoIdeal = 10;
    if (consumoMedio > 0) return Math.min((consumoIdeal / consumoMedio) * 100, 100);
    const values = eficienciaData?.map(e => e.eficiencia_percentual || 0).filter(v => v > 0) || [];
    return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  }, [consumoMedio, eficienciaData]);

  const prevEficiencia = useMemo(() => {
    const consumoIdeal = 10;
    return prevConsumo > 0 ? Math.min((consumoIdeal / prevConsumo) * 100, 100) : 0;
  }, [prevConsumo]);

  const consumoPorDia = useMemo(() => {
    const map = new Map<string, number>();
    filteredAbastecimentos.forEach(a => {
      const key = format(new Date(a.data_abastecimento), 'dd/MM');
      map.set(key, (map.get(key) || 0) + (a.litros_abastecidos || 0));
    });
    return [...map.entries()]
      .map(([name, litros]) => ({ name, litros }))
      .slice(-14);
  }, [filteredAbastecimentos]);

  const horasPorDia = useMemo(() => {
    const map = new Map<string, number>();
    filteredAbastecimentos.forEach(a => {
      const key = format(new Date(a.data_abastecimento), 'dd/MM');
      map.set(key, (map.get(key) || 0) + (a.horas_trabalhadas || 0));
    });
    return [...map.entries()]
      .map(([name, horas]) => ({ name, horas }))
      .slice(-14);
  }, [filteredAbastecimentos]);

  const consumoPorTrator = useMemo(() => {
    const map = new Map<string, { patrimonio: string; marca?: string; modelo?: string; litros: number }>();
    filteredAbastecimentos.forEach(a => {
      const trator = tratores?.find(t => t.id === a.trator_id);
      if (!trator) return;
      const entry = map.get(trator.id) || {
        patrimonio: trator.patrimonio,
        marca: trator.marca,
        modelo: trator.modelo,
        litros: 0,
      };
      entry.litros += a.litros_abastecidos || 0;
      map.set(trator.id, entry);
    });
    return [...map.values()]
      .sort((a, b) => b.litros - a.litros)
      .slice(0, 10);
  }, [filteredAbastecimentos, tratores]);

  const eficienciaPorTrator = useMemo(() => {
    return (tratores || [])
      .filter(t => !selectedFazendaId || t.fazenda_id === selectedFazendaId)
      .map(t => ({
        patrimonio: t.patrimonio,
        eficiencia: eficienciaMap.get(t.id) ?? 0,
      }))
      .filter(t => t.eficiencia > 0)
      .slice(0, 5);
  }, [tratores, selectedFazendaId, eficienciaMap]);

  const resumoPorTrator = useMemo(() => {
    if (!tratores) return [];
    const scoped = selectedFazendaId
      ? tratores.filter(t => t.fazenda_id === selectedFazendaId)
      : tratores;

    return scoped.map(trator => {
      const abs = filteredAbastecimentos.filter(a => a.trator_id === trator.id);
      const mans = filteredManutencoes.filter(m => m.trator_id === trator.id);
      const chks = filteredChecklists.filter(c => c.trator_id === trator.id);
      const litros = abs.reduce((s, a) => s + (a.litros_abastecidos || 0), 0);
      const horas = abs.reduce((s, a) => s + (a.horas_trabalhadas || 0), 0);
      const custo = abs.reduce((s, a) => s + (a.valor_total || 0), 0)
        + mans.reduce((s, m) => s + (m.valor || 0), 0);
      const consumo = horas > 0 ? litros / horas : 0;
      const eficiencia = eficienciaMap.get(trator.id)
        ?? (consumo > 0 ? Math.min((10 / consumo) * 100, 100) : 0);

      return {
        id: trator.id,
        patrimonio: trator.patrimonio,
        marca: trator.marca,
        modelo: trator.modelo,
        imagem_url: trator.imagem_url,
        horas,
        litros,
        consumo,
        custo,
        eficiencia,
        checklists: chks.length,
        manutencoes: mans.length,
        status: trator.status,
      };
    }).sort((a, b) => b.litros - a.litros);
  }, [tratores, selectedFazendaId, filteredAbastecimentos, filteredManutencoes, filteredChecklists, eficienciaMap]);

  const totalPages = Math.max(1, Math.ceil(resumoPorTrator.length / pageSize));
  const paginatedRows = resumoPorTrator.slice((page - 1) * pageSize, page * pageSize);

  const formatPeriodLabel = () => {
    const start = format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR });
    const end = format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR });
    return `${start} - ${end}`;
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'ativo') {
      return 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30';
    }
    if (['pendente', 'em_andamento'].includes(s)) {
      return 'bg-ff-warning/20 text-ff-warning border-ff-warning/30';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-[#1A1A1A] dark:text-[#B3B3B3] dark:border-[#2A2A2A]';
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A]">
      <div className="px-4 lg:px-6 pt-4 lg:pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-ff-yellow" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-white border border-gray-200 dark:border-[#2A2A2A] rounded-lg"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-[#B3B3B3]">
              <Home className="w-4 h-4" />
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">Relatórios</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                value={startDate}
                onChange={(value) => { setStartDate(value); setPage(1); }}
                compact
                className="w-[10.5rem]"
              />
              <span className="text-gray-400">—</span>
              <DatePicker
                value={endDate}
                onChange={(value) => { setEndDate(value); setPage(1); }}
                compact
                className="w-[10.5rem]"
              />
            </div>
            <Select
              className="border-gray-200 dark:border-[#2A2A2A] w-48 dark:bg-[#1A1A1A] dark:text-white"
              value={selectedFazendaId}
              onChange={(e) => { setSelectedFazendaId(e.target.value); setPage(1); }}
            >
              <option value="">Todas as Unidades</option>
              {fazendas?.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-[#B3B3B3] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>
            <Button className="bg-ff-yellow text-black hover:brightness-110 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{formatPeriodLabel()}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 text-ff-yellow animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-ff-green-active/20 flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-green-600 dark:text-ff-green-active" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Litros Abastecidos</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
                      </p>
                    </div>
                  </div>
                  <TrendBadge value={pctChange(totalLitros, prevLitros)} />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Custo Total (R$)</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <TrendBadge value={pctChange(totalCusto, prevCusto)} invert />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-ff-warning/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-ff-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Horas Trabalhadas</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {totalHoras.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h
                      </p>
                    </div>
                  </div>
                  <TrendBadge value={pctChange(totalHoras, prevHoras)} />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Consumo Médio</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {consumoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L/h
                      </p>
                    </div>
                  </div>
                  <TrendBadge value={pctChange(consumoMedio, prevConsumo)} invert />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-ff-green-active/20 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-emerald-600 dark:text-ff-green-active" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Eficiência da Frota</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {eficienciaMedia.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <TrendBadge value={pctChange(eficienciaMedia, prevEficiencia)} />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-ff-danger/20 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-red-600 dark:text-ff-danger" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Manutenções</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{totalManutencoes}</p>
                    </div>
                  </div>
                  <TrendBadge
                    value={prevManutencoesCount > 0 || totalManutencoes > 0
                      ? pctChange(totalManutencoes, prevManutencoesCount)
                      : null}
                    invert
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Consumo de Combustível</CardTitle>
                  <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Litros</Badge>
                </CardHeader>
                <CardContent className="p-4">
                  {consumoPorDia.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-sm text-gray-500 dark:text-[#B3B3B3]">
                      Sem abastecimentos no período
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={256}>
                      <BarChart data={consumoPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="name" tick={{ fill: '#B3B3B3', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#B3B3B3', fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} L`, 'Litros']} />
                        <Bar dataKey="litros" fill="#facc15" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Consumo por Trator</CardTitle>
                  <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Top 10</Badge>
                </CardHeader>
                <CardContent className="p-4">
                  {consumoPorTrator.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-sm text-gray-500 dark:text-[#B3B3B3]">
                      Sem dados de consumo
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                      <div className="relative w-48 h-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={consumoPorTrator}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              dataKey="litros"
                              nameKey="patrimonio"
                            >
                              {consumoPorTrator.map((_, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} L`, 'Litros']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                          <span className="text-xs text-gray-500 dark:text-[#B3B3B3]">Total</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {totalLitros.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} L
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        {consumoPorTrator.slice(0, 5).map((item, idx) => (
                          <div key={item.patrimonio} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-xs text-gray-700 dark:text-[#B3B3B3] flex-1 truncate">
                              {item.patrimonio} - {item.marca} {item.modelo}
                            </span>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {item.litros.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Horas Trabalhadas por Dia</CardTitle>
                  <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Horas</Badge>
                </CardHeader>
                <CardContent className="p-4">
                  {horasPorDia.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-sm text-gray-500 dark:text-[#B3B3B3]">
                      Sem horas registradas no período
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={256}>
                      <BarChart data={horasPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="name" tick={{ fill: '#B3B3B3', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#B3B3B3', fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} h`, 'Horas']} />
                        <Bar dataKey="horas" fill="#facc15" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Eficiência da Frota (%)</CardTitle>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {eficienciaPorTrator.map((t, idx) => (
                      <span key={t.patrimonio} className="text-xs" style={{ color: COLORS[idx % COLORS.length] }}>
                        ● {t.patrimonio}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {eficienciaPorTrator.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-sm text-gray-500 dark:text-[#B3B3B3]">
                      Sem dados de eficiência
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={256}>
                      <LineChart data={eficienciaPorTrator}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="patrimonio" tick={{ fill: '#B3B3B3', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#B3B3B3', fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => [`${Number(value).toFixed(0)}%`, 'Eficiência']} />
                        <Line type="monotone" dataKey="eficiencia" stroke="#3EC300" strokeWidth={2} dot={{ fill: '#3EC300' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Resumo por Trator</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {resumoPorTrator.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500 dark:text-[#B3B3B3]">
                    Nenhum trator cadastrado
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A]">
                          <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Trator</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Horas (h)</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Litros (L)</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Consumo (L/h)</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Custo (R$)</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Eficiência (%)</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Checklists</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Manutenções</th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">Situação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                          {paginatedRows.map((tractor) => (
                            <tr key={tractor.id} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors">
                              <td className="px-4 lg:px-6 py-3">
                                <div className="flex items-center gap-3">
                                  <TractorImage
                                    src={tractor.imagem_url}
                                    alt={tractor.patrimonio}
                                    size="sm"
                                    fit="cover"
                                  />
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {tractor.patrimonio} - {tractor.marca} {tractor.modelo}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">
                                {tractor.horas.toFixed(2)}
                              </td>
                              <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">
                                {tractor.litros.toFixed(2)}
                              </td>
                              <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">
                                {tractor.consumo.toFixed(2)}
                              </td>
                              <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">
                                R$ {tractor.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 lg:px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                                    <div className="h-full bg-ff-green-active" style={{ width: `${Math.min(tractor.eficiencia, 100)}%` }} />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {tractor.eficiencia.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">
                                {tractor.checklists}
                              </td>
                              <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">
                                {tractor.manutencoes}
                              </td>
                              <td className="px-4 lg:px-6 py-3">
                                <Badge className={getStatusBadge(tractor.status)}>{tractor.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 lg:px-6 py-4 border-t border-gray-100 dark:border-[#2A2A2A] flex flex-col lg:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-gray-500 dark:text-[#B3B3B3]">
                        Mostrando {resumoPorTrator.length === 0 ? 0 : (page - 1) * pageSize + 1} a{' '}
                        {Math.min(page * pageSize, resumoPorTrator.length)} de {resumoPorTrator.length} tratores
                      </p>
                      <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-[#B3B3B3]">Linhas por página:</span>
                          <Select
                            className="w-24 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                            value={String(pageSize)}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                          >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-[#B3B3B3]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-gray-700 dark:text-[#B3B3B3] px-2">
                            {page} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-[#B3B3B3]"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
