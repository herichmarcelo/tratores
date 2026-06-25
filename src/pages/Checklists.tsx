import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';

// Types for checklist items and saved checklists
type ChecklistItemStatus = 'conforme' | 'atencao' | 'reprovado';

interface ChecklistItem {
  id: number;
  name: string;
  status: ChecklistItemStatus;
}

interface SavedChecklist {
  id: number;
  tractorId: string;
  tractorModel: string;
  operatorName: string;
  date: string;
  period: string;
  hourmeter: number;
  items: ChecklistItem[];
  conformityIndex: number;
  status: 'APROVADO' | 'REPROVADO';
}

// Initial checklist items
const initialChecklistItems: ChecklistItem[] = [
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

// Mock saved checklists
const initialSavedChecklists: SavedChecklist[] = [
  {
    id: 1,
    tractorId: 'TR-001',
    tractorModel: 'John Deere 6110J',
    operatorName: 'João da Silva',
    date: '18/05/2026',
    period: 'Manhã',
    hourmeter: 5823,
    items: initialChecklistItems,
    conformityIndex: 90,
    status: 'APROVADO',
  },
  {
    id: 2,
    tractorId: 'TR-002',
    tractorModel: 'Massey Ferguson 4292',
    operatorName: 'Maria Souza',
    date: '18/05/2026',
    period: 'Manhã',
    hourmeter: 7245,
    items: initialChecklistItems,
    conformityIndex: 100,
    status: 'APROVADO',
  },
];

export const Checklists: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const [activeTab, setActiveTab] = useState('list');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialChecklistItems);
  const [savedChecklists, setSavedChecklists] = useState<SavedChecklist[]>(initialSavedChecklists);

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
    let checklistStatus: 'APROVADO' | 'REPROVADO' = 'APROVADO';
    if (reprovadoCount > 0 || conformityIndex < 80) {
      checklistStatus = 'REPROVADO';
    } else if (atencaoCount > 0 && conformityIndex >= 80 && conformityIndex < 100) {
      checklistStatus = 'APROVADO'; // Still approved but with warnings
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
    const newChecklist: SavedChecklist = {
      id: Date.now(),
      tractorId: 'TR-001',
      tractorModel: 'John Deere 6110J',
      operatorName: 'João da Silva',
      date: new Date().toLocaleDateString('pt-BR'),
      period: new Date().getHours() < 12 ? 'Manhã' : new Date().getHours() < 18 ? 'Tarde' : 'Noite',
      hourmeter: 5823,
      conformityIndex: stats.conformityIndex,
      items: checklistItems,
      status: stats.checklistStatus,
    };

    // For integration with backend, uncomment this part:
    // try {
    //   const response = await fetch('/api/checklists', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newChecklist),
    //   });
    //   const savedData = await response.json();
    //   setSavedChecklists([savedData, ...savedChecklists]);
    // } catch (error) {
    //   console.error('Error saving checklist:', error);
    // }

    // Add to saved checklists (mock)
    setSavedChecklists([newChecklist, ...savedChecklists]);
    
    // Reset checklist
    setChecklistItems(initialChecklistItems);
    
    // Switch to history tab
    setActiveTab('list');
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
            {savedChecklists.map((checklist) => (
              <Card key={checklist.id} className="border-none shadow-sm dark:bg-[#14141A]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                        alt="Trator"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{checklist.tractorId}</h3>
                        <Badge className={checklist.status === 'APROVADO' ? 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30' : 'bg-red-100 text-red-600 border-red-200'}>
                          {checklist.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#B3B3B3] mb-2">{checklist.tractorModel}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#B3B3B3]">
                        <Calendar className="w-3 h-3" />
                        <span>{checklist.date}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{checklist.period}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Horímetro</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{checklist.hourmeter.toLocaleString('pt-BR')} h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardContent className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-[#B3B3B3] uppercase mb-3">Informações do Trator</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center">
                          <img
                            src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                            alt="Trator"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">TR-001</h4>
                          <p className="text-sm text-gray-600 dark:text-[#B3B3B3]">John Deere 6110J</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">5.823 h</Badge>
                            <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Fazenda Matriz</Badge>
                            <Badge className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#B3B3B3] border-gray-200 dark:border-[#2A2A2A]">Setor Lavoura Norte</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-[#B3B3B3] uppercase mb-3">Informações do Operador</h3>
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-gray-400 dark:text-[#B3B3B3]" />
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">João da Silva</h4>
                          <p className="text-sm text-gray-600 dark:text-[#B3B3B3]">Operador</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-[#B3B3B3]">
                            <Clock className="w-3 h-3" />
                            <span>Manhã</span>
                          </div>
                        </div>
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
                          stroke={stats.checklistStatus === 'APROVADO' ? '#3EC300' : '#DC2626'}
                          strokeWidth="3"
                          strokeDasharray={`${stats.conformityIndex}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-ff-yellow">{stats.conformityIndex}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Índice de Conformidade</p>
                    <Badge className={stats.checklistStatus === 'APROVADO' 
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
                      <Badge className={stats.checklistStatus === 'APROVADO' 
                        ? 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30' 
                        : 'bg-red-100 text-red-600 border-red-200'} font-semibold>
                        {stats.checklistStatus === 'APROVADO' ? 'APTO PARA OPERAÇÃO' : 'NÃO APTO'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Assinatura do Operador</p>
                    <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                      <p className="text-center text-gray-400 dark:text-[#B3B3B3] italic">João da Silva</p>
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
                <Button onClick={handleSaveChecklist} className="flex-1 bg-ff-yellow text-black hover:brightness-110">
                  Salvar Checklist
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
