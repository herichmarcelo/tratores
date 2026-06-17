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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { cn } from '../utils';

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
    farm: 'Matriz',
    sector: 'Lavouras Norte',
    status: 'active' as const,
    photo: 'https://res.cloudinary.com/dmcgufpyk/image/upload/v1234567890/tractor1.jpg',
  },
  {
    id: '2',
    patrimony: 'TR-002',
    brand: 'Massey Ferguson',
    model: '4292',
    year: 2021,
    hourmeter: 7245,
    tankCapacity: 180,
    farm: 'Fazenda Santa Luzia',
    sector: 'Talhão 04',
    status: 'active' as const,
    photo: 'https://res.cloudinary.com/dmcgufpyk/image/upload/v1234567890/tractor2.jpg',
  },
  {
    id: '3',
    patrimony: 'TR-003',
    brand: 'New Holland',
    model: 'TL75',
    year: 2020,
    hourmeter: 10234,
    tankCapacity: 150,
    farm: 'Fazenda Santa Luzia',
    sector: 'Talhão 02',
    status: 'maintenance' as const,
    photo: 'https://res.cloudinary.com/dmcgufpyk/image/upload/v1234567890/tractor3.jpg',
  },
  {
    id: '4',
    patrimony: 'TR-004',
    brand: 'Valtra',
    model: 'A950',
    year: 2022,
    hourmeter: 4987,
    tankCapacity: 200,
    farm: 'Matriz',
    sector: 'Lavouras Sul',
    status: 'active' as const,
    photo: 'https://res.cloudinary.com/dmcgufpyk/image/upload/v1234567890/tractor4.jpg',
  },
  {
    id: '5',
    patrimony: 'TR-005',
    brand: 'Case Farmall',
    model: '80',
    year: 2019,
    hourmeter: 6123,
    tankCapacity: 150,
    farm: 'Fazenda Santa Rosa',
    sector: 'Talhão 03',
    status: 'inactive' as const,
    photo: 'https://res.cloudinary.com/dmcgufpyk/image/upload/v1234567890/tractor5.jpg',
  },
];

const stats = [
  { label: 'Total de Tratores', value: '18', sublabel: 'Cadastrados', icon: Tractor, color: 'bg-green-500' },
  { label: 'Tratores Ativos', value: '15', sublabel: '83,3% da frota', icon: Tractor, color: 'bg-blue-500' },
  { label: 'Em Manutenção', value: '2', sublabel: '11,1% da frota', icon: Tractor, color: 'bg-amber-500' },
  { label: 'Inativos', value: '1', sublabel: '5,6% da frota', icon: Tractor, color: 'bg-red-500' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default">Ativo</Badge>;
    case 'maintenance':
      return <Badge variant="warning">Em Manutenção</Badge>;
    case 'inactive':
      return <Badge variant="destructive">Inativo</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

export const Tratores: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tratores</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Home</span>
            <span>/</span>
            <span>Tratores</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.sublabel}</p>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por patrimônio, marca, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="maintenance">Em Manutenção</option>
            <option value="inactive">Inativos</option>
          </Select>
          <Select className="w-full md:w-40">
            <option value="all">Todas as Fazendas</option>
            <option value="matriz">Matriz</option>
            <option value="santa-luzia">Fazenda Santa Luzia</option>
          </Select>
          <Select className="w-full md:w-40">
            <option value="all">Todos os Setores</option>
            <option value="norte">Lavouras Norte</option>
            <option value="sul">Lavouras Sul</option>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Limpar filtros
          </Button>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Trator
        </Button>
      </div>

      {/* Tractors Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Patrimônio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Trator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Marca / Modelo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ano
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Horímetro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tanque (L)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Potência (CV)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fazenda / Setor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Último Abastecimento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockTractors.map((tractor) => (
                  <tr key={tractor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {tractor.patrimony}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                          <Tractor className="w-6 h-6 text-primary-600" />
                        </div>
                        <span className="text-sm text-gray-700">{tractor.brand} {tractor.model}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {tractor.brand} / {tractor.model}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {tractor.year}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <span className={tractor.hourmeter > 10000 ? 'text-amber-600' : 'text-gray-700'}>
                        {tractor.hourmeter.toLocaleString('pt-BR')} h
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {tractor.tankCapacity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      110
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(tractor.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {tractor.farm}
                      <br />
                      <span className="text-xs text-gray-500">{tractor.sector}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      18/05/2024
                      <br />
                      <span className="text-xs text-gray-500">120,5 L</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
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
          <div className="px-4 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Mostrando 1 a {mockTractors.length} de 18 tratores
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="default" size="sm" className="bg-primary-600">1</Button>
              <Button variant="ghost" size="sm">2</Button>
              <Button variant="ghost" size="sm">3</Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};