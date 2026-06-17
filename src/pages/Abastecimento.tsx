import React, { useState } from 'react';
import {
  Fuel,
  User,
  Calendar,
  Clock,
  Camera,
  FileText,
  ChevronRight,
  Tractor,
  DollarSign,
  Save,
  Gauge,
  CheckCircle2,
  Home,
  Menu,
  X,
  ChevronDown,
  XCircle,
  MapPin,
  Building2,
  Tag,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Mock data for refueling history
const recentRefuels = [
  {
    id: '1',
    date: '18/05/2024',
    tractor: 'TR-001',
    liters: 110,
    consumption: '10,35 L/h',
  },
  {
    id: '2',
    date: '12/05/2024',
    tractor: 'TR-001',
    liters: 115,
    consumption: '11,08 L/h',
  },
  {
    id: '3',
    date: '10/05/2024',
    tractor: 'TR-001',
    liters: 100,
    consumption: '9,80 L/h',
  },
  {
    id: '4',
    date: '08/05/2024',
    tractor: 'TR-001',
    liters: 130,
    consumption: '10,45 L/h',
  },
];

export const Abastecimento: React.FC = () => {
  const [initialHourmeter, setInitialHourmeter] = useState('5800');
  const [finalHourmeter, setFinalHourmeter] = useState('5910');
  const [liters, setLiters] = useState('120');
  const [pricePerLiter, setPricePerLiter] = useState('5.89');
  const [activeTab, setActiveTab] = useState('new');

  // Calculated values
  const hoursWorked = parseFloat(finalHourmeter) - parseFloat(initialHourmeter);
  const consumptionPerHour = hoursWorked > 0 ? (parseFloat(liters) / hoursWorked).toFixed(2) : '0';
  const totalValue = (parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2);
  const costPerHour = hoursWorked > 0 ? (parseFloat(totalValue) / hoursWorked).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* Page header (desktop) */}
      <div className="hidden lg:block px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Fuel className="w-7 h-7 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Abastecimento</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no sistema..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span>Abastecimentos</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Novo Abastecimento</span>
        </div>
      </div>

      <div className="lg:hidden">
        {/* Tractor header card (mobile) */}
        <div className="px-4 pt-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1592195683094-900d68287b03?w=100&h=100&fit=crop"
                    alt="Trator"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold text-gray-900">TR-001</h2>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">John Deere 6110J</p>
                  <Badge className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-24 lg:pb-6">
        <div className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Novo Abastecimento
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Histórico
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* General info (desktop) */}
            <div className="hidden lg:block">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Data do Abastecimento</label>
                      <div className="relative">
                        <Input type="date" defaultValue="2024-05-18" className="border-gray-200" />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Trator</label>
                      <Select className="border-gray-200">
                        <option>TR-001 - John Deere 6110J</option>
                        <option>TR-002 - Massey Ferguson 4292</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Operador</label>
                      <Select className="border-gray-200">
                        <option>João da Silva</option>
                        <option>Maria Santos</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Fazenda / Unidade</label>
                      <Select className="border-gray-200">
                        <option>Matriz</option>
                        <option>Fazenda Santa Luzia</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Setor</label>
                      <Select className="border-gray-200">
                        <option>Lavouras Norte</option>
                        <option>Lavouras Sul</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Posto / Fornecedor</label>
                      <Select className="border-gray-200">
                        <option>Posto Central - Unidade Matriz</option>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile form sections */}
            <div className="lg:hidden space-y-3">
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600 text-sm font-semibold uppercase">
                        <User className="w-5 h-5" />
                        <span>Operador</span>
                      </div>
                      <Select className="border-gray-200">
                        <option>João da Silva</option>
                        <option>Maria Santos</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600 text-sm font-semibold uppercase">
                        <Calendar className="w-5 h-5" />
                        <span>Data</span>
                      </div>
                      <Input type="date" defaultValue="2024-05-18" className="border-gray-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-semibold uppercase mb-3">
                    <Clock className="w-5 h-5" />
                    <span>Horímetro</span>
                    <div className="flex-1"></div>
                    <Button variant="ghost" size="sm" className="text-primary-600 gap-1 p-0 h-auto">
                      <Camera className="w-4 h-4" />
                      <span>Ler Horímetro</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500">Inicial (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={initialHourmeter}
                          onChange={(e) => setInitialHourmeter(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500">Final (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={finalHourmeter}
                          onChange={(e) => setFinalHourmeter(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Hours worked */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-700 font-medium mb-0.5">Horas Trabalhadas</p>
                    <p className="text-2xl font-bold text-green-700">{hoursWorked.toFixed(2)} h</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-semibold uppercase mb-3">
                    <Fuel className="w-5 h-5" />
                    <span>Combustível</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500">Litros Abastecidos (L)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={liters}
                          onChange={(e) => setLiters(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500">Valor por Litro (R$)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricePerLiter}
                          onChange={(e) => setPricePerLiter(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <label className="text-xs text-gray-500">Valor Total (R$)</label>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-md border border-gray-200">
                      <span className="text-gray-600 font-medium">R$</span>
                      <span className="text-lg font-bold text-gray-900">{totalValue}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-green-100 bg-green-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="w-6 h-6 text-green-600" />
                        <p className="text-xs font-semibold text-green-800 uppercase">Consumo Médio</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{consumptionPerHour} L/h</p>
                      <p className="text-[11px] text-green-600">Média deste abastecimento</p>
                    </div>
                    <div className="p-3 rounded-xl border border-amber-100 bg-amber-50">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-6 h-6 text-amber-700" />
                        <p className="text-xs font-semibold text-amber-800 uppercase">Custo por Hora</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">R$ {costPerHour}</p>
                      <p className="text-[11px] text-amber-600">Custo por hora trabalhada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-semibold uppercase mb-3">
                    <Camera className="w-5 h-5" />
                    <span>Fotos do Abastecimento</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Comprovante', 'Painel', 'Bico'].map((label, index) => (
                      <button
                        key={index}
                        className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <Camera className="w-8 h-8 text-gray-400 hover:text-primary-600" />
                        <span className="text-xs text-gray-500 hover:text-primary-700 text-center">
                          Foto do {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-semibold uppercase mb-3">
                    <FileText className="w-5 h-5" />
                    <span>Observações</span>
                  </div>
                  <textarea
                    placeholder="Adicionar observações (opcional)..."
                    className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">0/300</div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop form sections */}
            <div className="hidden lg:block">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">Horímetro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Horímetro Inicial (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={initialHourmeter}
                          onChange={(e) => setInitialHourmeter(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Horímetro Final (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={finalHourmeter}
                          onChange={(e) => setFinalHourmeter(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100 w-fit">
                    <p className="text-xs text-green-700 font-medium mb-0.5">Horas Trabalhadas</p>
                    <p className="text-xl font-bold text-green-700">{hoursWorked.toFixed(2)} h</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">Abastecimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Litros Abastecidos (L)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={liters}
                          onChange={(e) => setLiters(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Valor por Litro (R$)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricePerLiter}
                          onChange={(e) => setPricePerLiter(e.target.value)}
                          className="font-medium border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 uppercase">Valor Total (R$)</label>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-md border border-gray-200 h-10">
                        <span className="text-gray-600 font-medium">R$</span>
                        <span className="text-lg font-bold text-gray-900">{totalValue}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 uppercase">Observações</label>
                    <textarea
                      placeholder="Abastecimento realizado após conclusão de preparo de solo..."
                      className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="text-right text-xs text-gray-400">58/300</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">Fotos do Abastecimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {['Comprovante', 'Painel', 'Bico'].map((label, index) => (
                      <button
                        key={index}
                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <Camera className="w-10 h-10 text-gray-400 hover:text-primary-600" />
                        <span className="text-sm text-gray-500 hover:text-primary-700 text-center">
                          Foto do {label}
                        </span>
                        <span className="text-xs text-gray-400">PNG, JPG até 5MB</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 gap-1">
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar</span>
                </Button>
                <Button className="bg-primary-600 hover:bg-primary-700 gap-1">
                  <Save className="w-4 h-4" />
                  <span>Salvar Abastecimento</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar (desktop only) */}
          <div className="hidden lg:block space-y-4 lg:space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Resumo do Abastecimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Horas Trabalhadas', value: `${hoursWorked.toFixed(2)} h`, icon: Clock },
                  { label: 'Litros Abastecidos', value: `${liters} L`, icon: Fuel },
                  { label: 'Consumo Médio', value: `${consumptionPerHour} L/h`, icon: Gauge, color: 'text-green-600' },
                  { label: 'Valor Total', value: `R$ ${totalValue}`, icon: DollarSign },
                  { label: 'Custo por Hora', value: `R$ ${costPerHour}`, icon: DollarSign },
                  { label: 'Custo por Litro', value: `R$ ${pricePerLiter}/L`, icon: Tag },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className={`font-semibold text-gray-900 ${item.color || ''}`}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Eficiência do Trator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-500">Média dos últimos 7 abastecimentos</p>
                <div className="flex items-center justify-center">
                  <div className="relative w-44 h-22 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <path d="M 10 45 A 40 40 0 0 1 62 38" fill="none" stroke="#0f6d2b" strokeWidth="8" />
                    </svg>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
                      <p className="text-2xl font-bold text-gray-900">{consumptionPerHour}</p>
                      <p className="text-xs text-gray-500">L/h</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-2">
                  <span>6 L/h</span>
                  <span>Consumo Médio</span>
                  <span>18 L/h</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Últimos Abastecimentos</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-600 text-xs p-0 h-auto">
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentRefuels.map((refuel) => (
                  <div key={refuel.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{refuel.date}</p>
                      <p className="text-xs text-gray-500">{refuel.tractor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900 font-medium">{refuel.liters} L</p>
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">{refuel.consumption}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom navigation (mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-40">
        <Button className="w-full h-14 text-lg font-semibold bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Salvar Abastecimento
        </Button>
      </div>
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-30">
        <div className="flex justify-around">
          {[
            { icon: Home, label: 'Dashboard' },
            { icon: Tractor, label: 'Tratores' },
            { icon: Fuel, label: 'Abastecimento' },
            { icon: FileText, label: 'Checklists' },
            { icon: User, label: 'Perfil' },
          ].map((item, index) => (
            <button
              key={item.label}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                item.label === 'Abastecimento' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
