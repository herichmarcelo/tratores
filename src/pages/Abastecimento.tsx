import React, { useState } from 'react';
import {
  Fuel,
  User,
  Calendar,
  Clock,
  Camera,
  FileText,
  ChevronRight,
  DollarSign,
  Save,
  Gauge,
  Home,
  XCircle,
  Tag,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  useAbastecimentos,
  useTratores,
  useUsuarios,
  useVwEficienciaTratores,
  useCreateAbastecimento,
} from '../hooks';
import { TractorImage } from '../components/TractorImage';
import { useTheme } from '../contexts/ThemeContext';

export const Abastecimento: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const [initialHourmeter, setInitialHourmeter] = useState('5800');
  const [finalHourmeter, setFinalHourmeter] = useState('5910');
  const [liters, setLiters] = useState('120');
  const [pricePerLiter, setPricePerLiter] = useState('5.89');
  const [activeTab, setActiveTab] = useState('new');
  const [selectedTractor, setSelectedTractor] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: usuarios, isLoading: usuariosLoading } = useUsuarios();
  const { data: eficienciaTratores, isLoading: eficienciaLoading } = useVwEficienciaTratores();
  const { mutateAsync: createAbastecimento, isPending: isCreating } = useCreateAbastecimento();

  const currentTrator = tratores?.find((t) => t.id === selectedTractor) || tratores?.[0];

  // Calculated values
  const hoursWorked = parseFloat(finalHourmeter) - parseFloat(initialHourmeter);
  const consumptionPerHour = hoursWorked > 0 ? (parseFloat(liters) / hoursWorked).toFixed(2) : '0';
  const totalValue = (parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2);
  const costPerHour = hoursWorked > 0 ? (parseFloat(totalValue) / hoursWorked).toFixed(2) : '0';

  // Get average efficiency for sidebar
  const eficienciaList = eficienciaTratores ?? [];
  const averageEfficiency = eficienciaList.length > 0
    ? Math.round(eficienciaList.reduce((acc, e) => acc + (e.eficiencia_percentual || 0), 0) / eficienciaList.length)
    : 92;

  // Get recent refuels
  const recentRefuels = abastecimentos?.slice(0, 4).map((ab) => ({
    id: ab.id,
    date: new Date(ab.data_abastecimento).toLocaleDateString('pt-BR'),
    tractor: ab.trator?.patrimonio || 'Desconhecido',
    liters: ab.litros_abastecidos || 0,
    consumption: ab.consumo_medio ? `${ab.consumo_medio} L/h` : '0 L/h',
  })) || [];

  const handleSave = async () => {
    if (!selectedTractor) return;
    try {
      await createAbastecimento({
        trator_id: selectedTractor,
        operador_id: selectedOperator,
        data_abastecimento: new Date(),
        horimetro_inicial: parseFloat(initialHourmeter),
        horimetro_final: parseFloat(finalHourmeter),
        horas_trabalhadas: hoursWorked,
        litros_abastecidos: parseFloat(liters),
        valor_litro: parseFloat(pricePerLiter),
        valor_total: parseFloat(totalValue),
        consumo_medio: parseFloat(consumptionPerHour),
        custo_hora: parseFloat(costPerHour),
      });
    } catch (err) {
      console.error('Erro ao salvar abastecimento:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A]">
      {/* Page header (desktop) */}
      <div className="hidden lg:block px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Fuel className="w-7 h-7 text-ff-yellow" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Abastecimento</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-white border border-gray-200 dark:border-[#2A2A2A] rounded-lg"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#B3B3B3] mb-6">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span>Abastecimentos</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">Novo Abastecimento</span>
        </div>
      </div>

      <div className="lg:hidden">
        {/* Tractor header card (mobile) */}
        <div className="px-4 pt-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <TractorImage
                  src={currentTrator?.imagem_url}
                  alt={currentTrator?.modelo || 'Trator'}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {tratoresLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : currentTrator?.patrimonio || 'TR-001'}
                    </h2>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-[#B3B3B3]" />
                  </div>
                  <p className="text-gray-600 dark:text-[#B3B3B3] mb-2">
                    {tratoresLoading ? 'Carregando...' : `${currentTrator?.marca || ''} ${currentTrator?.modelo || ''}`}
                  </p>
                  <Badge className="bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30">
                    {currentTrator?.status || 'Ativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-24 lg:pb-6">
        <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-white dark:bg-[#14141A] text-ff-yellow shadow-sm' : 'text-gray-500 dark:text-[#B3B3B3] hover:text-gray-700 dark:hover:text-white'}`}
          >
            Novo Abastecimento
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white dark:bg-[#14141A] text-ff-yellow shadow-sm' : 'text-gray-500 dark:text-[#B3B3B3] hover:text-gray-700 dark:hover:text-white'}`}
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
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Data do Abastecimento</label>
                      <div className="relative">
                        <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#B3B3B3] pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Trator</label>
                      {tratoresLoading ? (
                        <div className="h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg animate-pulse" />
                      ) : (
                        <Select
                          className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                          value={selectedTractor || tratores?.[0]?.id || ''}
                          onChange={(e) => setSelectedTractor(e.target.value)}
                        >
                          {tratores?.map((t) => (
                            <option key={t.id} value={t.id}>{t.patrimonio} - {t.marca} {t.modelo}</option>
                          ))}
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Operador</label>
                      {usuariosLoading ? (
                        <div className="h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg animate-pulse" />
                      ) : (
                        <Select className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)}>
                          {usuarios?.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                          ))}
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Fazenda / Unidade</label>
                      <Select className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" value={selectedFarm} onChange={(e) => setSelectedFarm(e.target.value)}>
                        <option>Matriz</option>
                        <option>Fazenda Santa Luzia</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Setor</label>
                      <Select className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
                        <option>Lavouras Norte</option>
                        <option>Lavouras Sul</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Posto / Fornecedor</label>
                      <Select className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white">
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
                      <div className="flex items-center gap-2 text-gray-600 dark:text-[#B3B3B3] text-sm font-semibold uppercase">
                        <User className="w-5 h-5" />
                        <span>Operador</span>
                      </div>
                      {usuariosLoading ? (
                        <div className="h-10 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg animate-pulse" />
                      ) : (
                        <Select className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)}>
                          {usuarios?.map((u) => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                          ))}
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-[#B3B3B3] text-sm font-semibold uppercase">
                        <Calendar className="w-5 h-5" />
                        <span>Data</span>
                      </div>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-[#B3B3B3] text-sm font-semibold uppercase mb-3">
                    <Clock className="w-5 h-5" />
                    <span>Horímetro</span>
                    <div className="flex-1"></div>
                    <Button variant="ghost" size="sm" className="text-ff-yellow gap-1 p-0 h-auto">
                      <Camera className="w-4 h-4" />
                      <span>Ler Horímetro</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 dark:text-[#B3B3B3]">Inicial (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={initialHourmeter}
                          onChange={(e) => setInitialHourmeter(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                        <Clock className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 dark:text-[#B3B3B3]">Final (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={finalHourmeter}
                          onChange={(e) => setFinalHourmeter(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                        <Clock className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                      </div>
                    </div>
                  </div>

                  {/* Hours worked */}
                  <div className="p-3 bg-ff-green-active/20 rounded-lg border border-ff-green-active/30">
                    <p className="text-xs text-ff-green-active font-medium mb-0.5">Horas Trabalhadas</p>
                    <p className="text-2xl font-bold text-ff-green-active">{hoursWorked.toFixed(2)} h</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-[#B3B3B3] text-sm font-semibold uppercase mb-3">
                    <Fuel className="w-5 h-5" />
                    <span>Combustível</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 dark:text-[#B3B3B3]">Litros Abastecidos (L)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={liters}
                          onChange={(e) => setLiters(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                        <FileText className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 dark:text-[#B3B3B3]">Valor por Litro (R$)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-[#B3B3B3]">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricePerLiter}
                          onChange={(e) => setPricePerLiter(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <label className="text-xs text-gray-500 dark:text-[#B3B3B3]">Valor Total (R$)</label>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-[#1A1A1A] rounded-md border border-gray-200 dark:border-[#2A2A2A]">
                      <span className="text-gray-600 dark:text-[#B3B3B3] font-medium">R$</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{totalValue}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-ff-green-active/30 bg-ff-green-active/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="w-6 h-6 text-ff-green-active" />
                        <p className="text-xs font-semibold text-ff-green-active uppercase">Consumo Médio</p>
                      </div>
                      <p className="text-2xl font-bold text-ff-green-active">{consumptionPerHour} L/h</p>
                      <p className="text-[11px] text-ff-green-active">Média deste abastecimento</p>
                    </div>
                    <div className="p-3 rounded-xl border border-ff-yellow/30 bg-ff-yellow/20">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-6 h-6 text-ff-yellow" />
                        <p className="text-xs font-semibold text-ff-yellow uppercase">Custo por Hora</p>
                      </div>
                      <p className="text-2xl font-bold text-ff-yellow">R$ {costPerHour}</p>
                      <p className="text-[11px] text-ff-yellow">Custo por hora trabalhada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-[#B3B3B3] text-sm font-semibold uppercase mb-3">
                    <Camera className="w-5 h-5" />
                    <span>Fotos do Abastecimento</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Comprovante', 'Painel', 'Bico'].map((label) => (
                      <button
                        key={label}
                        className="border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-ff-yellow hover:bg-ff-yellow/10 transition-colors"
                      >
                        <Camera className="w-8 h-8 text-gray-400 dark:text-[#B3B3B3] hover:text-ff-yellow" />
                        <span className="text-xs text-gray-500 dark:text-[#B3B3B3] hover:text-ff-yellow text-center">
                          Foto do {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-[#B3B3B3] text-sm font-semibold uppercase mb-3">
                    <FileText className="w-5 h-5" />
                    <span>Observações</span>
                  </div>
                  <textarea
                    placeholder="Adicionar observações (opcional)..."
                    className="w-full min-h-[100px] p-3 border border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ff-yellow"
                  />
                  <div className="text-right text-xs text-gray-400 dark:text-[#B3B3B3] mt-1">0/300</div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop form sections */}
            <div className="hidden lg:block">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Horímetro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Horímetro Inicial (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={initialHourmeter}
                          onChange={(e) => setInitialHourmeter(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                        <Clock className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Horímetro Final (h)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={finalHourmeter}
                          onChange={(e) => setFinalHourmeter(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                        <Clock className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-ff-green-active/20 rounded-lg border border-ff-green-active/30 w-fit">
                    <p className="text-xs text-ff-green-active font-medium mb-0.5">Horas Trabalhadas</p>
                    <p className="text-xl font-bold text-ff-green-active">{hoursWorked.toFixed(2)} h</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Abastecimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Litros Abastecidos (L)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={liters}
                          onChange={(e) => setLiters(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                        <FileText className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Valor por Litro (R$)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-[#B3B3B3]">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricePerLiter}
                          onChange={(e) => setPricePerLiter(e.target.value)}
                          className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Valor Total (R$)</label>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-[#1A1A1A] rounded-md border border-gray-200 dark:border-[#2A2A2A] h-10">
                        <span className="text-gray-600 dark:text-[#B3B3B3] font-medium">R$</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{totalValue}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400 dark:text-[#B3B3B3]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Observações</label>
                    <textarea
                      placeholder="Abastecimento realizado após conclusão de preparo de solo..."
                      className="w-full min-h-[80px] p-3 border border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ff-yellow"
                    />
                    <div className="text-right text-xs text-gray-400 dark:text-[#B3B3B3]">58/300</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Fotos do Abastecimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {['Comprovante', 'Painel', 'Bico'].map((label) => (
                      <button
                        key={label}
                        className="border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-ff-yellow hover:bg-ff-yellow/10 transition-colors"
                      >
                        <Camera className="w-10 h-10 text-gray-400 dark:text-[#B3B3B3] hover:text-ff-yellow" />
                        <span className="text-sm text-gray-500 dark:text-[#B3B3B3] hover:text-ff-yellow text-center">
                          Foto do {label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-[#B3B3B3]">PNG, JPG até 5MB</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-gray-600 dark:text-white border border-gray-200 dark:border-[#2A2A2A] rounded-lg"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" className="border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1A1A1A] gap-1">
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isCreating}
                    className="bg-ff-yellow text-black hover:brightness-110 gap-1"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Salvar Abastecimento</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (desktop only) */}
          <div className="hidden lg:block space-y-4 lg:space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Resumo do Abastecimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Horas Trabalhadas', value: `${hoursWorked.toFixed(2)} h`, icon: Clock },
                  { label: 'Litros Abastecidos', value: `${liters} L`, icon: Fuel },
                  { label: 'Consumo Médio', value: `${consumptionPerHour} L/h`, icon: Gauge, color: 'text-ff-green-active' },
                  { label: 'Valor Total', value: `R$ ${totalValue}`, icon: DollarSign },
                  { label: 'Custo por Hora', value: `R$ ${costPerHour}`, icon: DollarSign },
                  { label: 'Custo por Litro', value: `R$ ${pricePerLiter}/L`, icon: Tag },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-[#B3B3B3]">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className={`font-semibold text-gray-900 dark:text-white ${item.color || ''}`}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">🌱 Índice de Aproveitamento Operacional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Score composto</p>
                {eficienciaLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-8 h-8 text-ff-yellow animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-5xl font-bold text-ff-green-active mb-2">{averageEfficiency}%</p>
                    <div className="h-4 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-ff-green-active rounded-full" style={{ width: `${averageEfficiency}%` }} />
                    </div>
                    <p className="text-lg font-semibold text-ff-green-active mt-2">
                      {averageEfficiency >= 90 ? 'Excelente' : averageEfficiency >= 75 ? 'Atenção' : 'Baixa'}
                    </p>
                  </div>
                )}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
                  {[
                    { label: 'Consumo', value: 92 },
                    { label: 'Horas Produtivas', value: 90 },
                    { label: 'Checklists', value: 100 },
                    { label: 'Manutenção', value: 85 },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-[#B3B3B3] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-ff-green-active" />{item.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Últimos Abastecimentos</CardTitle>
                <Button variant="ghost" size="sm" className="text-ff-yellow text-xs p-0 h-auto">
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {abastecimentosLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-ff-yellow animate-spin" />
                  </div>
                ) : recentRefuels.length > 0 ? (
                  recentRefuels.map((refuel) => (
                    <div key={refuel.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{refuel.date}</p>
                        <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">{refuel.tractor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{refuel.liters} L</p>
                        <Badge className="bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30 text-[10px]">{refuel.consumption}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-[#B3B3B3] py-2">Nenhum abastecimento registrado</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom navigation (mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#14141A] border-t border-gray-200 dark:border-[#2A2A2A] px-2 py-1 z-40">
        <Button
          onClick={handleSave}
          disabled={isCreating}
          className="w-full h-14 text-lg font-semibold bg-ff-yellow text-black hover:brightness-110 flex items-center justify-center gap-2"
        >
          {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Abastecimento
        </Button>
      </div>
    </div>
  );
};
