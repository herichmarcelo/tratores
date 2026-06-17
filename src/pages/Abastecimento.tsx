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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../utils';

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
];

export const Abastecimento: React.FC = () => {
  const [initialHourmeter, setInitialHourmeter] = useState('5800');
  const [finalHourmeter, setFinalHourmeter] = useState('5910');
  const [liters, setLiters] = useState('120');
  const [pricePerLiter, setPricePerLiter] = useState('5.89');

  // Calculated values
  const hoursWorked = parseFloat(finalHourmeter) - parseFloat(initialHourmeter);
  const consumptionPerHour = hoursWorked > 0 ? (parseFloat(liters) / hoursWorked).toFixed(2) : '0';
  const totalValue = (parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header (mobile) */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fuel className="w-6 h-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">Abastecimento</h1>
        </div>
        <Button variant="ghost" className="text-primary-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Online</span>
        </Button>
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Tractor Header Card */}
        <Card className="lg:hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                <Tractor className="w-10 h-10 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">TR-001</h2>
                <p className="text-gray-600">John Deere 6110J</p>
                <Badge variant="default" className="mt-1">Ativo</Badge>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Operator and Date */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <Card>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-semibold mb-2">
                    <User className="w-4 h-4" />
                    Operador
                  </div>
                  <Select className="border-none bg-transparent p-0 h-auto focus:ring-0 shadow-none">
                    <option>João da Silva</option>
                    <option>Maria Santos</option>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-semibold mb-2">
                    <Calendar className="w-4 h-4" />
                    Data
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">18/05/2024</span>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourmeter */}
            <Card>
              <CardContent className="p-3 lg:p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-semibold">
                  <Clock className="w-4 h-4" />
                  Horímetro
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Inicial (h)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={initialHourmeter}
                        onChange={(e) => setInitialHourmeter(e.target.value)}
                        className="font-medium"
                      />
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Final (h)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={finalHourmeter}
                        onChange={(e) => setFinalHourmeter(e.target.value)}
                        className="font-medium"
                      />
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                {/* Hours Worked */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-green-700 font-medium">Horas Trabalhadas</p>
                  <p className="text-2xl font-bold text-green-700">{hoursWorked.toFixed(2)} h</p>
                </div>
              </CardContent>
            </Card>

            {/* Fuel Info */}
            <Card>
              <CardContent className="p-3 lg:p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-semibold">
                  <Fuel className="w-4 h-4" />
                  Combustível
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Litros Abastecidos (L)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={liters}
                        onChange={(e) => setLiters(e.target.value)}
                        className="font-medium"
                      />
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Valor por Litro (R$)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={pricePerLiter}
                        onChange={(e) => setPricePerLiter(e.target.value)}
                        className="font-medium"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Valor Total (R$)</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <span className="text-gray-600 font-medium">R$</span>
                    <span className="text-lg font-bold text-gray-900">{totalValue}</span>
                    <div className="ml-auto">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consumption and Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-green-100 bg-green-50">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-5 h-5 text-green-700" />
                  <p className="text-xs font-semibold text-green-800 uppercase">Consumo Médio</p>
                </div>
                <p className="text-2xl font-bold text-green-700">{consumptionPerHour} L/h</p>
                <p className="text-xs text-green-600">Média deste abastecimento</p>
              </div>
              <div className="p-3 rounded-xl border border-amber-100 bg-amber-50">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-amber-700" />
                  <p className="text-xs font-semibold text-amber-800 uppercase">Custo por Hora</p>
                </div>
                <p className="text-2xl font-bold text-amber-700">
                  {hoursWorked > 0 ? `R$ ${(parseFloat(totalValue) / hoursWorked).toFixed(2)}` : 'R$ 0,00'}
                </p>
                <p className="text-xs text-amber-600">Custo por hora trabalhada</p>
              </div>
            </div>

            {/* Photos */}
            <Card>
              <CardContent className="p-3 lg:p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-semibold">
                  <Camera className="w-4 h-4" />
                  Fotos do Abastecimento
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['Comprovante', 'Painel', 'Bico'].map((label, index) => (
                    <button
                      key={index}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-gray-400 hover:text-primary-600" />
                      <span className="text-xs text-gray-500 hover:text-primary-700 text-center">
                        Foto do {label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-semibold mb-2">
                  <FileText className="w-4 h-4" />
                  Observações
                </div>
                <textarea
                  placeholder="Adicionar observações (opcional)..."
                  className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="text-right text-xs text-gray-400 mt-1">0/300</div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button className="w-full h-14 text-lg font-semibold bg-primary-600 hover:bg-primary-700 flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Salvar Abastecimento
            </Button>
          </div>

          {/* Desktop: Sidebar with Summary and History */}
          <div className="hidden lg:block space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Abastecimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Horas Trabalhadas</span>
                  <span className="font-semibold text-gray-900">{hoursWorked.toFixed(2)} h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Litros Abastecidos</span>
                  <span className="font-semibold text-gray-900">{liters} L</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Consumo Médio</span>
                  <span className="font-semibold text-green-600">{consumptionPerHour} L/h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Valor Total</span>
                  <span className="font-semibold text-gray-900">R$ {totalValue}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Custo por Hora</span>
                  <span className="font-semibold text-gray-900">
                    R$ {hoursWorked > 0 ? (parseFloat(totalValue) / hoursWorked).toFixed(2) : '0,00'}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Custo por Litro</span>
                    <span className="font-semibold text-gray-900">R$ {pricePerLiter}/L</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Gauge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eficiência do Trator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">Média dos últimos 7 abastecimentos</p>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-16 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      <path
                        d="M 10 45 A 40 40 0 0 1 90 45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <path
                        d="M 10 45 A 40 40 0 0 1 60 35"
                        fill="none"
                        stroke="#0f6d2b"
                        strokeWidth="8"
                      />
                    </svg>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                      <p className="text-xl font-bold text-gray-900">{consumptionPerHour}</p>
                      <p className="text-xs text-gray-500">L/h</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>6 L/h</span>
                  <span>Consumo Médio</span>
                  <span>18 L/h</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Refuels */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Últimos Abastecimentos</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-600 text-xs">
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
                      <Badge variant="default" className="text-xs">{refuel.consumption}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1">
        <div className="flex justify-around">
          {[
            { icon: 'home', label: 'Dashboard' },
            { icon: 'tractor', label: 'Tratores' },
            { icon: 'fuel', label: 'Abastecimento' },
            { icon: 'checklist', label: 'Checklists' },
            { icon: 'user', label: 'Perfil' },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors',
                item.label === 'Abastecimento' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'
              )}
            >
              {item.icon === 'home' && <Tractor className="w-5 h-5" />}
              {item.icon === 'tractor' && <Tractor className="w-5 h-5" />}
              {item.icon === 'fuel' && <Fuel className="w-5 h-5" />}
              {item.icon === 'checklist' && <FileText className="w-5 h-5" />}
              {item.icon === 'user' && <User className="w-5 h-5" />}
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};