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
  Loader2,
  Sun,
  Moon,
  MapPin,
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
  useCreateAbastecimento,
} from '../hooks';
import { TractorImage } from '../components/TractorImage';
import { useTheme } from '../contexts/ThemeContext';

export const AbastecimentoAdm: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const [initialHourmeter, setInitialHourmeter] = useState('5800');
  const [finalHourmeter, setFinalHourmeter] = useState('5910');
  const [liters, setLiters] = useState('120');
  const [pricePerLiter, setPricePerLiter] = useState('5.89');
  const [selectedTractor, setSelectedTractor] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('Matriz');
  const [selectedSector, setSelectedSector] = useState('Lavouras Norte');

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: usuarios, isLoading: usuariosLoading } = useUsuarios();
  const { mutateAsync: createAbastecimento, isPending: isCreating } = useCreateAbastecimento();

  // Garante que o trator selecionado exista, ou pega o primeiro da lista carregada
  const currentTrator = tratores?.find((t) => t.id === selectedTractor) || tratores?.[0];
  
  // Se o select estiver vazio mas os tratores carregaram, seta o primeiro como default visualmente
  const effectiveTractorId = selectedTractor || currentTrator?.id || '';

  // Cálculos protegidos contra NaN (caso o usuário limpe o input)
  const ini = parseFloat(initialHourmeter) || 0;
  const fin = parseFloat(finalHourmeter) || 0;
  const lit = parseFloat(liters) || 0;
  const price = parseFloat(pricePerLiter) || 0;

  const hoursWorked = Math.max(0, fin - ini);
  const consumptionPerHour = hoursWorked > 0 ? (lit / hoursWorked).toFixed(2) : '0.00';
  const totalValue = (lit * price).toFixed(2);
  const costPerHour = hoursWorked > 0 ? ((lit * price) / hoursWorked).toFixed(2) : '0.00';

  const recentRefuels = abastecimentos?.slice(0, 4).map((ab) => ({
    id: ab.id,
    date: new Date(ab.data_abastecimento).toLocaleDateString('pt-BR'),
    tractor: ab.trator?.patrimonio || 'Desconhecido',
    liters: ab.litros_abastecidos || 0,
    consumption: ab.consumo_medio ? `${ab.consumo_medio} L/h` : '0 L/h',
  })) || [];

  const handleSave = async () => {
    if (!effectiveTractorId) return alert('Selecione um trator');
    try {
      await createAbastecimento({
        trator_id: effectiveTractorId,
        operador_id: selectedOperator || undefined,
        data_abastecimento: new Date(),
        horimetro_inicial: ini,
        horimetro_final: fin,
        horas_trabalhadas: hoursWorked,
        litros_abastecidos: lit,
        valor_litro: price,
        valor_total: parseFloat(totalValue),
        consumo_medio: parseFloat(consumptionPerHour),
        custo_hora: parseFloat(costPerHour),
      });
      alert('Abastecimento salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar abastecimento:', err);
      alert('Erro ao salvar abastecimento.');
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

      <div className="px-4 lg:px-6 pb-24 pt-4 lg:pt-0">
        
        {/* Card Resumo do Trator (Aparece no Mobile) */}
        <div className="lg:hidden mb-4">
          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <TractorImage
                  src={currentTrator?.imagem_url}
                  alt={currentTrator?.modelo || 'Trator'}
                  size="lg"
                  bordered={false}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {tratoresLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : currentTrator?.patrimonio || 'Selecione...'}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-[#B3B3B3] mb-2 line-clamp-1">
                    {tratoresLoading ? 'Carregando...' : `${currentTrator?.marca || ''} ${currentTrator?.modelo || ''}`}
                  </p>
                  <Badge className="bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30 text-xs">
                    {currentTrator?.status || 'Ativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          
          {/* COLUNA ESQUERDA: Formulário Unificado Responsivo */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            
            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#2A2A2A] mb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-ff-yellow" /> Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Data</label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Trator *</label>
                    <Select
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      value={effectiveTractorId}
                      onChange={(e) => setSelectedTractor(e.target.value)}
                      disabled={tratoresLoading}
                    >
                      <option value="">Selecione o trator...</option>
                      {tratores?.map((t) => (
                        <option key={t.id} value={t.id}>{t.patrimonio} - {t.marca}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase flex items-center gap-1"><User className="w-3.5 h-3.5"/> Operador</label>
                    <Select className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white" value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)} disabled={usuariosLoading}>
                      <option value="">Selecione...</option>
                      {usuarios?.map((u) => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Fazenda</label>
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
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#2A2A2A] mb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-ff-yellow" /> Horímetro
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-ff-yellow gap-1 p-0 h-auto hover:bg-transparent">
                  <Camera className="w-4 h-4" /> <span className="hidden sm:inline">Ler Painel</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Inicial (h)</label>
                    <Input
                      type="number"
                      value={initialHourmeter}
                      onChange={(e) => setInitialHourmeter(e.target.value)}
                      className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white text-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Final (h)</label>
                    <Input
                      type="number"
                      value={finalHourmeter}
                      onChange={(e) => setFinalHourmeter(e.target.value)}
                      className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white text-lg"
                    />
                  </div>
                </div>
                <div className="p-3 bg-ff-green-active/10 rounded-lg border border-ff-green-active/30 w-full sm:w-fit flex items-center justify-between sm:justify-start sm:gap-6">
                  <p className="text-sm text-ff-green-active font-medium">Horas Trabalhadas</p>
                  <p className="text-2xl font-bold text-ff-green-active">{hoursWorked.toFixed(2)} h</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#2A2A2A] mb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-ff-yellow" /> Dados do Abastecimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Litros (L)</label>
                    <Input
                      type="number" step="0.01" value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                      className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white text-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Preço/Litro (R$)</label>
                    <Input
                      type="number" step="0.01" value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(e.target.value)}
                      className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white text-lg"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Valor Total</label>
                    <div className="flex items-center h-[42px] px-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-md border border-gray-200 dark:border-[#2A2A2A]">
                      <span className="text-gray-500 dark:text-[#B3B3B3] font-medium mr-2">R$</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{totalValue}</span>
                    </div>
                  </div>
                </div>

                {/* Cards de Métricas em Tempo Real */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-3 rounded-xl border border-ff-green-active/30 bg-ff-green-active/10">
                    <p className="text-[10px] sm:text-xs font-semibold text-ff-green-active uppercase mb-1 flex items-center gap-1"><Gauge className="w-3.5 h-3.5"/> Consumo Médio</p>
                    <p className="text-xl sm:text-2xl font-bold text-ff-green-active">{consumptionPerHour} L/h</p>
                  </div>
                  <div className="p-3 rounded-xl border border-ff-yellow/30 bg-ff-yellow/10">
                    <p className="text-[10px] sm:text-xs font-semibold text-ff-yellow uppercase mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5"/> Custo por Hora</p>
                    <p className="text-xl sm:text-2xl font-bold text-ff-yellow">R$ {costPerHour}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#2A2A2A] mb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-ff-yellow" /> Evidências Fotográficas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {['Comprovante', 'Painel', 'Bomba'].map((label) => (
                    <button
                      key={label}
                      className="border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] rounded-xl p-3 sm:p-6 flex flex-col items-center justify-center gap-2 hover:border-ff-yellow hover:bg-ff-yellow/5 transition-colors"
                    >
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-[#B3B3B3]" />
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-[#B3B3B3] text-center font-medium leading-tight">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botoes Desktop (Ficam ocultos no mobile pois o mobile tem a barra fixa) */}
            <div className="hidden lg:flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" className="border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                <XCircle className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isCreating} className="bg-ff-yellow text-black hover:brightness-110 font-bold px-8">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Abastecimento
              </Button>
            </div>
          </div>

          {/* COLUNA DIREITA: Sidebar de Resumo (Visível apenas em telas grandes) */}
          <div className="hidden lg:block space-y-6">
            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#2A2A2A] mb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Resumo Final</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Horas Trabalhadas', value: `${hoursWorked.toFixed(2)} h`, icon: Clock },
                  { label: 'Litros Abastecidos', value: `${lit} L`, icon: Fuel },
                  { label: 'Consumo Médio', value: `${consumptionPerHour} L/h`, icon: Gauge, color: 'text-ff-green-active' },
                  { label: 'Valor Total', value: `R$ ${totalValue}`, icon: DollarSign },
                  { label: 'Custo por Hora', value: `R$ ${costPerHour}`, icon: DollarSign },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-dashed border-gray-100 dark:border-[#2A2A2A] last:border-0">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-[#B3B3B3]">
                      <item.icon className="w-4 h-4" /> <span>{item.label}</span>
                    </div>
                    <span className={`font-bold text-gray-900 dark:text-white ${item.color || ''}`}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#2A2A2A] mb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Últimos Registros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {abastecimentosLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-ff-yellow animate-spin" /></div>
                ) : recentRefuels.length > 0 ? (
                  recentRefuels.map((refuel) => (
                    <div key={refuel.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{refuel.date}</p>
                        <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">{refuel.tractor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{refuel.liters} L</p>
                        <Badge className="bg-ff-green-active/10 text-ff-green-active border-none text-[10px] mt-0.5">{refuel.consumption}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-[#B3B3B3] py-2">Nenhum registro encontrado</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom navigation FIXED (Apenas Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#14141A] border-t border-gray-200 dark:border-[#2A2A2A] p-3 z-40 pb-safe">
        <Button
          onClick={handleSave}
          disabled={isCreating}
          className="w-full h-14 text-base font-bold bg-ff-yellow text-black hover:brightness-110 shadow-lg"
        >
          {isCreating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          SALVAR ABASTECIMENTO
        </Button>
      </div>
    </div>
  );
};