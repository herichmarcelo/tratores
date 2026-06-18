import React, { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  Tractor,
  Calendar,
  Clock,
  Gauge,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTratores, useVwEficienciaTratores } from '../hooks';

const getStatusColor = (status: string) => {
  const lower = status.toLowerCase();
  if (lower.includes('ativo') || lower.includes('active') || lower.includes('ok')) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (lower.includes('manutenção') || lower.includes('pendente') || lower.includes('inativo')) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getFuelIconColor = (eficiencia: number | null | undefined) => {
  if (!eficiencia) return 'text-gray-500';
  return eficiencia >= 90 ? 'text-green-500' : eficiencia >= 75 ? 'text-amber-500' : 'text-red-500';
};

export const Tratores: React.FC = () => {
  const [activeTab, setActiveTab] = useState('todos');
  const [search, setSearch] = useState('');
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: eficienciaTratores, isLoading: eficienciaLoading } = useVwEficienciaTratores();

  const tratoresAtivos = tratores?.filter(t => t.status.toLowerCase() === 'ativo').length || 0;
  const tratoresManutencao = tratores?.filter(t => t.status.toLowerCase() === 'pendente' || t.status.toLowerCase() === 'em_andamento').length || 0;
  const tratoresInativos = (tratores?.length || 0) - (tratoresAtivos + tratoresManutencao);

  const tratoresFiltrados = tratores?.filter((trator) => {
    const matchesSearch = trator.patrimonio.toLowerCase().includes(search.toLowerCase())
      || (trator.marca && trator.marca.toLowerCase().includes(search.toLowerCase()))
      || (trator.modelo && trator.modelo.toLowerCase().includes(search.toLowerCase()));
    let matchesTab = true;
    if (activeTab === 'ativos') matchesTab = trator.status.toLowerCase() === 'ativo';
    if (activeTab === 'manutencao') matchesTab = ['pendente', 'em_andamento'].includes(trator.status.toLowerCase());
    if (activeTab === 'inativos') matchesTab = !['ativo', 'pendente', 'em_andamento'].includes(trator.status.toLowerCase());
    return matchesSearch && matchesTab;
  }) || [];

  const getEficienciaForTrator = (id: string): number => {
    const ef = eficienciaTratores?.find(e => e.trator_id === id);
    return ef?.eficiencia_percentual || 0;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tratores</h1>
          <p className="text-gray-500 mt-1">Gerencie sua frota</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Trator
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Tractor className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Tratores Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tratoresLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tratoresAtivos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Gauge className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Em Manutenção</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tratoresLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tratoresManutencao}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Inativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tratoresLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tratoresInativos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'todos' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('ativos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'ativos' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setActiveTab('manutencao')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'manutencao' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manutenção
          </button>
          <button
            onClick={() => setActiveTab('inativos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'inativos' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inativos
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              placeholder="Buscar trator..."
              className="pl-10 pr-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Tractors List */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {tratoresLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : (
            <>
              {tratoresFiltrados.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhum trator encontrado
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tratoresFiltrados.map((trator) => (
                    <div
                      key={trator.id}
                      className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-1">
                        <img
                          src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=200&h=200&fit=crop"
                          alt={trator.modelo}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{trator.patrimonio}</h3>
                          <Badge className={getStatusColor(trator.status)}>
                            {trator.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{trator.marca} {trator.modelo} {trator.ano}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            {trator.horimetro_atual} h
                          </div>
                          {trator.setor && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {trator.setor}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${getEficienciaForTrator(trator.id)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${getFuelIconColor(getEficienciaForTrator(trator.id))}`}>
                          {getEficienciaForTrator(trator.id)}%
                        </span>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-500">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
