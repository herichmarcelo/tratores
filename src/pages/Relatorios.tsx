import React from 'react';
import {
  Fuel,
  Calendar,
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
  MoreHorizontal,
  Gauge,
  Leaf,
  Wrench,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TractorImage } from '../components/TractorImage';
import { useTratores } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';

const relatoriosTractors = [
  {
    id: 1,
    patrimony: 'TR-001',
    brand: 'John Deere',
    model: '6110J',
    hoursWorked: 245.3,
    liters: 6250.5,
    consumption: 25.49,
    cost: 36452.9,
    efficiency: 94,
    checklists: 14,
    checklistsPercent: 100,
    maintenances: 2,
    status: 'Ativo',
    image: 'https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    patrimony: 'TR-002',
    brand: 'Massey Ferguson',
    model: '4292',
    hoursWorked: 199.4,
    liters: 4850.3,
    consumption: 24.43,
    cost: 28332.9,
    efficiency: 97,
    checklists: 13,
    checklistsPercent: 93,
    maintenances: 3,
    status: 'Ativo',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    patrimony: 'TR-003',
    brand: 'New Holland',
    model: 'TL75',
    hoursWorked: 176.2,
    liters: 3820.0,
    consumption: 22.27,
    cost: 22261.6,
    efficiency: 89,
    checklists: 14,
    checklistsPercent: 100,
    maintenances: 1,
    status: 'Ativo',
    image: 'https://images.unsplash.com/photo-1599835269762-d6e10054c684?w=100&h=100&fit=crop',
  },
  {
    id: 4,
    patrimony: 'TR-004',
    brand: 'Valtra',
    model: 'A950',
    hoursWorked: 156.1,
    liters: 3150.2,
    consumption: 20.19,
    cost: 18401.7,
    efficiency: 98,
    checklists: 13,
    checklistsPercent: 93,
    maintenances: 2,
    status: 'Ativo',
    image: 'https://images.unsplash.com/photo-1580702923830-2c8f328439e1?w=100&h=100&fit=crop',
  },
  {
    id: 5,
    patrimony: 'TR-005',
    brand: 'Case Farmall',
    model: '80',
    hoursWorked: 132.3,
    liters: 2780.3,
    consumption: 21.03,
    cost: 16182.0,
    efficiency: 89,
    checklists: 12,
    checklistsPercent: 86,
    maintenances: 1,
    status: 'Ativo',
    image: 'https://images.unsplash.com/photo-1581092160562-38a620431964?w=100&h=100&fit=crop',
  },
];

const Relatorios: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const { data: tratores } = useTratores();

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  const getTratorImage = (patrimony: string) =>
    tratores?.find((t) => t.patrimonio === patrimony)?.imagem_url;

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
            <Button variant="outline" className="border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-[#B3B3B3] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>01/05/2026 - 18/05/2026</span>
            </Button>
            <Select className="border-gray-200 dark:border-[#2A2A2A] w-48 dark:bg-[#1A1A1A] dark:text-white">
              <option>Todas as Unidades</option>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-[#B3B3B3] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>
            <Button className="bg-ff-yellow text-black hover:brightness-110 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filtros Avançados</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-ff-green-active/20 flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-green-600 dark:text-ff-green-active" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Litros Abastecidos</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">25.430,50 L</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-ff-green-active">
                <TrendingUp className="w-3 h-3" />
                <span>+8,3% vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-[#14141A]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Custo Total (RS)</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">R$ 148.732,20</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-ff-green-active">
                <TrendingUp className="w-3 h-3" />
                <span>+6,7% vs período anterior</span>
              </div>
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
                  <p className="text-lg font-bold text-gray-900 dark:text-white">1.254,30 h</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-ff-green-active">
                <TrendingUp className="w-3 h-3" />
                <span>+7,9% vs período anterior</span>
              </div>
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
                  <p className="text-lg font-bold text-gray-900 dark:text-white">20,28 L/h</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-ff-green-active">
                <TrendingDown className="w-3 h-3" />
                <span>-4,2% vs período anterior</span>
              </div>
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
                  <p className="text-lg font-bold text-gray-900 dark:text-white">92%</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-ff-green-active">
                <TrendingUp className="w-3 h-3" />
                <span>+8% vs período anterior</span>
              </div>
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
                  <p className="text-lg font-bold text-gray-900 dark:text-white">18</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#B3B3B3]">
                <span>↓5 vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Consumo de Combustível</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Litros</Badge>
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-[#B3B3B3]" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 p-4">
                <div className="flex items-end justify-between h-full gap-1">
                  {[2000, 2100, 2300, 2500, 2600, 2800, 3000, 3200, 3450, 3000, 2900, 3100, 3200].map((height, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-ff-yellow to-ff-yellow/80 rounded-t-sm"
                        style={{ height: `${(height / 3500) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-[#B3B3B3]">{String(idx + 1).padStart(2, '0')}/05</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Consumo por Trator</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Top 10</Badge>
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-[#B3B3B3]" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-8 h-48">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="#e5e7eb" />
                    <circle cx="50" cy="50" r="40" fill="#3EC300" strokeDasharray="30 220" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="#FFC107" strokeDasharray="25 220" transform="rotate(-90 50 50)" strokeDashoffset="-30" />
                    <circle cx="50" cy="50" r="40" fill="#F97316" strokeDasharray="20 220" transform="rotate(-90 50 50)" strokeDashoffset="-55" />
                    <circle cx="50" cy="50" r="40" fill="#EF4444" strokeDasharray="15 220" transform="rotate(-90 50 50)" strokeDashoffset="-75" />
                    <circle cx="50" cy="50" r="40" fill="#3B82F6" strokeDasharray="10 220" transform="rotate(-90 50 50)" strokeDashoffset="-90" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xs text-gray-500 dark:text-[#B3B3B3]">Total</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">25.430,50 L</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { color: '#3EC300', label: 'TR-001 - John Deere 6110J', value: '6.250,50 L' },
                    { color: '#FFC107', label: 'TR-002 - Massey Ferguson 4292', value: '4.850,30 L' },
                    { color: '#F97316', label: 'TR-003 - New Holland TL75', value: '3.820,00 L' },
                    { color: '#EF4444', label: 'TR-004 - Valtra A950', value: '3.150,20 L' },
                    { color: '#3B82F6', label: 'TR-005 - Case Farmall 80', value: '2.780,01 L' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-700 dark:text-[#B3B3B3] flex-1">{item.label}</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Horas Trabalhadas por Dia</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Horas</Badge>
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-[#B3B3B3]" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 p-4">
                <div className="flex items-end justify-between h-full gap-1">
                  {[90, 95, 100, 105, 110, 115, 120, 125, 128, 110, 105, 100, 95].map((height, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-ff-yellow to-ff-yellow/80 rounded-t-sm"
                        style={{ height: `${(height / 130) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-[#B3B3B3]">{String(idx + 1).padStart(2, '0')}/05</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Eficiência da Frota (%)</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="text-xs text-ff-green-active">● TR-001</span>
                  <span className="text-xs text-ff-warning">● TR-002</span>
                  <span className="text-xs text-ff-danger">● TR-003</span>
                  <span className="text-xs text-blue-400">● TR-004</span>
                  <span className="text-xs text-purple-400">● TR-005</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-[#B3B3B3]" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 p-4">
                <div className="flex items-end justify-between h-full gap-1">
                  {[90, 92, 94, 93, 95, 96, 94, 95, 97, 96, 94, 95, 96].map((height, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-ff-green-active to-ff-green-active/80 rounded-t-sm"
                        style={{ height: `${(height / 100) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-[#B3B3B3]">{String(idx + 1).padStart(2, '0')}/05</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm dark:bg-[#14141A]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Resumo por Trator</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A]">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Trator
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Horas Trabalhadas (h)
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Litros (L)
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Consumo Médio (L/h)
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Custo (RS)
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Eficiência (%)
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Checklists
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Manutenções
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wider">
                      Situação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                  {relatoriosTractors.map((tractor) => (
                    <tr key={tractor.id} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-4 lg:px-6 py-3">
                        <div className="flex items-center gap-3">
                          <TractorImage
                            src={getTratorImage(tractor.patrimony) || tractor.image}
                            alt={tractor.model}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{tractor.patrimony} - {tractor.brand} {tractor.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">{tractor.hoursWorked.toFixed(2)}</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">{tractor.liters.toFixed(2)}</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">{tractor.consumption.toFixed(2)}</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">R$ {tractor.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 lg:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                              <div className="h-full bg-ff-green-active" style={{ width: `${tractor.efficiency}%` }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{tractor.efficiency}%</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 dark:text-[#B3B3B3]">{tractor.checklists}/{tractor.checklists + 1}</span>
                          <span className="text-xs text-ff-green-active">{tractor.checklistsPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-[#B3B3B3]">{tractor.maintenances}</td>
                      <td className="px-4 lg:px-6 py-3">
                        <Badge className="bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30">{tractor.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 lg:px-6 py-4 border-t border-gray-100 dark:border-[#2A2A2A] flex flex-col lg:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-[#B3B3B3]">
                Mostrando 1 a {relatoriosTractors.length} de 18 tratores
              </p>
              <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-[#B3B3B3]">Linhas por página:</span>
                  <Select className="w-24 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" disabled className="border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-[#B3B3B3]">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="default" size="sm" className="bg-ff-yellow text-black w-8 h-8 p-0 rounded-md">1</Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md text-gray-700 dark:text-[#B3B3B3] hover:bg-gray-100 dark:hover:bg-[#1A1A1A]">2</Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md text-gray-700 dark:text-[#B3B3B3] hover:bg-gray-100 dark:hover:bg-[#1A1A1A]">3</Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md text-gray-700 dark:text-[#B3B3B3] hover:bg-gray-100 dark:hover:bg-[#1A1A1A]">4</Button>
                  <Button variant="outline" size="icon" className="border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-[#B3B3B3]">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;
