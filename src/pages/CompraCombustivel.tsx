import React, { useMemo, useState } from 'react';
import {
  Fuel,
  Truck,
  DollarSign,
  Loader2,
  Save,
  TrendingUp,
  Droplets,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTanques, useRegisterFuelPurchase } from '../hooks';
import { calcularNovoCmpEntrada, formatCmp, formatCurrency, formatLiters } from '../utils/cmp';

export const CompraCombustivel: React.FC = () => {
  const [selectedTankId, setSelectedTankId] = useState('');
  const [litros, setLitros] = useState('');
  const [precoLitro, setPrecoLitro] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: tanques, isLoading: tanquesLoading } = useTanques();
  const { mutateAsync: registerPurchase, isPending: isSaving } = useRegisterFuelPurchase();

  const selectedTank = tanques?.find((t) => t.id === selectedTankId);
  const litrosNum = parseFloat(litros) || 0;
  const precoNum = parseFloat(precoLitro) || 0;

  const preview = useMemo(() => {
    if (!selectedTank || litrosNum <= 0 || precoNum <= 0) return null;
    return calcularNovoCmpEntrada(
      selectedTank.saldo_atual,
      selectedTank.custo_medio_atual,
      litrosNum,
      precoNum,
    );
  }, [selectedTank, litrosNum, precoNum]);

  const valorCompra = litrosNum * precoNum;
  const exceedsCapacity = selectedTank
    ? selectedTank.saldo_atual + litrosNum > selectedTank.capacidade
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTankId) {
      setError('Selecione um tanque.');
      return;
    }
    if (litrosNum <= 0) {
      setError('Informe a quantidade de litros.');
      return;
    }
    if (precoNum <= 0) {
      setError('Informe o preço por litro.');
      return;
    }
    if (exceedsCapacity) {
      setError(`Capacidade excedida. Máximo disponível: ${(selectedTank!.capacidade - selectedTank!.saldo_atual).toFixed(2)} L`);
      return;
    }

    try {
      await registerPurchase({
        tanque_id: selectedTankId,
        litros: litrosNum,
        preco_litro: precoNum,
        observacoes: observacoes || undefined,
      });
      setSuccess('Compra registrada com sucesso! CMP atualizado.');
      setLitros('');
      setPrecoLitro('');
      setObservacoes('');
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Erro ao registrar compra.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A] px-4 lg:px-6 py-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-ff-yellow/10 flex items-center justify-center">
            <Truck className="w-6 h-6 text-ff-yellow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compra de Combustível</h1>
            <p className="text-sm text-gray-500 dark:text-[#B3B3B3]">
              Registre entradas no tanque e recalcule o Custo Médio Ponderado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <Fuel className="w-5 h-5 text-ff-yellow" />
                Nova Entrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#B3B3B3] mb-1">
                    Tanque de Destino *
                  </label>
                  <Select
                    value={selectedTankId}
                    onChange={(e) => setSelectedTankId(e.target.value)}
                    className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                    disabled={tanquesLoading}
                    required
                  >
                    <option value="">Selecione o tanque...</option>
                    {tanques?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} — {t.fazenda?.nome || 'Sem fazenda'}
                        {t.setor ? ` / ${t.setor.nome}` : ''}
                      </option>
                    ))}
                  </Select>
                </div>

                {selectedTank && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A]">
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 dark:text-[#B3B3B3]">Saldo Atual</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatLiters(selectedTank.saldo_atual)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 dark:text-[#B3B3B3]">CMP Atual</p>
                      <p className="font-bold text-ff-yellow">{formatCmp(selectedTank.custo_medio_atual)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 dark:text-[#B3B3B3]">Capacidade</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatLiters(selectedTank.capacidade)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 dark:text-[#B3B3B3]">Valor em Estoque</p>
                      <p className="font-bold text-ff-green-active">{formatCurrency(selectedTank.custo_total_estoque)}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#B3B3B3] mb-1">
                      Litros Comprados *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={litros}
                      onChange={(e) => setLitros(e.target.value)}
                      placeholder="0,00"
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#B3B3B3] mb-1">
                      Preço/Litro (R$) *
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={precoLitro}
                      onChange={(e) => setPrecoLitro(e.target.value)}
                      placeholder="0,0000"
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#B3B3B3] mb-1">
                    Observações
                  </label>
                  <Input
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: NF 12345 — Caminhão pipa"
                    className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                  />
                </div>

                {valorCompra > 0 && (
                  <div className="p-3 rounded-lg border border-ff-yellow/30 bg-ff-yellow/10">
                    <p className="text-xs uppercase text-ff-yellow font-semibold mb-1">Valor da Compra</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(valorCompra)}</p>
                  </div>
                )}

                {exceedsCapacity && (
                  <p className="text-sm text-red-500">Capacidade do tanque excedida.</p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-ff-green-active">{success}</p>}

                <Button
                  type="submit"
                  className="w-full bg-ff-yellow text-black hover:brightness-110 font-bold"
                  disabled={isSaving || exceedsCapacity}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Registrar Compra
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {preview && (
              <Card className="border-none shadow-sm dark:bg-[#14141A] border-l-4 border-l-ff-green-active">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-ff-green-active" />
                    Preview do Novo CMP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-[#B3B3B3]">Novo Saldo</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatLiters(preview.novoSaldo)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-[#B3B3B3]">Novo CMP</span>
                    <span className="font-bold text-ff-yellow">{formatCmp(preview.novoCmp)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-[#B3B3B3]">Novo Valor em Estoque</span>
                    <span className="font-bold text-ff-green-active">{formatCurrency(preview.novoCustoTotal)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Droplets className="w-5 h-5 text-ff-yellow" />
                  Tanques Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {tanquesLoading ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-ff-yellow" />
                  </div>
                ) : tanques?.length === 0 ? (
                  <p className="p-6 text-center text-gray-500 dark:text-[#B3B3B3]">
                    Nenhum tanque cadastrado. Cadastre em Configurações → Tanques.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A] max-h-[400px] overflow-y-auto">
                    {tanques?.map((t) => (
                      <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">{t.nome}</p>
                          <p className="text-sm text-gray-500 dark:text-[#B3B3B3]">
                            {[t.fazenda?.nome, t.setor?.nome].filter(Boolean).join(' · ')}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge className="bg-ff-yellow/10 text-ff-yellow border-none text-[10px]">
                              {formatLiters(t.saldo_atual)}
                            </Badge>
                            <Badge className="bg-ff-green-active/10 text-ff-green-active border-none text-[10px]">
                              {formatCmp(t.custo_medio_atual)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Em estoque</p>
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(t.custo_total_estoque)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-ff-yellow shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600 dark:text-[#B3B3B3]">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Fórmula CMP (Entrada)</p>
                    <p>
                      Novo CMP = (Saldo × CMP + Litros × Preço) ÷ (Saldo + Litros)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
