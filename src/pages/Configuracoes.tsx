import React, { useState } from 'react';
import {
  Settings,
  Users,
  Building2,
  MapPin,
  Loader2,
  Plus,
  Edit,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  useUsuarios,
  useFazendas,
  useSetores,
  useCreateUsuario,
  useUpdateUsuario,
  useCreateFazenda,
  useCreateSetor,
} from '../hooks';
import { AvatarUploadField, UserAvatar } from '../components/UserAvatar';
import { uploadToCloudinary } from '../services/cloudinary';
import type { User, UserProfile } from '../types';

type ConfigTab = 'usuarios' | 'fazendas' | 'setores';

const perfilLabels: Record<UserProfile, string> = {
  administrador: 'Administrador',
  colaborador: 'Colaborador',
  gestor: 'Gestor',
};

const tabs: { id: ConfigTab; label: string; icon: React.ElementType }[] = [
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'fazendas', label: 'Fazendas', icon: Building2 },
  { id: 'setores', label: 'Setores', icon: MapPin },
];

export const Configuracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('usuarios');
  const [error, setError] = useState('');

  const { data: usuarios, isLoading: usuariosLoading } = useUsuarios();
  const { data: fazendas, isLoading: fazendasLoading } = useFazendas();
  const { data: setores, isLoading: setoresLoading } = useSetores();

  const { mutateAsync: createUsuario, isPending: creatingUsuario } = useCreateUsuario();
  const { mutateAsync: updateUsuario, isPending: updatingUsuario } = useUpdateUsuario();
  const { mutateAsync: createFazenda, isPending: creatingFazenda } = useCreateFazenda();
  const { mutateAsync: createSetor, isPending: creatingSetor } = useCreateSetor();

  const [editingUsuarioId, setEditingUsuarioId] = useState<string | null>(null);

  const [usuarioForm, setUsuarioForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: '',
    perfil: 'colaborador' as UserProfile,
    ativo: true,
  });
  const [usuarioFotoFile, setUsuarioFotoFile] = useState<File | null>(null);
  const [usuarioFotoPreview, setUsuarioFotoPreview] = useState<string | null>(null);
  const [isUploadingUsuarioFoto, setIsUploadingUsuarioFoto] = useState(false);

  const [fazendaForm, setFazendaForm] = useState({
    nome: '',
    razao_social: '',
    inscricao_estadual: '',
    cpf_proprietario: '',
    endereco: '',
    cidade: '',
    estado: '',
  });

  const [setorForm, setSetorForm] = useState({
    nome: '',
    fazenda_id: '',
  });

  const handleError = (err: unknown) => {
    const message = (err as { message?: string })?.message || 'Erro ao salvar.';
    if (message.includes('duplicate') || message.includes('unique')) {
      setError('Já existe um registro com esses dados.');
    } else {
      setError(message);
    }
  };

  const handleUsuarioFotoSelect = (file: File) => {
    setUsuarioFotoFile(file);
    setUsuarioFotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const resetUsuarioForm = () => {
    setEditingUsuarioId(null);
    setUsuarioForm({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      cargo: '',
      perfil: 'colaborador',
      ativo: true,
    });
    setUsuarioFotoFile(null);
    if (usuarioFotoPreview && usuarioFotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(usuarioFotoPreview);
    }
    setUsuarioFotoPreview(null);
  };

  const startEditUsuario = (usuario: User) => {
    setEditingUsuarioId(usuario.id);
    setUsuarioForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      confirmarSenha: '',
      cargo: usuario.cargo || '',
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    setUsuarioFotoFile(null);
    if (usuarioFotoPreview && usuarioFotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(usuarioFotoPreview);
    }
    setUsuarioFotoPreview(usuario.foto_url || null);
    setError('');
  };

  const handleUpdateUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!editingUsuarioId) return;
    if (!usuarioForm.nome.trim() || !usuarioForm.email.trim()) {
      setError('Nome e e-mail são obrigatórios.');
      return;
    }
    if (usuarioForm.senha || usuarioForm.confirmarSenha) {
      if (usuarioForm.senha.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (usuarioForm.senha !== usuarioForm.confirmarSenha) {
        setError('As senhas não coincidem.');
        return;
      }
    }
    try {
      let foto_url: string | undefined;
      if (usuarioFotoFile) {
        setIsUploadingUsuarioFoto(true);
        foto_url = await uploadToCloudinary(usuarioFotoFile, 'usuarios');
        setIsUploadingUsuarioFoto(false);
      }

      await updateUsuario({
        id: editingUsuarioId,
        nome: usuarioForm.nome.trim(),
        email: usuarioForm.email.trim(),
        cargo: usuarioForm.cargo.trim() || undefined,
        perfil: usuarioForm.perfil,
        ativo: usuarioForm.ativo,
        ...(foto_url ? { foto_url } : {}),
        ...(usuarioForm.senha ? { senha: usuarioForm.senha } : {}),
      });
      resetUsuarioForm();
    } catch (err) {
      setIsUploadingUsuarioFoto(false);
      handleError(err);
    }
  };

  const handleCreateUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usuarioForm.nome.trim() || !usuarioForm.email.trim()) {
      setError('Nome e e-mail são obrigatórios.');
      return;
    }
    if (!usuarioForm.senha) {
      setError('A senha é obrigatória.');
      return;
    }
    if (usuarioForm.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (usuarioForm.senha !== usuarioForm.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      let foto_url: string | undefined;
      if (usuarioFotoFile) {
        setIsUploadingUsuarioFoto(true);
        foto_url = await uploadToCloudinary(usuarioFotoFile, 'usuarios');
        setIsUploadingUsuarioFoto(false);
      }

      await createUsuario({
        nome: usuarioForm.nome.trim(),
        email: usuarioForm.email.trim(),
        senha: usuarioForm.senha,
        cargo: usuarioForm.cargo.trim() || undefined,
        perfil: usuarioForm.perfil,
        foto_url,
        ativo: true,
      });
      resetUsuarioForm();
    } catch (err) {
      setIsUploadingUsuarioFoto(false);
      handleError(err);
    }
  };

  const handleCreateFazenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fazendaForm.nome.trim()) {
      setError('O nome da fazenda é obrigatório.');
      return;
    }
    try {
      await createFazenda({
        nome: fazendaForm.nome.trim(),
        razao_social: fazendaForm.razao_social.trim() || undefined,
        inscricao_estadual: fazendaForm.inscricao_estadual.trim() || undefined,
        cpf_proprietario: fazendaForm.cpf_proprietario.trim() || undefined,
        endereco: fazendaForm.endereco.trim() || undefined,
        cidade: fazendaForm.cidade.trim() || undefined,
        estado: fazendaForm.estado.trim() || undefined,
        ativo: true,
      });
      setFazendaForm({
        nome: '',
        razao_social: '',
        inscricao_estadual: '',
        cpf_proprietario: '',
        endereco: '',
        cidade: '',
        estado: '',
      });
    } catch (err) {
      handleError(err);
    }
  };

  const handleCreateSetor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!setorForm.nome.trim()) {
      setError('O nome do setor é obrigatório.');
      return;
    }
    try {
      await createSetor({
        nome: setorForm.nome.trim(),
        fazenda_id: setorForm.fazenda_id || undefined,
        ativo: true,
      });
      setSetorForm({ nome: '', fazenda_id: '' });
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Settings className="w-7 h-7 text-primary-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Configurações</h1>
        </div>
        <p className="text-gray-500">Gerencie usuários, fazendas e setores do sistema</p>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'usuarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {editingUsuarioId ? (
                  <>
                    <Edit className="w-5 h-5 text-primary-600" />
                    Editar Usuário
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-primary-600" />
                    Novo Usuário
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingUsuarioId ? handleUpdateUsuario : handleCreateUsuario}
                className="space-y-4"
              >
                <AvatarUploadField
                  preview={usuarioFotoPreview}
                  nome={usuarioForm.nome}
                  onFileSelect={handleUsuarioFotoSelect}
                  isUploading={isUploadingUsuarioFoto}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <Input
                    value={usuarioForm.nome}
                    onChange={(e) => setUsuarioForm((f) => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <Input
                    type="email"
                    value={usuarioForm.email}
                    onChange={(e) => setUsuarioForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="joao@pluma.com.br"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingUsuarioId ? 'Nova senha (opcional)' : 'Senha *'}
                    </label>
                    <Input
                      type="password"
                      value={usuarioForm.senha}
                      onChange={(e) => setUsuarioForm((f) => ({ ...f, senha: e.target.value }))}
                      placeholder={editingUsuarioId ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                      required={!editingUsuarioId}
                      minLength={editingUsuarioId ? undefined : 6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingUsuarioId ? 'Confirmar nova senha' : 'Confirmar senha *'}
                    </label>
                    <Input
                      type="password"
                      value={usuarioForm.confirmarSenha}
                      onChange={(e) => setUsuarioForm((f) => ({ ...f, confirmarSenha: e.target.value }))}
                      placeholder={editingUsuarioId ? 'Repita se alterar a senha' : 'Repita a senha'}
                      required={!editingUsuarioId}
                      minLength={editingUsuarioId ? undefined : 6}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <Input
                    value={usuarioForm.cargo}
                    onChange={(e) => setUsuarioForm((f) => ({ ...f, cargo: e.target.value }))}
                    placeholder="Ex: Operador"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                    <Select
                      value={usuarioForm.perfil}
                      onChange={(e) => setUsuarioForm((f) => ({ ...f, perfil: e.target.value as UserProfile }))}
                    >
                      <option value="administrador">Administrador</option>
                      <option value="gestor">Gestor</option>
                      <option value="colaborador">Colaborador</option>
                    </Select>
                  </div>
                  {editingUsuarioId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <Select
                        value={usuarioForm.ativo ? 'ativo' : 'inativo'}
                        onChange={(e) => setUsuarioForm((f) => ({ ...f, ativo: e.target.value === 'ativo' }))}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </Select>
                    </div>
                  )}
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-3">
                  {editingUsuarioId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={resetUsuarioForm}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 flex-1"
                    disabled={creatingUsuario || updatingUsuario || isUploadingUsuarioFoto}
                  >
                    {creatingUsuario || updatingUsuario || isUploadingUsuarioFoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingUsuarioId ? (
                      'Salvar Alterações'
                    ) : (
                      'Salvar Usuário'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Usuários cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {usuariosLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                  {usuarios?.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">Nenhum usuário cadastrado</p>
                  ) : (
                    usuarios?.map((usuario) => (
                      <div
                        key={usuario.id}
                        className={`p-4 flex items-center gap-3 transition-colors ${
                          editingUsuarioId === usuario.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <UserAvatar src={usuario.foto_url} nome={usuario.nome} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{usuario.nome}</p>
                          <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
                          {usuario.cargo && (
                            <p className="text-xs text-gray-400 mt-0.5">{usuario.cargo}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge className="bg-primary-50 text-primary-700 border-primary-200">
                            {perfilLabels[usuario.perfil]}
                          </Badge>
                          <Badge className={usuario.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-primary-600 shrink-0"
                          onClick={() => startEditUsuario(usuario)}
                          title="Editar usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'fazendas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-600" />
                Nova Fazenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFazenda} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da fazenda *</label>
                  <Input
                    value={fazendaForm.nome}
                    onChange={(e) => setFazendaForm((f) => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: Fazenda Santa Luzia"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão social</label>
                  <Input
                    value={fazendaForm.razao_social}
                    onChange={(e) => setFazendaForm((f) => ({ ...f, razao_social: e.target.value }))}
                    placeholder="Ex: Santa Luzia Agropecuária Ltda"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição estadual</label>
                    <Input
                      value={fazendaForm.inscricao_estadual}
                      onChange={(e) => setFazendaForm((f) => ({ ...f, inscricao_estadual: e.target.value }))}
                      placeholder="Ex: 123.456.789-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF do proprietário</label>
                    <Input
                      value={fazendaForm.cpf_proprietario}
                      onChange={(e) => setFazendaForm((f) => ({ ...f, cpf_proprietario: e.target.value }))}
                      placeholder="Ex: 000.000.000-00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <Input
                    value={fazendaForm.endereco}
                    onChange={(e) => setFazendaForm((f) => ({ ...f, endereco: e.target.value }))}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <Input
                      value={fazendaForm.cidade}
                      onChange={(e) => setFazendaForm((f) => ({ ...f, cidade: e.target.value }))}
                      placeholder="Ex: Pato Branco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <Input
                      value={fazendaForm.estado}
                      onChange={(e) => setFazendaForm((f) => ({ ...f, estado: e.target.value }))}
                      placeholder="Ex: PR"
                      maxLength={2}
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 w-full"
                  disabled={creatingFazenda}
                >
                  {creatingFazenda ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Fazenda'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Fazendas cadastradas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {fazendasLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                  {fazendas?.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">Nenhuma fazenda cadastrada</p>
                  ) : (
                    fazendas?.map((fazenda) => (
                      <div key={fazenda.id} className="p-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{fazenda.nome}</p>
                          {fazenda.razao_social && (
                            <p className="text-sm text-gray-600">{fazenda.razao_social}</p>
                          )}
                          {fazenda.endereco && (
                            <p className="text-sm text-gray-500 mt-0.5">{fazenda.endereco}</p>
                          )}
                          {(fazenda.cidade || fazenda.estado) && (
                            <p className="text-sm text-gray-500">
                              {[fazenda.cidade, fazenda.estado].filter(Boolean).join(' - ')}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {fazenda.inscricao_estadual && (
                              <span className="text-xs text-gray-400">IE: {fazenda.inscricao_estadual}</span>
                            )}
                            {fazenda.cpf_proprietario && (
                              <span className="text-xs text-gray-400">CPF: {fazenda.cpf_proprietario}</span>
                            )}
                          </div>
                        </div>
                        <Badge className={`shrink-0 ${fazenda.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                          {fazenda.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'setores' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-600" />
                Novo Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSetor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <Input
                    value={setorForm.nome}
                    onChange={(e) => setSetorForm((f) => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: Setor Lavoura Norte"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fazenda</label>
                  <Select
                    value={setorForm.fazenda_id}
                    onChange={(e) => setSetorForm((f) => ({ ...f, fazenda_id: e.target.value }))}
                  >
                    <option value="">Selecione uma fazenda...</option>
                    {fazendas?.map((fazenda) => (
                      <option key={fazenda.id} value={fazenda.id}>
                        {fazenda.nome}
                      </option>
                    ))}
                  </Select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 w-full"
                  disabled={creatingSetor}
                >
                  {creatingSetor ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Setor'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Setores cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {setoresLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                  {setores?.length === 0 ? (
                    <p className="p-6 text-center text-gray-500">Nenhum setor cadastrado</p>
                  ) : (
                    setores?.map((setor) => (
                      <div key={setor.id} className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{setor.nome}</p>
                          {setor.fazenda && (
                            <p className="text-sm text-gray-500">{setor.fazenda.nome}</p>
                          )}
                        </div>
                        <Badge className={setor.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}>
                          {setor.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
