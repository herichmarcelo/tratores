import React, { useState } from 'react';
import {
  Tractor,
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
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  MoreHorizontal,
  Gauge,
  Leaf,
  Wrench,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MainLayout } from '../layouts/MainLayout';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('01/05/2026 - 18/05/2026');

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="px-4 lg:px-6 pt-4 lg:pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
              <Home className="w-4 h-4" />
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Relatórios</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{dateRange}</span>
              </Button>
              <Select className="border-gray-200 w-48">
                <option>Todas as Unidades</option>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </Button>
              <Button className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filtros Avançados</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Litros Abastecidos</p>
                    <p className="text-lg font-bold text-gray-900">25.430,50 L</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+8,3% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Custo Total (RS)</p>
                    <p className="text-lg font-bold text-gray-900">R$ 148.732,20</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+6,7% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Horas Trabalhadas</p>
                    <p className="text-lg font-bold text-gray-900">1.254,30 h</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+7,9% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Consumo Médio</p>
                    <p className="text-lg font-bold text-gray-900">20,28 L/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown className="w-3 h-3" />
                  <span>-4,2% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Eficiência da Frota</p>
                    <p className="text-lg font-bold text-gray-900">92%</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+8% vs período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Manutenções</p>
                    <p className="text-lg font-bold text-gray-900">18</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>↓5 vs período anterior</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">Consumo de Combustível</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">Litros</Badge>
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 p-4">
                  <div className="flex items-end justify-between h-full gap-1">
                    {[2000, 2100, 2300, 2500, 2600, 2800, 3000, 3200, 3450, 3000, 2900, 3100, 3200].map((height, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm"
                          style={{ height: `${(height / 3500) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500">{String(idx + 1).padStart(2, '0')}/05</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">Consumo por Trator</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">Top 10</Badge>
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-8 h-48">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="#e5e7eb" />
                      <circle cx="50" cy="50" r="40" fill="#0F6D2B" strokeDasharray="30 220" transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="#198754" strokeDasharray="25 220" transform="rotate(-90 50 50)" strokeDashoffset="-30" />
                      <circle cx="50" cy="50" r="40" fill="#FFC107" strokeDasharray="20 220" transform="rotate(-90 50 50)" strokeDashoffset="-55" />
                      <circle cx="50" cy="50" r="40" fill="#F97316" strokeDasharray="15 220" transform="rotate(-90 50 50)" strokeDashoffset="-75" />
                      <circle cx="50" cy="50" r="40" fill="#EF4444" strokeDasharray="10 220" transform="rotate(-90 50 50)" strokeDashoffset="-90" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xs text-gray-500">Total</span>
                      <span className="text-sm font-bold text-gray-900">25.430,50 L</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[
                      { color: '#0F6D2B', label: 'TR-001 - John Deere 6110J', value: '6.250,50 L' },
                      { color: '#198754', label: 'TR-002 - Massey Ferguson 4292', value: '4.850,30 L' },
                      { color: '#FFC107', label: 'TR-003 - New Holland TL75', value: '3.820,00 L' },
                      { color: '#F97316', label: 'TR-004 - Valtra A950', value: '3.150,20 L' },
                      { color: '#EF4444', label: 'TR-005 - Case Farmall 80', value: '2.780,01 L' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-700 flex-1">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">Horas Trabalhadas por Dia</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">Horas</Badge>
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 p-4">
                  <div className="flex items-end justify-between h-full gap-1">
                    {[90, 95, 100, 105, 110, 115, 120, 125, 128, 110, 105, 100, 95].map((height, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm"
                          style={{ height: `${(height / 130) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500">{String(idx + 1).padStart(2, '0')}/05</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">Eficiência da Frota (%)</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="text-xs text-green-600">● TR-001</span>
                    <span className="text-xs text-amber-500">● TR-002</span>
                    <span className="text-xs text-red-500">● TR-003</span>
                    <span className="text-xs text-blue-500">● TR-004</span>
                    <span className="text-xs text-purple-500">● TR-005</span>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 p-4">
                  <div className="flex items-end justify-between h-full gap-1">
                    {[90, 92, 94, 93, 95, 96, 94, 95, 97, 96, 94, 95, 96].map((height, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-sm"
                          style={{ height: `${(height / 100) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500">{String(idx + 1).padStart(2, '0')}/05</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900">Resumo por Trator</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Trator
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Horas Trabalhadas (h)
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Litros (L)
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Consumo Médio (L/h)
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Custo (RS)
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Eficiência (%)
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Checklists
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Manutenções
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Situação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {relatoriosTractors.map((tractor) => (
                      <tr key={tractor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                              <img
                                src={tractor.image}
                                alt={tractor.model}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{tractor.patrimony} - {tractor.brand} {tractor.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 text-sm text-gray-700">{tractor.hoursWorked.toFixed(2)}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm text-gray-700">{tractor.liters.toFixed(2)}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm text-gray-700">{tractor.consumption.toFixed(2)}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm text-gray-700">R$ {tractor.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 lg:px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${tractor.efficiency}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{tractor.efficiency}%</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{tractor.checklists}/{tractor.checklists + 1}</span>
                            <span className="text-xs text-green-600">{tractor.checklistsPercent}%</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 text-sm text-gray-700">{tractor.maintenances}</td>
                        <td className="px-4 lg:px-6 py-3">
                          <Badge className="bg-green-50 text-green-700 border-green-200">{tractor.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 lg:px-6 py-4 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Mostrando 1 a {relatoriosTractors.length} de 18 tratores
                </p>
                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Linhas por página:</span>
                    <Select className="w-24 border-gray-200">
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="default" size="sm" className="bg-primary-600 w-8 h-8 p-0 rounded-md">1</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md text-gray-700 hover:bg-gray-100">2</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md text-gray-700 hover:bg-gray-100">3</Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-md text-gray-700 hover:bg-gray-100">4</Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Relatorios;