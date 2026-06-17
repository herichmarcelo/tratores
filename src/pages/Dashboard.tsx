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
          title="Eficiência da Frota"
          value="87%"
          icon={TrendingUp}
          colorClass="bg-teal-500"
        />
        <DashboardCard
          title="Operadores Ativos"
          value={8}
          icon={Users}
          colorClass="bg-indigo-500"
        />
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
