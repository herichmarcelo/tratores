import React, { useState } from 'react';
import {
  Tractor,
  User,
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Home,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const checklistItems = [
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
  const [activeTab, setActiveTab] = useState('list');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTractor, setSelectedTractor] = useState('TR-001');

  return (
    <div className="min-h-screen bg-background">
        <div className="px-4 lg:px-6 pt-4 lg:pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Checklists</h1>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
              <Home className="w-4 h-4" />
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Checklists</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'new' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Novo Checklist
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-6 pb-6">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                        alt="Trator"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">TR-001</h3>
                        <Badge className="bg-green-50 text-green-700 border-green-200">APROVADO</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">John Deere 6110J</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>18/05/2026</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>Manhã</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Horímetro</p>
                      <p className="text-lg font-bold text-gray-900">5.823 h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100&h=100&fit=crop"
                        alt="Trator"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">TR-002</h3>
                        <Badge className="bg-green-50 text-green-700 border-green-200">APROVADO</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Massey Ferguson 4292</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>18/05/2026</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>Manhã</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Horímetro</p>
                      <p className="text-lg font-bold text-gray-900">7.245 h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4 lg:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Informações do Trator</h3>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <img
                              src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                              alt="Trator"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900">TR-001</h4>
                            <p className="text-sm text-gray-600">John Deere 6110J</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">5.823 h</Badge>
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">Fazenda Matriz</Badge>
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">Setor Lavoura Norte</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Informações do Operador</h3>
                        <div className="flex items-center gap-3">
                          <User className="w-6 h-6 text-gray-400" />
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">João da Silva</h4>
                            <p className="text-sm text-gray-600">Operador</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>Manhã</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Itens de Inspeção</h3>
                    <div className="space-y-3">
                      {checklistItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3">
                            {item.status === 'conforme' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : item.status === 'atencao' ? (
                              <AlertTriangle className="w-5 h-5 text-amber-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <button
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  item.status === 'conforme' ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-500'
                                }`}
                              >
                                {item.status === 'conforme' && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </button>
                              <button
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  item.status === 'atencao' ? 'border-amber-500 bg-amber-500' : 'border-gray-300 hover:border-amber-500'
                                }`}
                              >
                                {item.status === 'atencao' && <AlertTriangle className="w-3 h-3 text-white" />}
                              </button>
                              <button
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  item.status === 'reprovado' ? 'border-red-500 bg-red-500' : 'border-gray-300 hover:border-red-500'
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

                <Card className="border-none shadow-sm">
                  <CardContent className="p-4 lg:p-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Evidências (Fotos)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=300&h=300&fit=crop"
                          alt="Painel"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=300&h=300&fit=crop"
                          alt="Horímetro"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src="https://images.unsplash.com/photo-1599835269762-d6e10054c684?w=300&h=300&fit=crop"
                          alt="Traseira"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src="https://images.unsplash.com/photo-1599835269762-d6e10054c684?w=300&h=300&fit=crop"
                          alt="Pneus Dianteiros"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-colors">
                        <Camera className="w-6 h-6 text-gray-400 hover:text-primary-600" />
                        <span className="text-xs text-gray-500 hover:text-primary-700">Adicionar Foto</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">Resumo do Checklist</CardTitle>
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
                            stroke="#0F6D2B"
                            strokeWidth="3"
                            strokeDasharray="95, 100"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary-600">95%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Índice de Conformidade</p>
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-base px-3 py-1 font-semibold">
                        APROVADO
                      </Badge>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Itens Conforme
                        </span>
                        <span className="font-semibold text-gray-900">9</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Itens Atenção
                        </span>
                        <span className="font-semibold text-gray-900">1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Itens Reprovados
                        </span>
                        <span className="font-semibold text-gray-900">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total de Itens</span>
                        <span className="font-semibold text-gray-900">10</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">Situação do Trator</span>
                        <Badge className="bg-green-50 text-green-700 border-green-200 font-semibold">
                          APTO PARA OPERAÇÃO
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Assinatura do Operador</p>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="text-center text-gray-400 italic">João da Silva</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary-600 w-full mt-2">
                        Limpar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-2 lg:flex-row lg:gap-3">
                  <Button variant="outline" className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50">
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-primary-600 hover:bg-primary-700">
                    Salvar Checklist
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};