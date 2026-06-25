import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Home,
  FileText,
  Sun,
  Moon,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';
import { useTratores, useChecklists, useCreateChecklist, useUsuarios } from '../hooks';
import type { Tractor, User as UserType } from '../types';

// Types for checklist items
type ChecklistItemStatus = 'conforme' | 'atencao' | 'reprovado';

interface LocalChecklistItem {
  id: number;
  name: string;
  status: ChecklistItemStatus;
}

// Initial checklist items (can be kept as default)
const initialChecklistItems: LocalChecklistItem[] = [
  { id: 1, name: 'Óleo do Motor', status: 'conforme' },
  { id: 2, name: 'Radiador', status: 'conforme' },
  { id: 3, name: 'Combustível', status: 'conforme' },
  { id: 4, name: 'Pneus', status: 'atencao' },
  { id: 5, name: 'Bateria', status: 'conforme' },
  { id: 6, name: 'Sistema Hidráulico', status: 'conforme' },
  { id: 7, name: 'Freios', status: 'conforme' },
  { id: 8, name: 'Iluminação', status: 'conforme' },
  { id: 9, name: 'Limpador de Parabrisa', status: 'conforme' },
  { id: 10, name: 'Emergência Geral', status: 'conforme' },
];

export const Checklists: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const [activeTab, setActiveTab] = useState('list');
  const [checklistItems, setChecklistItems] = useState<LocalChecklistItem[]>(initialChecklistItems);
  const [selectedTrator, setSelectedTrator] = useState<Tractor | null>(null);
  const [showTratorDropdown, setShowTratorDropdown] = useState(false);
  const [selectedOperador, setSelectedOperador] = useState<UserType | null>(null);
  const [showOperadorDropdown, setShowOperadorDropdown] = useState(false);

  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: checklists, isLoading: checklistsLoading, refetch: refetchChecklists } = useChecklists();
  const { data: usuarios, isLoading: usuariosLoading } = useUsuarios();
  const createChecklist = useCreateChecklist();

  // Filter only active tractors
  const activeTratores = useMemo(() => {
    return tratores?.filter(t => t.status === 'ativo') || [];
  }, [tratores]);

  // Set default trator when loaded
  useEffect(() => {
    if (activeTratores.length > 0 && !selectedTrator) {
      setSelectedTrator(activeTratores[0]);
    }
  }, [activeTratores]);

  // Set default operador when loaded
  useEffect(() => {
    if (usuarios && usuarios.length > 0 && !selectedOperador) {
      const operador = usuarios.find(u => u.perfil === 'colaborador') || usuarios[0];
      setSelectedOperador(operador);
    }
  }, [usuarios]);

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  // Update checklist item status
  const updateItemStatus = (itemId: number, newStatus: ChecklistItemStatus) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Calculate conformity index and item counts
  const calculateStats = () => {
    const conformeCount = checklistItems.filter(item => item.status === 'conforme').length;
    const atencaoCount = checklistItems.filter(item => item.status === 'atencao').length;
    const reprovadoCount = checklistItems.filter(item => item.status === 'reprovado').length;
    const conformityIndex = Math.round((conformeCount / checklistItems.length) * 100);
    
    // Determine overall status
    let checklistStatus = 'Aprovado';
    if (reprovadoCount > 0 || conformityIndex < 80) {
      checklistStatus = 'Reprovado';
    }

    return {
      conformeCount,
      atencaoCount,
      reprovadoCount,
      conformityIndex,
      checklistStatus,
    };
  };

  const stats = useMemo(() => calculateStats(), [checklistItems]);

  // Handle save checklist
  const handleSaveChecklist = async () => {
    if (!selectedTrator) {
      alert('Por favor, selecione um trator');
      return;
    }

    const now = new Date();
    const score = stats.conformityIndex;
    const status = stats.checklistStatus;

    try {
      await createChecklist.mutateAsync({
        trator_id: selectedTrator.id,
        operador_id: selectedOperador?.id,
        data_checklist: now,
        score: score,
        status: status,
        observacoes: 'Checklist criado via app',
        assinatura: selectedOperador?.nome || '',
      });

      // Reset checklist
      setChecklistItems(initialChecklistItems);
      // Switch to history tab
      setActiveTab('list');
      // Refetch checklists to update history
      await refetchChecklists();
      alert('Checklist salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      alert('Erro ao salvar checklist. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A]">
      <div className="px-4 lg:px-6 pt-4 lg:pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-ff-yellow" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checklists</h1>
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
              <span className="text-gray-900 dark:text-white font-medium">Checklists</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'list' ? 'bg-white dark:bg-[#14141A] text-ff-yellow shadow-sm' : 'text-gray-500 dark:text-[#B3B3B3] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'new' ? 'bg-white dark:bg-[#14141A] text-ff-yellow shadow-sm' : 'text-gray-500 dark:text-[#B3B3B3] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Novo Checklist
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        {activeTab === 'list' ? (
          <div className="space-y-4">
            {checklistsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-ff-yellow animate-spin" />
              </div>
            ) : (
              checklists?.map((checklist) => (
                <Card key={checklist.id} className="border-none shadow-sm dark:bg-[#14141A]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center">
                        {checklist.trator?.imagem_url ? (
                          <img
                            src={checklist.trator.imagem_url}
                            alt={checklist.trator.patrimonio}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                            alt="Trator"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {checklist.trator?.patrimonio || 'Trator'}
                          </h3>
                          <Badge className={checklist.status === 'Aprovado' 
                            ? 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30' 
                            : 'bg-red-100 text-red-600 border-red-200'}
                          >
                            {checklist.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-[#B3B3B3] mb-2">
                          {checklist.trator?.marca} {checklist.trator?.modelo}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#B3B3B3]">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(checklist.data_checklist).toLocaleDateString('pt-BR')}
                          </span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>
                            {new Date(checklist.data_checklist).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Horímetro</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {checklist.trator?.horimetro_atual?.toLocaleString('pt-BR') || 0} h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardContent className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-[#B3B3B3] uppercase mb-3">Informações do Trator</h3>
                      <div className="relative">
                        <button
                          onClick={() => setShowTratorDropdown(!showTratorDropdown)}
                          className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1A1A1A] text-left hover:border-ff-yellow transition-colors"
                        >
                          {tratoresLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-ff-yellow" />
                          ) : selectedTrator ? (
                            <>
                              <div className="w-12 h-12 rounded overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center">
                                {selectedTrator.imagem_url ? (
                                  <img
                                    src={selectedTrator.imagem_url}
                                    alt={selectedTrator.patrimonio}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                                    alt="Trator"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                  {selectedTrator.patrimonio}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-[#B3B3B3]">
                                  {selectedTrator.marca} {selectedTrator.modelo}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 text-center">
                              <h4 className="text-base font-medium text-gray-500 dark:text-[#B3B3B3]">
                                Selecione um trator
                              </h4>
                            </div>
                          )}
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTratorDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showTratorDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#14141A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                            {activeTratores.map((trator) => (
                              <button
                                key={trator.id}
                                onClick={() => {
                                  setSelectedTrator(trator);
                                  setShowTratorDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] text-left transition-colors"
                              >
                                <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center">
                                  {trator.imagem_url ? (
                                    <img
                                      src={trator.imagem_url}
                                      alt={trator.patrimonio}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                                      alt="Trator"
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {trator.patrimonio}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-[#B3B3B3]">
                                    {trator.marca} {trator.modelo}
                                  </p>
                                </div>
                                {selectedTrator?.id === trator.id && (
                                  <CheckCircle2 className="w-5 h-5 text-ff-green-active" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {selectedTrator && (
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">
                            {selectedTrator.horimetro_atual?.toLocaleString('pt-BR')} h
                          </Badge>
                          <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">
                            {selectedTrator.fazenda?.nome || 'Fazenda'}
                          </Badge>
                          <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">
                            {selectedTrator.setor || 'Setor'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-[#B3B3B3] uppercase mb-3">Informações do Operador</h3>
                      <div className="relative">
                        <button
                          onClick={() => setShowOperadorDropdown(!showOperadorDropdown)}
                          className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1A1A1A] text-left hover:border-ff-yellow transition-colors"
                        >
                          {usuariosLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-ff-yellow" />
                          ) : selectedOperador ? (
                            <>
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center">
                                {selectedOperador.foto_url ? (
                                  <img
                                    src={selectedOperador.foto_url}
                                    alt={selectedOperador.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-gray-400 dark:text-[#B3B3B3]" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                  {selectedOperador.nome}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-[#B3B3B3]">
                                  {selectedOperador.cargo}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 text-center">
                              <h4 className="text-base font-medium text-gray-500 dark:text-[#B3B3B3]">
                                Selecione um operador
                              </h4>
                            </div>
                          )}
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showOperadorDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showOperadorDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#14141A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                            {usuarios?.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  setSelectedOperador(user);
                                  setShowOperadorDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] text-left transition-colors"
                              >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center">
                                  {user.foto_url ? (
                                    <img
                                      src={user.foto_url}
                                      alt={user.nome}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-5 h-5 text-gray-400 dark:text-[#B3B3B3]" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.nome}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-[#B3B3B3]">
                                    {user.cargo}
                                  </p>
                                </div>
                                {selectedOperador?.id === user.id && (
                                  <CheckCircle2 className="w-5 h-5 text-ff-green-active" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-[#B3B3B3] uppercase mb-4">Itens de Inspeção</h3>
                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0">
                        <div className="flex items-center gap-3">
                          {item.status === 'conforme' ? (
                            <CheckCircle2 className="w-5 h-5 text-ff-green-active" />
                          ) : item.status === 'atencao' ? (
                            <AlertTriangle className="w-5 h-5 text-ff-warning" />
                          ) : (
                            <XCircle className="w-5 h-5 text-ff-danger" />
                          )}
                          <span className="text-sm text-gray-700 dark:text-white">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateItemStatus(item.id, 'conforme')}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                item.status === 'conforme' ? 'border-ff-green-active bg-ff-green-active' : 'border-gray-300 dark:border-[#2A2A2A] hover:border-ff-green-active'
                              }`}
                            >
                              {item.status === 'conforme' && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </button>
                            <button
                              onClick={() => updateItemStatus(item.id, 'atencao')}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                item.status === 'atencao' ? 'border-ff-warning bg-ff-warning' : 'border-gray-300 dark:border-[#2A2A2A] hover:border-ff-warning'
                              }`}
                            >
                              {item.status === 'atencao' && <AlertTriangle className="w-3 h-3 text-white" />}
                            </button>
                            <button
                              onClick={() => updateItemStatus(item.id, 'reprovado')}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                item.status === 'reprovado' ? 'border-ff-danger bg-ff-danger' : 'border-gray-300 dark:border-[#2A2A2A] hover:border-ff-danger'
                              }`}
                            >
                              {item.status === 'reprovado' && <XCircle className="w-3 h-3 text-white" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-[#B3B3B3] uppercase mb-4">Evidências (Fotos)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                      <img
                        src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=300&h=300&fit=crop"
                        alt="Painel"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                      <img
                        src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=300&h=300&fit=crop"
                        alt="Horímetro"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                      <img
                        src="https://images.unsplash.com/photo-1599835269762-d6e10054c684?w=300&h=300&fit=crop"
                        alt="Traseira"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                      <img
                        src="https://images.unsplash.com/photo-1599835269762-d6e10054c684?w=300&h=300&fit=crop"
                        alt="Pneus Dianteiros"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex flex-col items-center justify-center gap-2 hover:border-ff-yellow hover:bg-ff-yellow/10 transition-colors cursor-pointer">
                      <Camera className="w-6 h-6 text-gray-400 dark:text-[#B3B3B3] hover:text-ff-yellow" />
                      <span className="text-xs text-gray-500 dark:text-[#B3B3B3] hover:text-ff-yellow">Adicionar Foto</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Resumo do Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="relative mx-auto w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={stats.checklistStatus === 'Aprovado' ? '#3EC300' : '#DC2626'}
                          strokeWidth="3"
                          strokeDasharray={`${stats.conformityIndex}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-ff-yellow">{stats.conformityIndex}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Índice de Conformidade</p>
                    <Badge className={stats.checklistStatus === 'Aprovado' 
                      ? 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30' 
                      : 'bg-red-100 text-red-600 border-red-200'} text-base px-3 py-1 font-semibold>
                      {stats.checklistStatus}
                    </Badge>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-[#B3B3B3] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-ff-green-active" />
                        Itens Conforme
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{stats.conformeCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-[#B3B3B3] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-ff-warning" />
                        Itens Atenção
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{stats.atencaoCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-[#B3B3B3] flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-ff-danger" />
                        Itens Reprovados
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{stats.reprovadoCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-[#B3B3B3]">Total de Itens</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{checklistItems.length}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Situação do Trator</span>
                      <Badge className={stats.checklistStatus === 'Aprovado' 
                        ? 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30' 
                        : 'bg-red-100 text-red-600 border-red-200'} font-semibold>
                        {stats.checklistStatus === 'Aprovado' ? 'Apto para Operação' : 'Não Apto'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Assinatura do Operador</p>
                    <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                      <p className="text-center text-gray-400 dark:text-[#B3B3B3] italic">
                        {selectedOperador?.nome || 'Selecione um operador'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-ff-yellow w-full mt-2">
                      Limpar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 lg:flex-row lg:gap-3">
                <Button variant="outline" className="flex-1 border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveChecklist} 
                  disabled={createChecklist.isPending || !selectedTrator}
                  className="flex-1 bg-ff-yellow text-black hover:brightness-110 disabled:opacity-50"
                >
                  {createChecklist.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {createChecklist.isPending ? 'Salvando...' : 'Salvar Checklist'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
