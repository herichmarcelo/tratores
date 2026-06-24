import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Clock,
  Fuel,
  User,
  FlaskConical,
  ArrowRight,
  ChartLine,
  SaveIcon,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import {
  useTratores,
  useCreateAbastecimento,
  useUpdateTrator,
} from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { TractorImage } from '../components/TractorImage';
import { AbastecimentoAdm } from './Abastecimento-adm';

export const Abastecimento: React.FC = () => {
  const { user } = useAuth();
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { mutateAsync: createAbastecimento, isPending: isCreating } = useCreateAbastecimento();
  const { mutateAsync: updateTrator, isPending: isUpdating } = useUpdateTrator();

  const [selectedTractorId, setSelectedTractorId] = useState('');
  const [initialHour, setInitialHour] = useState('');
  const [finalHour, setFinalHour] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter] = useState('5.89');
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const currentTractor = tratores?.find((t) => t.id === selectedTractorId);

  // Calculations
  const initialHourNum = parseFloat(initialHour) || 0;
  const finalHourNum = parseFloat(finalHour) || 0;
  const litersNum = parseFloat(liters) || 0;
  const priceNum = parseFloat(pricePerLiter) || 5.89;

  const hoursWorked = Math.max(0, finalHourNum - initialHourNum);
  const consumption = hoursWorked > 0 ? (litersNum / hoursWorked) : 0;
  const totalValue = litersNum * priceNum;
  const tankCapacity = currentTractor?.capacidade_tanque || 300;
  const exceedsTankCapacity = litersNum > tankCapacity;

  // Initialize with first tractor
  useEffect(() => {
    if (tratores && tratores.length > 0 && !selectedTractorId) {
      const firstTractor = tratores[0];
      setSelectedTractorId(firstTractor.id);
      setInitialHour(firstTractor.horimetro_atual ? String(firstTractor.horimetro_atual) : '');
      setFinalHour(firstTractor.horimetro_atual ? String(firstTractor.horimetro_atual) : '');
    }
  }, [tratores]);

  // Update when tractor changes
  const handleTractorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTractorId(id);
    const tractor = tratores?.find(t => t.id === id);
    if (tractor) {
      setInitialHour(tractor.horimetro_atual ? String(tractor.horimetro_atual) : '');
      setFinalHour(tractor.horimetro_atual ? String(tractor.horimetro_atual) : '');
    }
    setLiters('');
  };

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Save function
  const handleSave = async () => {
    if (!selectedTractorId) {
      showToast('⚠️ Selecione um trator', 'error');
      return;
    }

    if (finalHourNum <= initialHourNum) {
      showToast('⚠️ Horímetro final deve ser maior que o inicial', 'error');
      return;
    }

    if (litersNum <= 0) {
      showToast('⚠️ Digite a quantidade de litros abastecidos', 'error');
      return;
    }

    if (exceedsTankCapacity) {
      showToast(`⚠️ Capacidade máxima do tanque é ${tankCapacity}L. Você tentou abastecer ${litersNum}L!`, 'warning');
      return;
    }

    try {
      setIsUploading(true);

      await createAbastecimento({
        trator_id: selectedTractorId,
        operador_id: user?.id,
        data_abastecimento: new Date(),
        horimetro_inicial: initialHourNum,
        horimetro_final: finalHourNum,
        horas_trabalhadas: hoursWorked,
        litros_abastecidos: litersNum,
        valor_litro: priceNum,
        valor_total: totalValue,
        consumo_medio: consumption,
      });

      await updateTrator({
        id: selectedTractorId,
        horimetro_atual: finalHourNum,
      });

      showToast(`✅ ${litersNum}L abastecidos em ${currentTractor?.patrimonio}`, 'success');
      
      // Reset form
      setLiters('');
      setFinalHour(String(finalHourNum));
      setInitialHour(String(finalHourNum));
      
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar abastecimento', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // If user is not a collaborator, show admin/gestor UI
  if (user?.role !== 'collaborator') {
    return <AbastecimentoAdm />;
  }

  // Collaborator UI - following the template exactly
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0A0A0A] pb-[100px] pt-[env(safe-area-inset-top)]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 -translate-y-full px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg z-50 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${toast.type === 'success' ? 'bg-[#16a34a]' : toast.type === 'error' ? 'bg-[#dc2626]' : 'bg-[#ca8a04]'} animate-[slideDown_0.4s_ease-out_forwards]`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-[480px] mx-auto px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between py-1 pb-3 sticky top-0 z-10 bg-[#f0f2f5] dark:bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#facc15] to-[#f59e0b] rounded-xl flex items-center justify-center text-[#1a1a2e] text-lg shadow-lg">
              <Fuel size={18} />
            </div>
            <h1 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Abastecimento</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-[#22c55e] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
              <User size={8} /> Colaborador
            </span>
          </div>
        </div>

        {/* Tractor Card */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl p-3.5 px-4 shadow-sm border border-[#f3f4f6] dark:border-[#262626] mb-3.5">
          <div className="flex items-center gap-3">
            <TractorImage
              src={currentTractor?.imagem_url}
              alt={`${currentTractor?.marca} ${currentTractor?.modelo}`}
              size="md"
              bordered={false}
              className="w-12 h-12 shrink-0 rounded-xl overflow-hidden"
            />
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider mb-0.5 block flex items-center gap-1">
                <Tractor size={10} /> Trator
              </label>
              <Select
                value={selectedTractorId}
                onChange={handleTractorChange}
                disabled={tratoresLoading}
                className="w-full border-none text-base font-semibold cursor-pointer outline-none appearance-none"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b7280\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  paddingRight: '32px',
                }}
              >
                <option value="">Selecione...</option>
                {tratores?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.patrimonio} - {t.marca} {t.modelo} ({t.capacidade_tanque || '—'}L)
                  </option>
                ))}
              </Select>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* Status Badge */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  (currentTractor?.status || '').toLowerCase().includes('ativo')
                    ? 'bg-[#dcfce7] text-[#16a34a]'
                    : 'bg-[#fef9c3] text-[#ca8a04]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    (currentTractor?.status || '').toLowerCase().includes('ativo')
                      ? 'bg-[#22c55e]'
                      : 'bg-[#f59e0b]'
                  }`} />
                  {(currentTractor?.status || 'Ativo') === 'ativo' ? 'Ativo' : 'Manutenção'}
                </span>
                {/* Tank Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#2563eb]">
                  <Fuel size={10} /> Tanque: {tankCapacity} L
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Horimetro Card */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-[#f3f4f6] dark:border-[#262626] mb-3.5 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f3f4f6] dark:border-[#262626] flex items-center gap-2.5 font-semibold text-sm text-[#1a1a2e] dark:text-white bg-[#fafafa] dark:bg-[#1A1A1A]">
            <Clock className="w-4 h-4 text-[#facc15]" /> Horímetro
          </div>
          <div className="p-3.5 px-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-[#f9fafb] dark:bg-[#1A1A1A] rounded-xl border border-[#e5e7eb] dark:border-[#262626]">
                <label className="text-[10px] font-semibold text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider mb-1 block">
                  Inicial (h)
                </label>
                <div className="text-[22px] font-bold text-[#1a1a2e] dark:text-white">
                  {initialHourNum.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] rounded-xl border border-[#86efac]">
                <label className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1 block">
                  Horas Trabalhadas
                </label>
                <div className="text-[22px] font-bold text-[#16a34a]">
                  {hoursWorked.toFixed(2)} h
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-0">
                <label className="flex items-center gap-1 text-[11px] font-semibold uppercase text-[#6b7280] dark:text-[#9ca3af] mb-1.5 tracking-wider">
                  <ArrowRight className="w-3 h-3 text-[#9ca3af]" /> Horímetro Final (h)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <Input
                    type="number"
                    step="0.01"
                    value={finalHour}
                    onChange={(e) => setFinalHour(e.target.value)}
                    placeholder={`Digite o horímetro final (atual: ${initialHourNum})`}
                    className={`pl-10 pr-3.5 py-3 border-2 rounded-xl text-base font-semibold text-center ${
                      finalHourNum < initialHourNum
                        ? 'border-[#dc2626] shadow-[0_0_0_4px_rgba(220,38,38,0.12)]'
                        : 'border-[#e5e7eb] dark:border-[#262626] bg-white dark:bg-[#171717] text-[#1a1a2e] dark:text-white'
                    }`}
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Litros Abastecidos Card */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-[#f3f4f6] dark:border-[#262626] mb-3.5 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f3f4f6] dark:border-[#262626] flex items-center gap-2.5 font-semibold text-sm text-[#1a1a2e] dark:text-white bg-[#fafafa] dark:bg-[#1A1A1A]">
            <Fuel className="w-4 h-4 text-[#facc15]" /> Abastecimento
          </div>
          <div className="p-3.5 px-4">
            <div className="mb-0">
              <label className="flex items-center gap-1 text-[11px] font-semibold uppercase text-[#6b7280] dark:text-[#9ca3af] mb-1.5 tracking-wider">
                <Fuel className="w-3 h-3 text-[#9ca3af]" /> Litros Abastecidos
              </label>
              <div className="relative">
                <FlaskConical className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                <Input
                  type="number"
                  step="0.01"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  placeholder="0,00"
                  className={`pl-10 pr-12 py-4 border-2 rounded-xl text-center text-2xl font-bold tracking-widest ${
                    exceedsTankCapacity
                      ? 'border-[#dc2626] shadow-[0_0_0_4px_rgba(220,38,38,0.12)] animate-shake'
                      : 'border-[#e5e7eb] dark:border-[#262626] bg-white dark:bg-[#171717] text-[#1a1a2e] dark:text-white'
                  }`}
                  style={{ fontSize: '32px', fontWeight: 700 }}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] font-semibold text-sm">
                  L
                </span>
              </div>
              <div className="text-center text-xs text-[#9ca3af] mt-1">
                Capacidade máxima do tanque: {tankCapacity} L
              </div>
              {exceedsTankCapacity && (
                <div className="text-center text-xs text-[#dc2626] font-semibold mt-1 animate-slideDown">
                  <AlertTriangle className="inline w-3 h-3 mr-1" />
                  Atenção! Você está tentando abastecer além da capacidade do tanque ({tankCapacity} L)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="bg-gradient-to-br from-[#fef9c3] to-[#fde047] rounded-2xl border border-[#fde047] mb-3.5">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="text-[11px] font-semibold text-[#854d0e] uppercase tracking-wider flex items-center gap-1">
                  <ChartLine className="w-3.5 h-3.5" /> Consumo Médio
                </div>
                <div className="text-2xl font-bold text-[#854d0e]">
                  {consumption.toFixed(2)} L/h
                </div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-[11px] font-semibold text-[#854d0e] uppercase tracking-wider flex items-center gap-1 justify-end">
                  <DollarSign className="w-3.5 h-3.5" /> Total
                </div>
                <div className="text-2xl font-bold text-[#854d0e]">
                  R$ {totalValue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-[#14141A] border-t border-[#e5e7eb] dark:border-[#262626] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <Button
          onClick={handleSave}
          disabled={isCreating || isUpdating || isUploading || exceedsTankCapacity}
          className="w-full py-4 bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-[#1a1a2e] border-none rounded-xl text-base font-bold flex items-center justify-center gap-2.5 shadow-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isCreating || isUpdating || isUploading ? (
            <div className="inline-block w-5 h-5 border-2 border-[rgba(26,26,46,0.1)] border-t-[#1a1a2e] rounded-full animate-spin" />
          ) : (
            <SaveIcon className="w-5 h-5" />
          )}
          SALVAR ABASTECIMENTO
        </Button>
      </div>
    </div>
  );
};
