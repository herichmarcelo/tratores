import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Tractor,
  Calendar,
  Gauge,
  Loader2,
  X,
  Fuel,
  Zap,
  MapPin,
  SlidersHorizontal,
  Hourglass,
  Wrench,
  Pause,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTratores, useCreateTrator, useFazendas, useSetores, useAbastecimentos } from '../hooks';
import { TractorImage } from '../components/TractorImage';
import { ImageUpload } from '../components/ImageUpload';
import { uploadToCloudinary } from '../services/cloudinary';

const getStatusColor = (status: string) => {
  const lower = status.toLowerCase();
  if (lower.includes('ativo') || lower.includes('active') || lower.includes('ok')) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (lower.includes('manutenção') || lower.includes('em_andamento') || lower.includes('pendente')) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  if (lower.includes('inativo')) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    ativo: 'Ativo',
    pendente: 'Pendente',
    em_andamento: 'Em Manutenção',
    inativo: 'Inativo',
  };
  return map[status.toLowerCase()] || status;
};

const initialFormState = {
  patrimonio: '',
  marca: '',
  modelo: '',
  ano: '',
  setor: '',
  horimetro_atual: '',
  status: 'ativo',
  fazenda_id: '',
};

export const Tratores: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('todos');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: abastecimentos } = useAbastecimentos();
  const { data: fazendas } = useFazendas();
  const { data: setores } = useSetores();
  const { mutateAsync: createTrator, isPending: isCreating } = useCreateTrator();

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setForm(initialFormState);
    setFormError('');
    setImageFile(null);
    setImagePreview(null);
    setIsUploadingImage(false);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError('');
  };

  const handleImageClear = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleCreateTrator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patrimonio.trim()) {
      setFormError('O patrimônio é obrigatório.');
      return;
    }

    try {
      let imagemUrl: string | undefined;
      if (imageFile) {
        setIsUploadingImage(true);
        imagemUrl = await uploadToCloudinary(imageFile);
        setIsUploadingImage(false);
      }

      await createTrator({
        patrimonio: form.patrimonio.trim(),
        marca: form.marca.trim() || undefined,
        modelo: form.modelo.trim() || undefined,
        ano: form.ano ? parseInt(form.ano, 10) : undefined,
        setor: form.setor.trim() || undefined,
        horimetro_atual: form.horimetro_atual ? parseFloat(form.horimetro_atual) : undefined,
        status: form.status,
        fazenda_id: form.fazenda_id || undefined,
        imagem_url: imagemUrl,
      });
      handleCloseModal();
    } catch (err) {
      setIsUploadingImage(false);
      const message = (err as { message?: string })?.message || 'Erro ao criar trator.';
      if (message.includes('duplicate') || message.includes('unique')) {
        setFormError('Já existe um trator com este patrimônio.');
      } else {
        setFormError(message);
      }
    }
  };

  const tratoresAtivos = tratores?.filter(t => t.status.toLowerCase() === 'ativo').length || 0;
  const tratoresManutencao = tratores?.filter(t => t.status.toLowerCase() === 'pendente' || t.status.toLowerCase() === 'em_andamento').length || 0;
  const totalTratores = tratores?.length || 0;
  const tratoresInativos = totalTratores - (tratoresAtivos + tratoresManutencao);
  const pctAtivos = totalTratores ? ((tratoresAtivos / totalTratores) * 100).toFixed(1) : '0';
  const pctManutencao = totalTratores ? ((tratoresManutencao / totalTratores) * 100).toFixed(1) : '0';
  const pctInativos = totalTratores ? ((tratoresInativos / totalTratores) * 100).toFixed(1) : '0';

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

  const ultimoAbastecimentoPorTrator = useMemo(() => {
    const map = new Map<string, { data: string; litros: number }>();
    abastecimentos?.forEach((ab) => {
      if (!map.has(ab.trator_id)) {
        map.set(ab.trator_id, {
          data: new Date(ab.data_abastecimento).toLocaleDateString('pt-BR'),
          litros: ab.litros_abastecidos,
        });
      }
    });
    return map;
  }, [abastecimentos]);

  const handleViewTrator = (id: string) => navigate(`/tratores/${id}`);

  return (
    <div className="lg:p-6 space-y-6">
      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tratores</h1>
          <p className="text-gray-500 mt-1">Gerencie sua frota</p>
        </div>
        <Button
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          Adicionar Trator
        </Button>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden bg-gray-50 min-h-[calc(100vh-8rem)] pb-24">
        {/* Busca + Filtros */}
        <div className="px-4 pt-4 pb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por patrimônio, marca, modelo..."
              className="pl-10 pr-4 bg-white border-gray-200 rounded-xl h-11 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="shrink-0 h-11 rounded-xl border-gray-200 bg-white flex items-center gap-2 text-gray-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Stats compactos — 4 colunas na tela */}
        <div className="px-4 pb-3 grid grid-cols-4 gap-2">
          {[
            {
              icon: Tractor,
              iconBg: 'bg-green-500',
              label: 'Total',
              value: totalTratores,
              subtitle: 'Cadastrados',
            },
            {
              icon: Tractor,
              iconBg: 'bg-blue-500',
              label: 'Ativos',
              value: tratoresAtivos,
              subtitle: `${Number(pctAtivos).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% da frota`,
            },
            {
              icon: Wrench,
              iconBg: 'bg-amber-500',
              label: 'Manutenção',
              value: tratoresManutencao,
              subtitle: `${Number(pctManutencao).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% da frota`,
            },
            {
              icon: Pause,
              iconBg: 'bg-red-500',
              label: 'Inativos',
              value: tratoresInativos,
              subtitle: `${Number(pctInativos).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% da frota`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 min-w-0 flex flex-col"
            >
              <div className="flex items-start justify-between gap-0.5 mb-1">
                <div className={`w-7 h-7 rounded-full ${stat.iconBg} flex items-center justify-center shrink-0`}>
                  <stat.icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] text-gray-500 font-medium leading-tight text-right line-clamp-2">
                  {stat.label}
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900 leading-none text-center">
                {tratoresLoading ? '—' : stat.value}
              </p>
              <p className="text-[8px] text-gray-400 text-center mt-1 leading-tight line-clamp-2">
                {stat.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs de filtro */}
        <div className="px-4 pb-2 flex gap-5 overflow-x-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'manutencao', label: 'Manutenção' },
            { id: 'inativos', label: 'Inativos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm whitespace-nowrap pb-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-gray-900 font-bold'
                  : 'text-gray-500 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista de cards */}
        <div className="px-4 space-y-3 pt-1">
          {tratoresLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : tratoresFiltrados.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Nenhum trator encontrado</div>
          ) : (
            tratoresFiltrados.map((trator) => {
              const ultimoAbast = ultimoAbastecimentoPorTrator.get(trator.id);
              return (
                <Card key={trator.id} className="border-none shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-3.5">
                    <div className="flex gap-3">
                      <TractorImage
                        src={trator.imagem_url}
                        alt={`${trator.marca} ${trator.modelo}`}
                        size="wide"
                        fit="contain"
                        bordered={false}
                        className="w-[88px] h-[68px] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-base leading-tight">{trator.patrimonio}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {trator.marca} {trator.modelo}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(trator.status)} shrink-0 text-xs`}>
                            {formatStatus(trator.status)}
                          </Badge>
                        </div>

                        <div className="flex items-start justify-between gap-2 mt-2">
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Hourglass className="w-3.5 h-3.5 text-gray-400" />
                              {trator.horimetro_atual != null
                                ? `${trator.horimetro_atual.toLocaleString('pt-BR')} h`
                                : '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Fuel className="w-3.5 h-3.5 text-gray-400" />
                              {trator.capacidade_tanque ? `${trator.capacidade_tanque} L` : '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-gray-400" />
                              {trator.potencia_cv ? `${trator.potencia_cv} CV` : '—'}
                            </span>
                          </div>
                          {ultimoAbast && (
                            <div className="text-right shrink-0">
                              <p className="text-[10px] text-gray-400 leading-tight">Últ. Abast.:</p>
                              <p className="text-[11px] text-gray-600">{ultimoAbast.data}</p>
                              <p className="text-sm font-semibold text-green-600 leading-tight">
                                {ultimoAbast.litros} Litros
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <p className="flex items-center gap-1 text-xs text-gray-400 min-w-0 truncate pr-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {[trator.fazenda?.nome, trator.setor].filter(Boolean).join(' • ') || 'Sem localização'}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-primary-600 border-gray-200 hover:bg-primary-50 hover:border-primary-200"
                          onClick={() => handleViewTrator(trator.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-gray-500 border-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-gray-500 border-gray-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* FAB Novo Trator */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-[4.5rem] right-4 z-30 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg pl-4 pr-5 py-3 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold text-sm">Novo Trator</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Adicionar Trator</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateTrator} className="p-6 space-y-4">
              <ImageUpload
                preview={imagePreview}
                onFileSelect={handleImageSelect}
                onClear={handleImageClear}
                isUploading={isUploadingImage}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patrimônio *
                </label>
                <Input
                  placeholder="Ex: TR-019"
                  value={form.patrimonio}
                  onChange={(e) => handleFormChange('patrimonio', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <Input
                    placeholder="Ex: John Deere"
                    value={form.marca}
                    onChange={(e) => handleFormChange('marca', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <Input
                    placeholder="Ex: 6110J"
                    value={form.modelo}
                    onChange={(e) => handleFormChange('modelo', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                  <Input
                    type="number"
                    placeholder="Ex: 2024"
                    value={form.ano}
                    onChange={(e) => handleFormChange('ano', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horímetro atual</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0"
                    value={form.horimetro_atual}
                    onChange={(e) => handleFormChange('horimetro_atual', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="inativo">Inativo</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fazenda</label>
                  <Select
                    value={form.fazenda_id}
                    onChange={(e) => handleFormChange('fazenda_id', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {fazendas?.map((fazenda) => (
                      <option key={fazenda.id} value={fazenda.id}>
                        {fazenda.nome}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                <Select
                  value={form.setor}
                  onChange={(e) => handleFormChange('setor', e.target.value)}
                >
                  <option value="">Selecione um setor...</option>
                  {setores?.map((setor) => (
                    <option key={setor.id} value={setor.nome}>
                      {setor.nome}{setor.fazenda ? ` — ${setor.fazenda.nome}` : ''}
                    </option>
                  ))}
                </Select>
              </div>
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700"
                  disabled={isCreating || isUploadingImage}
                >
                  {isCreating || isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Trator'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards — desktop */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Filters — desktop */}
      <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <SlidersHorizontal className="w-4 h-4" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Mobile: cards — rendered above in mobile layout section */}

      {/* Desktop: tabela */}
      <Card className="hidden lg:block border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {tratoresLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : tratoresFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum trator encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Patrimônio</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Trator</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Marca / Modelo</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Ano</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Horímetro</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Fazenda / Setor</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tratoresFiltrados.map((trator) => (
                    <tr key={trator.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 align-middle">
                        <span className="font-semibold text-gray-900">{trator.patrimonio}</span>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-4">
                          <TractorImage
                            src={trator.imagem_url}
                            alt={`${trator.marca} ${trator.modelo}`}
                            size="wide"
                            fit="contain"
                            bordered={false}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {trator.marca} {trator.modelo}
                            </p>
                            <p className="text-sm text-gray-500 lg:hidden">
                              {trator.ano || '—'} · {trator.horimetro_atual ?? '—'} h
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-700 hidden lg:table-cell">
                        {trator.marca} {trator.modelo}
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-700 hidden md:table-cell">
                        {trator.ano || '—'}
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-700 hidden md:table-cell">
                        {trator.horimetro_atual != null ? `${trator.horimetro_atual} h` : '—'}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <Badge className={getStatusColor(trator.status)}>
                          {trator.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-gray-600 hidden xl:table-cell">
                        <div>
                          {trator.fazenda?.nome && <p>{trator.fazenda.nome}</p>}
                          {trator.setor && <p className="text-xs text-gray-400">{trator.setor}</p>}
                          {!trator.fazenda?.nome && !trator.setor && '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-primary-600"
                            onClick={() => handleViewTrator(trator.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-500">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
