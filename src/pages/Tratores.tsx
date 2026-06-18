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
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTratores, useVwEficienciaTratores, useCreateTrator, useFazendas, useSetores } from '../hooks';
import { TractorImage } from '../components/TractorImage';
import { ImageUpload } from '../components/ImageUpload';
import { uploadToCloudinary } from '../services/cloudinary';

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
  const [activeTab, setActiveTab] = useState('todos');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: eficienciaTratores } = useVwEficienciaTratores();
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
        <Button
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          Adicionar Trator
        </Button>
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
                      <TractorImage
                        src={trator.imagem_url}
                        alt={`${trator.marca} ${trator.modelo}`}
                        size="sm"
                      />
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
