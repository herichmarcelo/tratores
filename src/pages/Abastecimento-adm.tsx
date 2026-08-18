import React, { useEffect, useMemo, useState } from 'react';
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
  Droplets,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DatePicker } from '../components/ui/DatePicker';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  useAbastecimentos,
  useTratores,
  useUsuarios,
  useFazendas,
  useSetores,
  useTanques,
  useOfflineFuelTractor,
} from '../hooks';
import { TractorImage } from '../components/TractorImage';
import { useTheme } from '../contexts/ThemeContext';
import { getAlertaManutencaoBanner } from '../utils/manutencaoAlerts';
import { formatCmp, formatCurrency, formatLiters } from '../utils/cmp';

export const AbastecimentoAdm: React.FC = () => {
  const { theme, setPreference } = useTheme();
  const [initialHourmeter, setInitialHourmeter] = useState('');
  const [finalHourmeter, setFinalHourmeter] = useState('');
  const [liters, setLiters] = useState('');
  const [selectedTractor, setSelectedTractor] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [selectedTankId, setSelectedTankId] = useState('');
  const [dataAbastecimento, setDataAbastecimento] = useState(() => new Date().toISOString().split('T')[0]);

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { data: usuarios, isLoading: usuariosLoading } = useUsuarios();
  const { data: fazendas, isLoading: fazendasLoading } = useFazendas();
  const { data: setores, isLoading: setoresLoading } = useSetores();
  const { data: tanques, isLoading: tanquesLoading } = useTanques({
    fazenda_id: selectedFarmId || undefined,
    setor_id: selectedSectorId || undefined,
  });
  const { mutateAsync: fuelTractor, isPending: isCreating } = useOfflineFuelTractor();

  const currentTrator = tratores?.find((t) => t.id === selectedTractor) || tratores?.[0];
  const effectiveTractorId = selectedTractor || currentTrator?.id || '';
  const selectedTank = tanques?.find((t) => t.id === selectedTankId);

  useEffect(() => {
    if (currentTrator && !selectedTractor) {
      setSelectedTractor(currentTrator.id);
      setInitialHourmeter(currentTrator.horimetro_atual ? String(currentTrator.horimetro_atual) : '');
      setFinalHourmeter(currentTrator.horimetro_atual ? String(currentTrator.horimetro_atual) : '');
      if (currentTrator.fazenda_id) {
        setSelectedFarmId(currentTrator.fazenda_id);
      }
    }
  }, [currentTrator, selectedTractor]);

  useEffect(() => {
    setSelectedTankId('');
  }, [selectedFarmId, selectedSectorId]);

  const setoresFiltrados = useMemo(
    () => setores?.filter((s) => !selectedFarmId || s.fazenda_id === selectedFarmId) ?? [],
    [setores, selectedFarmId],
  );

  const ini = parseFloat(initialHourmeter) || 0;
  const fin = parseFloat(finalHourmeter) || 0;
  const lit = parseFloat(liters) || 0;
  const cmpAtual = selectedTank?.custo_medio_atual ?? 0;
  const saldoDisponivel = selectedTank?.saldo_atual ?? 0;

  const hoursWorked = Math.max(0, fin - ini);
  const consumptionPerHour = hoursWorked > 0 ? (lit / hoursWorked).toFixed(2) : '0.00';
  const totalValue = (lit * cmpAtual).toFixed(2);
  const costPerHour = hoursWorked > 0 ? ((lit * cmpAtual) / hoursWorked).toFixed(2) : '0.00';
  const exceedsTankSaldo = selectedTank ? lit > saldoDisponivel : false;
  const noTankSelected = !selectedTankId;

  const alertaManutencao = useMemo(
    () => getAlertaManutencaoBanner(currentTrator),
    [currentTrator],
  );

  const recentRefuels = abastecimentos?.slice(0, 4).map((ab) => ({
    id: ab.id,
    date: new Date(ab.data_abastecimento).toLocaleDateString('pt-BR'),
    tractor: ab.trator?.patrimonio || 'Desconhecido',
    liters: ab.litros_abastecidos || 0,
    consumption: ab.consumo_medio ? `${ab.consumo_medio} L/h` : '0 L/h',
  })) || [];

  const handleTractorChange = (id: string) => {
    setSelectedTractor(id);
    const trator = tratores?.find((t) => t.id === id);
    if (trator) {
      setInitialHourmeter(trator.horimetro_atual ? String(trator.horimetro_atual) : '');
      setFinalHourmeter(trator.horimetro_atual ? String(trator.horimetro_atual) : '');
      if (trator.fazenda_id) setSelectedFarmId(trator.fazenda_id);
    }
  };

  const handleSave = async () => {
    if (!effectiveTractorId) return alert('Selecione um trator');
    if (!selectedTankId) return alert('Selecione o tanque de origem');
    if (lit <= 0) return alert('Informe os litros abastecidos');
    if (fin <= ini) return alert('Horímetro final deve ser maior que o inicial');
    if (exceedsTankSaldo) {
      return alert(`Saldo insuficiente no tanque. Disponível: ${formatLiters(saldoDisponivel)}`);
    }

    try {
      const result = await fuelTractor({
        tanque_id: selectedTankId,
        trator_id: effectiveTractorId,
        operador_id: selectedOperator || undefined,
        litros: lit,
        horimetro_inicial: ini,
        horimetro_final: fin,
        data_abastecimento: new Date(`${dataAbastecimento}T12:00:00`),
      });
      if (result.mode === 'offline') {
        alert('Abastecimento salvo offline. Será sincronizado quando a internet voltar.');
      } else {
        alert('Abastecimento salvo com sucesso!');
      }
      setLiters('');
    } catch (err) {
      console.error('Erro ao salvar abastecimento:', err);
      const message = (err as { message?: string })?.message || 'Erro ao salvar abastecimento.';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A]">
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tratoresLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : currentTrator?.patrimonio || 'Selecione...'}
                  </h2>
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

        {alertaManutencao && (
          <div className={`p-4 rounded-lg border mb-4 ${alertaManutencao.bgClass}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 shrink-0 ${alertaManutencao.textClass}`} />
              <div className="flex-1">
                <p className={`font-semibold text-sm ${alertaManutencao.textClass}`}>
                  {alertaManutencao.mensagem}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  O trator continua operando normalmente. Registre a manutenção no menu Manutenção.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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
                    <DatePicker value={dataAbastecimento} onChange={setDataAbastecimento} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Trator *</label>
                    <Select
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      value={effectiveTractorId}
                      onChange={(e) => handleTractorChange(e.target.value)}
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
                    <Select
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      value={selectedFarmId}
                      onChange={(e) => { setSelectedFarmId(e.target.value); setSelectedSectorId(''); }}
                      disabled={fazendasLoading}
                    >
                      <option value="">Selecione...</option>
                      {fazendas?.map((f) => (
                        <option key={f.id} value={f.id}>{f.nome}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Setor</label>
                    <Select
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      value={selectedSectorId}
                      onChange={(e) => setSelectedSectorId(e.target.value)}
                      disabled={setoresLoading || !selectedFarmId}
                    >
                      <option value="">Todos os setores</option>
                      {setoresFiltrados.map((s) => (
                        <option key={s.id} value={s.id}>{s.nome}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase flex items-center gap-1"><Droplets className="w-3.5 h-3.5"/> Tanque de Origem *</label>
                    <Select
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      value={selectedTankId}
                      onChange={(e) => setSelectedTankId(e.target.value)}
                      disabled={tanquesLoading}
                    >
                      <option value="">Selecione o tanque...</option>
                      {tanques?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nome} — {formatLiters(t.saldo_atual)} disp.
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {selectedTank && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-ff-yellow/5 border border-ff-yellow/20">
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 dark:text-[#B3B3B3]">Saldo Disponível</p>
                      <p className={`font-bold ${exceedsTankSaldo ? 'text-red-500' : 'text-ff-green-active'}`}>
                        {formatLiters(saldoDisponivel)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 dark:text-[#B3B3B3]">Custo Médio (CMP)</p>
                      <p className="font-bold text-ff-yellow">{formatCmp(cmpAtual)}</p>
                    </div>
                  </div>
                )}
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
                      className={`font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white text-lg ${exceedsTankSaldo ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase">Preço/Litro (CMP)</label>
                    <Input
                      type="text"
                      readOnly
                      value={selectedTank ? formatCmp(cmpAtual).replace('/L', '') : '—'}
                      className="font-medium border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]/50 dark:text-[#B3B3B3] text-lg cursor-not-allowed"
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

                {exceedsTankSaldo && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    Saldo insuficiente no tanque ({formatLiters(saldoDisponivel)} disponíveis)
                  </div>
                )}
                {noTankSelected && lit > 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    Selecione o tanque de origem
                  </div>
                )}

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
                      type="button"
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

            <div className="hidden lg:flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" className="border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                <XCircle className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isCreating || exceedsTankSaldo || noTankSelected || lit <= 0}
                className="bg-ff-yellow text-black hover:brightness-110 font-bold px-8"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Abastecimento
              </Button>
            </div>
          </div>

          <div className="hidden lg:block space-y-6">
            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#2A2A2A] mb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Resumo Final</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Horas Trabalhadas', value: `${hoursWorked.toFixed(2)} h`, icon: Clock },
                  { label: 'Litros Abastecidos', value: `${lit} L`, icon: Fuel },
                  { label: 'CMP Aplicado', value: selectedTank ? formatCmp(cmpAtual) : '—', icon: Droplets, color: 'text-ff-yellow' },
                  { label: 'Consumo Médio', value: `${consumptionPerHour} L/h`, icon: Gauge, color: 'text-ff-green-active' },
                  { label: 'Valor Total', value: formatCurrency(parseFloat(totalValue) || 0), icon: DollarSign },
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#14141A] border-t border-gray-200 dark:border-[#2A2A2A] p-3 z-40 pb-safe">
        <Button
          onClick={handleSave}
          disabled={isCreating || exceedsTankSaldo || noTankSelected || lit <= 0}
          className="w-full h-14 text-base font-bold bg-ff-yellow text-black hover:brightness-110 shadow-lg"
        >
          {isCreating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          SALVAR ABASTECIMENTO
        </Button>
      </div>
    </div>
  );
};
