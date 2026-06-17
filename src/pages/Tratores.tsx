import React, { useState } from 'react';
import {
  Tractor,
  Search,
  Plus,
  Filter,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Home,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

// Mock data for tractors
const mockTractors = [
  {
    id: '1',
    patrimony: 'TR-001',
    brand: 'John Deere',
    model: '6110J',
    year: 2022,
    hourmeter: 5823,
    tankCapacity: 220,
    power: 110,
    farm: 'Matriz',
    sector: 'Lavouras Norte',
    status: 'active' as const,
    lastRefuel: { date: '18/05/2024', liters: 120.5 },
    photo: 'https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    patrimony: 'TR-002',
    brand: 'Massey Ferguson',
    model: '4292',
    year: 2021,
    hourmeter: 7245,
    tankCapacity: 180,
    power: 95,
    farm: 'Fazenda Santa Luzia',
    sector: 'Talhão 04',
    status: 'active' as const,
    lastRefuel: { date: '17/05/2024', liters: 110 },
    photo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    patrimony: 'TR-003',
    brand: 'New Holland',
    model: 'TL75',
    year: 2020,
    hourmeter: 10234,
    tankCapacity: 150,
    power: 75,
    farm: 'Fazenda Santa Luzia',
    sector: 'Talhão 02',
    status: 'maintenance' as const,
    lastRefuel: { date: '16/05/2024', liters: 80 },
    photo: 'https://images.unsplash.com/photo-1599835269762-d6e10054c684?w=100&h=100&fit=crop',
  },
  {
    id: '4',
    patrimony: 'TR-004',
    brand: 'Valtra',
    model: 'A950',
    year: 2022,
    hourmeter: 4987,
    tankCapacity: 200,
    power: 100,
    farm: 'Matriz',
    sector: 'Lavouras Sul',
    status: 'active' as const,
    lastRefuel: { date: '15/05/2024', liters: 130 },
    photo: 'https://images.unsplash.com/photo-1580702923830-2c8f328439e1?w=100&h=100&fit=crop',
  },
  {
    id: '5',
    patrimony: 'TR-005',
    brand: 'Case Farmall',
    model: '80',
    year: 2019,
    hourmeter: 6123,
    tankCapacity: 150,
    power: 80,
    farm: 'Fazenda Santa Rosa',
    sector: 'Talhão 03',
    status: 'inactive' as const,
    lastRefuel: { date: '14/05/2024', liters: 90 },
    photo: 'https://images.unsplash.com/photo-1581092160562-38a620431964?w=100&h=100&fit=crop',
  },
  {
    id: '6',
    patrimony: 'TR-006',
    brand: 'John Deere',
    model: '5075E',
    year: 2023,
    hourmeter: 2145,
    tankCapacity: 128,
    power: 75,
    farm: 'Matriz',
    sector: 'Talhão 03',
    status: 'active' as const,
    lastRefuel: { date: '18/05/2024', liters: 100.5 },
    photo: 'https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop',
  },
  {
    id: '7',
    patrimony: 'TR-007',
    brand: 'New Holland',
    model: 'TT4.75',
    year: 2018,
    hourmeter: 8512,
    tankCapacity: 110,
    power: 75,
    farm: 'Fazenda Boa Vista',
    sector: 'Pasto 1',
    status: 'inactive' as const,
    lastRefuel: { date: '10/05/2024', liters: 70 },
    photo: 'https://images.unsplash.com/photo-1599835269762-d6e10054c684?w=100&h=100&fit=crop',
  },
  {
    id: '8',
    patrimony: 'TR-008',
    brand: 'Massey Ferguson',
    model: '5711',
    year: 2023,
    hourmeter: 1250,
    tankCapacity: 170,
    power: 110,
    farm: 'Matriz',
    sector: 'Lavouras Sul',
    status: 'active' as const,
    lastRefuel: { date: '18/05/2024', liters: 110 },
    photo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100&h=100&fit=crop',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>;
    case 'maintenance':
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Em Manutenção</Badge>;
    case 'inactive':
      return <Badge className="bg-red-50 text-red-700 border-red-200">Inativo</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

export const Tratores: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="bg-background min-h-screen">
      {/* Page header */}
      <div className="px-4 lg:px-6 pt-4 lg:pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Tractor className="w-7 h-7 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Tratores</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Tratores</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-6 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Lista de Tratores
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'register' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Cadastrar Trator
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <Tractor className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Tratores</p>
                <p className="text-3xl font-bold text-green-600">18</p>
                <p className="text-xs text-gray-400">Cadastrados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Tractor className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tratores Ativos</p>
                <p className="text-3xl font-bold text-blue-600">15</p>
                <p className="text-xs text-gray-400">83,3% da frota</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <Tractor className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Em Manutenção</p>
                <p className="text-3xl font-bold text-amber-600">2</p>
                <p className="text-xs text-gray-400">11,1% da frota</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <Tractor className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inativos</p>
                <p className="text-3xl font-bold text-red-600">1</p>
                <p className="text-xs text-gray-400">5,6% da frota</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="border-none shadow-sm mb-4">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1 lg:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por patrimônio, marca, modelo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-gray-200"
                />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-gray-200">
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="maintenance">Em Manutenção</option>
                <option value="inactive">Inativos</option>
              </Select>
              <Button variant="ghost" className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span className="hidden lg:inline">Filtros</span>
              </Button>
              <div className="flex-1"></div>
              <Button className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Novo Trator</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tractors Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Patrimônio
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Trator
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Marca / Modelo
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ano
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Horímetro
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tanque (L)
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Potência (CV)
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fazenda / Setor
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Último Abastecimento
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockTractors.map((tractor) => (
                    <tr key={tractor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-semibold text-gray-900">
                        {tractor.patrimony}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <img src={tractor.photo} alt={tractor.model} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-gray-800">{tractor.brand} {tractor.model}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">
                        {tractor.brand} / {tractor.model}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">
                        {tractor.year}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`text-sm font-medium ${tractor.hourmeter > 10000 ? 'text-amber-500' : 'text-gray-700'}`}>
                          {tractor.hourmeter.toLocaleString('pt-BR')} h
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">
                        {tractor.tankCapacity}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">
                        {tractor.power}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        {getStatusBadge(tractor.status)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                        {tractor.farm}
                        <br />
                        <span className="text-xs text-gray-400">{tractor.sector}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                        {tractor.lastRefuel.date}
                        <br />
                        <span className="text-xs text-gray-400">{tractor.lastRefuel.liters} L</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600 hover:bg-primary-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600 hover:bg-primary-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 lg:px-6 py-4 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Mostrando 1 a {mockTractors.length} de 18 tratores
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
  );
};