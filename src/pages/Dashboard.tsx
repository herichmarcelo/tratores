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
import { useTratores, useAbastecimentos, usePneus, useManutencoes, useChecklists, useVwEficienciaTratores, useVwConsumoFrota } from '../hooks';

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  loading?: boolean;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Icon className="w-5 h-5 text-white" />}
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      ) : (
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      )}
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: pneus, isLoading: pneusLoading } = usePneus();
  const { data: manutencoes, isLoading: manutencoesLoading } = useManutencoes();
  const { data: checklists, isLoading: checklistsLoading } = useChecklists();
  const { data: eficienciaTratores, isLoading: eficienciaLoading } = useVwEficienciaTratores();
  const { data: consumoFrota, isLoading: consumoLoading } = useVwConsumoFrota();

  // Calculate stats
  const tratoresAtivos = tratores?.filter(t => t.status === 'ativo').length || 0;
  const totalLitros = abastecimentos?.reduce((acc, a) => acc + (a.litros_abastecidos || 0), 0) || 0;
  const pneusAlerta = pneus?.filter(p => p.status !== 'ok').length || 0;
  const emManutencao = manutencoes?.filter(m => m.status === 'pendente' || m.status === 'em_andamento').length || 0;
  const checklistsPendentes = checklists?.filter(c => c.status === 'pendente').length || 0;
  const custoTotal = abastecimentos?.reduce((acc, a) => acc + (a.valor_total || 0), 0) || 0;
  const melhorTrator = eficienciaTratores?.sort((a, b) => (b.eficiencia_percentual || 0) - (a.eficiencia_percentual || 0))[0];
  const piorTrator = eficienciaTratores?.sort((a, b) => (a.eficiencia_percentual || 100) - (b.eficiencia_percentual || 100))[0];
  const eficienciaMedia = eficienciaTratores?.length > 0
    ? Math.round(eficienciaTratores.reduce((acc, e) => acc + (e.eficiencia_percentual || 0), 0) / eficienciaTratores.length)
    : 0;

  // Mock chart data for now (can use real data later)
  const consumptionData = [
    { day: 'Seg', liters: 120 },
    { day: 'Ter', liters: 145 },
    { day: 'Qua', liters: 132 },
    { day: 'Qui', liters: 167 },
    { day: 'Sex', liters: 143 },
    { day: 'Sáb', liters: 98 },
    { day: 'Dom', liters: 76 },
  ];
  const maintenanceData = [
    { month: 'Jan', count: 5 },
    { month: 'Fev', count: 3 },
    { month: 'Mar', count: 7 },
    { month: 'Abr', count: 4 },
    { month: 'Mai', count: 6 },
    { month: 'Jun', count: 2 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral da frota</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Tratores Ativos"
          value={tratoresAtivos}
          icon={Tractor}
          colorClass="bg-primary-600"
          loading={tratoresLoading}
        />
        <DashboardCard
          title="Litros Abastecidos"
          value={`${totalLitros.toLocaleString('pt-BR')} L`}
          icon={Fuel}
          colorClass="bg-amber-500"
          loading={abastecimentosLoading}
        />
        <DashboardCard
          title="Pneus com Alerta"
          value={pneusAlerta}
          icon={Truck}
          colorClass="bg-red-500"
          loading={pneusLoading}
        />
        <DashboardCard
          title="Em Manutenção"
          value={emManutencao}
          icon={Wrench}
          colorClass="bg-blue-500"
          loading={manutencoesLoading}
        />
        <DashboardCard
          title="Checklists Pendentes"
          value={checklistsPendentes}
          icon={ClipboardList}
          colorClass="bg-purple-500"
          loading={checklistsLoading}
        />
        <DashboardCard
          title="Custo Total Diesel"
          value={`R$ ${custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          colorClass="bg-emerald-600"
          loading={abastecimentosLoading}
        />
        <DashboardCard
          title="Eficiência da Frota"
          value={`${eficienciaMedia}%`}
          icon={TrendingUp}
          colorClass="bg-teal-500"
          loading={eficienciaLoading}
        />
        <DashboardCard
          title="Operadores Ativos"
          value={8}
          icon={Users}
          colorClass="bg-indigo-500"
        />
      </div>

      {/* Eficiência da Frota Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1 border-none shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">🌱 EFICIÊNCIA DA FROTA</CardTitle>
          </CardHeader>
          <CardContent>
            {eficienciaLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-6xl font-bold text-primary-600">{eficienciaMedia}%</p>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden mx-8">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: `${eficienciaMedia}%` }} />
                </div>
                <p className="text-xl font-semibold text-green-600">
                  {eficienciaMedia >= 90 ? 'Excelente' : eficienciaMedia >= 75 ? 'Atenção' : 'Baixa'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-primary-600">🚜</span>
                Melhor Trator
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eficienciaLoading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                </div>
              ) : melhorTrator ? (
                <div className="space-y-3">
                  <p className="text-xl font-bold text-gray-900">{melhorTrator.patrimonio}</p>
                  <p className="text-sm text-gray-600">{melhorTrator.marca} {melhorTrator.modelo}</p>
                  <p className="text-3xl font-bold text-green-600">{melhorTrator.eficiencia_percentual}%</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-red-600">🚜</span>
                Pior Trator
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eficienciaLoading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                </div>
              ) : piorTrator ? (
                <div className="space-y-3">
                  <p className="text-xl font-bold text-gray-900">{piorTrator.patrimonio}</p>
                  <p className="text-sm text-gray-600">{piorTrator.marca} {piorTrator.modelo}</p>
                  <p className="text-3xl font-bold text-red-600">{piorTrator.eficiencia_percentual}%</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consumo Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="liters"
                    stroke="#0F6D2B"
                    strokeWidth={2}
                    fill="#bbf7d0"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manutenções por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0F6D2B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};