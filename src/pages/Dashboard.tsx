import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Tractor,
  Fuel,
  Truck,
  Wrench,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Users,
  Loader2,
  Sun,
  Moon,
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
} from 'recharts';
import { useTratores, useAbastecimentos, usePneus, useManutencoes, useChecklists, useVwEficienciaTratores } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';

// O componente do Card precisou de uma classe extra (className) para controlar a largura no scroll horizontal
const DashboardCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  loading,
  className = "",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  loading?: boolean;
  className?: string;
}) => (
  <Card className={`hover:shadow-md transition-shadow border-none dark:bg-[#14141A] ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-[#B3B3B3] whitespace-nowrap">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Icon className="w-5 h-5 text-white" />}
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 dark:bg-[#1A1A1A] rounded animate-pulse" />
      ) : (
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      )}
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: pneus, isLoading: pneusLoading } = usePneus();
  const { data: manutencoes, isLoading: manutencoesLoading } = useManutencoes();
  const { data: checklists, isLoading: checklistsLoading } = useChecklists();
  const { data: eficienciaTratores, isLoading: eficienciaLoading } = useVwEficienciaTratores();

  const tratoresAtivos = tratores?.filter(t => t.status === 'ativo').length || 0;
  const totalLitros = abastecimentos?.reduce((acc, a) => acc + (a.litros_abastecidos || 0), 0) || 0;
  const pneusAlerta = pneus?.filter(p => p.status !== 'ok').length || 0;
  const emManutencao = manutencoes?.filter(m => m.status === 'pendente' || m.status === 'em_andamento').length || 0;
  const checklistsPendentes = checklists?.filter(c => c.status === 'pendente').length || 0;
  const custoTotal = abastecimentos?.reduce((acc, a) => acc + (a.valor_total || 0), 0) || 0;
  const eficienciaList = eficienciaTratores ?? [];
  
  const melhorTrator = eficienciaList.length > 0
    ? [...eficienciaList].sort((a, b) => (b.eficiencia_percentual || 0) - (a.eficiencia_percentual || 0))[0]
    : undefined;
    
  const piorTrator = eficienciaList.length > 0
    ? [...eficienciaList].sort((a, b) => (a.eficiencia_percentual || 100) - (b.eficiencia_percentual || 100))[0]
    : undefined;
    
  const eficienciaMedia = eficienciaList.length > 0
    ? Math.round(eficienciaList.reduce((acc, e) => acc + (e.eficiencia_percentual || 0), 0) / eficienciaList.length)
    : 0;

  const consumptionData = [
    { day: 'Seg', liters: 120 }, { day: 'Ter', liters: 145 }, { day: 'Qua', liters: 132 },
    { day: 'Qui', liters: 167 }, { day: 'Sex', liters: 143 }, { day: 'Sáb', liters: 98 }, { day: 'Dom', liters: 76 },
  ];
  const maintenanceData = [
    { month: 'Jan', count: 5 }, { month: 'Fev', count: 3 }, { month: 'Mar', count: 7 },
    { month: 'Abr', count: 4 }, { month: 'Mai', count: 6 }, { month: 'Jun', count: 2 },
  ];

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background dark:bg-[#0A0A0A] min-h-screen max-w-full overflow-hidden">
      
      {/* Header Fixo e Alinhado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-[#B3B3B3] mt-0.5">Visão geral da frota</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-gray-700 dark:text-[#B3B3B3] hover:text-ff-yellow hover:bg-transparent"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* NOVO: Scroll Horizontal Responsivo para Mobile (Snap) */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 custom-scrollbar">
        <DashboardCard title="Tratores Ativos" value={tratoresAtivos} icon={Tractor} colorClass="bg-ff-green-active" loading={tratoresLoading} className="w-[80vw] sm:w-auto shrink-0 snap-center" />
        <DashboardCard title="Litros Abastecidos" value={`${totalLitros.toLocaleString('pt-BR')} L`} icon={Fuel} colorClass="bg-ff-yellow" loading={abastecimentosLoading} className="w-[80vw] sm:w-auto shrink-0 snap-center" />
        <DashboardCard title="Custo Total Diesel" value={`R$ ${custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} colorClass="bg-emerald-600" loading={abastecimentosLoading} className="w-[80vw] sm:w-auto shrink-0 snap-center" />
        <DashboardCard title="Eficiência Média" value={`${eficienciaMedia}%`} icon={TrendingUp} colorClass="bg-teal-500" loading={eficienciaLoading} className="w-[80vw] sm:w-auto shrink-0 snap-center" />
        <DashboardCard title="Em Manutenção" value={emManutencao} icon={Wrench} colorClass="bg-ff-warning" loading={manutencoesLoading} className="w-[80vw] sm:w-auto shrink-0 snap-center" />
        <DashboardCard title="Checklists Pendentes" value={checklistsPendentes} icon={ClipboardList} colorClass="bg-purple-500" loading={checklistsLoading} className="w-[80vw] sm:w-auto shrink-0 snap-center" />
        <DashboardCard title="Pneus com Alerta" value={pneusAlerta} icon={Truck} colorClass="bg-ff-danger" loading={pneusLoading} className="w-[80vw] sm:w-auto shrink-0 snap-center" />
        <DashboardCard title="Operadores Ativos" value={8} icon={Users} colorClass="bg-indigo-500" className="w-[80vw] sm:w-auto shrink-0 snap-center" />
      </div>

      {/* Seção de Eficiência (Reorganizada) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm dark:bg-[#14141A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-ff-green-active" /> EFICIÊNCIA DA FROTA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eficienciaLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-ff-yellow animate-spin" />
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-5xl md:text-6xl font-bold text-ff-green-active">{eficienciaMedia}%</p>
                <div className="h-4 md:h-6 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden mx-4 md:mx-8">
                  <div className="h-full bg-ff-green-active rounded-full" style={{ width: `${eficienciaMedia}%` }} />
                </div>
                <p className="text-lg font-semibold text-ff-green-active">
                  {eficienciaMedia >= 90 ? 'Excelente' : eficienciaMedia >= 75 ? 'Atenção' : 'Baixa'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards de Melhor e Pior Trator em grid 2 colunas mesmo no mobile */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex flex-col sm:flex-row items-center sm:items-start gap-1">
                <span className="text-ff-green-active">🚜</span> Melhor
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-center sm:text-left">
              {eficienciaLoading ? (
                <div className="flex justify-center h-16"><Loader2 className="w-6 h-6 text-ff-yellow animate-spin" /></div>
              ) : melhorTrator ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{melhorTrator.patrimonio}</p>
                  <p className="text-xs text-gray-500 dark:text-[#B3B3B3] line-clamp-1">{melhorTrator.marca}</p>
                  <p className="text-2xl font-bold text-ff-green-active mt-2">{melhorTrator.eficiencia_percentual}%</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex flex-col sm:flex-row items-center sm:items-start gap-1">
                <span className="text-ff-danger">🚜</span> Pior
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-center sm:text-left">
              {eficienciaLoading ? (
                <div className="flex justify-center h-16"><Loader2 className="w-6 h-6 text-ff-yellow animate-spin" /></div>
              ) : piorTrator ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{piorTrator.patrimonio}</p>
                  <p className="text-xs text-gray-500 dark:text-[#B3B3B3] line-clamp-1">{piorTrator.marca}</p>
                  <p className="text-2xl font-bold text-ff-danger mt-2">{piorTrator.eficiencia_percentual}%</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos Responsivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border-none shadow-sm dark:bg-[#14141A]">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base text-gray-900 dark:text-white">Consumo Semanal</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A2A' : '#e5e7eb'} vertical={false} />
                  <XAxis dataKey="day" stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#141414' : 'white', border: `1px solid ${theme === 'dark' ? '#2A2A2A' : '#e5e7eb'}` }} />
                  <Line type="monotone" dataKey="liters" stroke="#FFC107" strokeWidth={3} dot={{ r: 4, fill: '#FFC107' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm dark:bg-[#14141A]">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base text-gray-900 dark:text-white">Manutenções por Mês</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A2A' : '#e5e7eb'} vertical={false} />
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={theme === 'dark' ? '#B3B3B3' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: theme === 'dark' ? '#2A2A2A' : '#f3f4f6' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#141414' : 'white', border: `1px solid ${theme === 'dark' ? '#2A2A2A' : '#e5e7eb'}` }} />
                  <Bar dataKey="count" fill="#FFC107" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};