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

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
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
                value={12}
                icon={Tractor}
                colorClass="bg-primary-600"
            />
            <DashboardCard
                title="Consumo Hoje"
                value="156 L"
                icon={Fuel}
                colorClass="bg-amber-500"
            />
            <DashboardCard
                title="Pneus com Alerta"
                value={3}
                icon={Truck}
                colorClass="bg-red-500"
            />
            <DashboardCard
                title="Em Manutenção"
                value={2}
                icon={Wrench}
                colorClass="bg-blue-500"
            />
            <DashboardCard
                title="Checklists Pendentes"
                value={5}
                icon={ClipboardList}
                colorClass="bg-purple-500"
            />
            <DashboardCard
                title="Custo Mensal Diesel"
                value="R$ 12.450"
                icon={DollarSign}
                colorClass="bg-emerald-600"
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
            <div className="text-center space-y-4">
              <p className="text-6xl font-bold text-primary-600">92%</p>
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden mx-8">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: '92%' }} />
              </div>
              <p className="text-xl font-semibold text-green-600">Excelente</p>
            </div>
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
            <div className="space-y-3">
              <p className="text-xl font-bold text-gray-900">TR-001</p>
              <p className="text-sm text-gray-600">John Deere 6110J</p>
              <p className="text-3xl font-bold text-green-600">97%</p>
            </div>
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
            <div className="space-y-3">
              <p className="text-xl font-bold text-gray-900">TR-007</p>
              <p className="text-sm text-gray-600">New Holland TT4.75</p>
              <p className="text-3xl font-bold text-red-600">63%</p>
            </div>
          </CardContent>
        </Card>
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
