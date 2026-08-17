import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  Loader2,
  Save,
  Home,
  ChevronRight,
  Gauge,
  DollarSign,
  FileText,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  useTratores,
  useCreateManutencao,
  useUpdateTrator,
  useManutencaoAlerts,
} from '../hooks';
import { TractorImage } from '../components/TractorImage';
import { buildAlertaManutencao, getNivelBadgeClasses, getNivelProgressColor } from '../utils/manutencaoAlerts';
import type { ManutencaoTipo, NivelAlerta } from '../types';
import { useAuth } from '../contexts/AuthContext';

const nivelLabel: Record<NivelAlerta, string> = {
  verde: 'Em dia',
  amarelo: 'Atenção',
  laranja: 'Crítico',
  vermelho: 'Vencida',
};

export const Manutencao: React.FC = () => {
  const { user } = useAuth();
  const { data: tratores, isLoading: tratoresLoading } = useTratores();
  const { alertas, isLoading: alertasLoading } = useManutencaoAlerts();
  const { mutateAsync: createManutencao, isPending: isSaving } = useCreateManutencao();
  const { mutateAsync: updateTrator } = useUpdateTrator();

  const [activeTab, setActiveTab] = useState<'alertas' | 'registrar'>('alertas');
  const [selectedTratorId, setSelectedTratorId] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    tipo: 'preventiva' as ManutencaoTipo,
    data: new Date().toISOString().split('T')[0],
    horimetro: '',
    valor: '',
    descricao: '',
    observacoes: '',
  });

  const selectedTrator = tratores?.find((t) => t.id === selectedTratorId);
  const alertaSelecionado = selectedTrator ? buildAlertaManutencao(selectedTrator) : null;

  const alertasComRisco = useMemo(
    () => alertas.filter((a) => a.nivel !== 'verde'),
    [alertas],
  );

  useEffect(() => {
    if (selectedTrator) {
      setForm((f) => ({
        ...f,
        horimetro: selectedTrator.horimetro_atual != null ? String(selectedTrator.horimetro_atual) : '',
      }));
    }
  }, [selectedTrator]);

  const prefillFromAlert = (tratorId: string) => {
    setSelectedTratorId(tratorId);
    setActiveTab('registrar');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const horimetro = parseFloat(form.horimetro);
    const valor = form.valor ? parseFloat(form.valor) : undefined;

    if (!selectedTratorId) {
      setError('Selecione um trator.');
      return;
    }
    if (!horimetro || horimetro < 0) {
      setError('Informe o horímetro no momento da manutenção.');
      return;
    }

    try {
      await createManutencao({
        trator_id: selectedTratorId,
        tipo: form.tipo,
        data_manutencao: form.data,
        horimetro_no_momento: horimetro,
        valor,
        descricao: form.descricao.trim() || undefined,
        observacoes: form.observacoes.trim() || undefined,
        responsavel_id: user?.id,
      });

      await updateTrator({
        id: selectedTratorId,
        horimetro_ultima_manutencao: horimetro,
      });

      showToast('✅ Manutenção registrada com sucesso!');
      setForm({
        tipo: 'preventiva',
        data: new Date().toISOString().split('T')[0],
        horimetro: String(horimetro),
        valor: '',
        descricao: '',
        observacoes: '',
      });
      setActiveTab('alertas');
    } catch (err) {
      setError((err as { message?: string })?.message || 'Erro ao registrar manutenção.');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A] pb-24">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-ff-green-active text-white text-sm font-medium shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="hidden lg:block px-6 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="w-7 h-7 text-ff-yellow" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manutenção</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#B3B3B3] mb-6">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">Manutenção</span>
        </div>
      </div>

      <div className="px-4 lg:px-6 pt-4 lg:pt-0">
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <Wrench className="w-6 h-6 text-ff-yellow" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manutenção</h1>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-lg w-fit mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('alertas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'alertas'
                ? 'bg-white dark:bg-[#14141A] text-ff-yellow shadow-sm'
                : 'text-gray-500 dark:text-[#B3B3B3] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Alertas
            {alertasComRisco.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-ff-danger text-white">
                {alertasComRisco.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('registrar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'registrar'
                ? 'bg-white dark:bg-[#14141A] text-ff-yellow shadow-sm'
                : 'text-gray-500 dark:text-[#B3B3B3] hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            Registrar Manutenção
          </button>
        </div>

        {activeTab === 'alertas' && (
          <Card className="border-none shadow-sm dark:bg-[#14141A]">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-ff-yellow" />
                Alertas de Manutenção Preventiva
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tratoresLoading || alertasLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-ff-yellow" />
                </div>
              ) : alertasComRisco.length === 0 ? (
                <p className="p-8 text-center text-ff-green-active font-medium">
                  ✅ Todos os tratores em dia
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                  {alertasComRisco.map((alerta) => {
                    const trator = tratores?.find((t) => t.id === alerta.trator_id);
                    return (
                      <div key={alerta.trator_id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <TractorImage
                            src={trator?.imagem_url}
                            alt={alerta.patrimonio}
                            size="sm"
                            bordered={false}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900 dark:text-white">{alerta.patrimonio}</p>
                              <Badge className={`text-[10px] border ${getNivelBadgeClasses(alerta.nivel)}`}>
                                {nivelLabel[alerta.nivel]}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-[#B3B3B3] truncate">
                              {alerta.marca_modelo || '—'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[#888] mt-1">
                              Horímetro: {alerta.horimetro_atual.toLocaleString('pt-BR')} h ·{' '}
                              {alerta.horas_restantes <= 0
                                ? `Vencida há ${Math.abs(alerta.horas_restantes).toFixed(0)} h`
                                : `${alerta.horas_restantes.toFixed(0)} h restantes`}
                            </p>
                            <div className="mt-2 h-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${getNivelProgressColor(alerta.nivel)}`}
                                style={{ width: `${Math.min(100, alerta.percentual_uso)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {alerta.percentual_uso.toFixed(0)}% do intervalo utilizado
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => prefillFromAlert(alerta.trator_id)}
                          className="bg-ff-yellow text-black hover:brightness-110 shrink-0"
                        >
                          Registrar Manutenção
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'registrar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Save className="w-5 h-5 text-ff-yellow" />
                  Registrar Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase mb-1 block">
                      Trator *
                    </label>
                    <Select
                      value={selectedTratorId}
                      onChange={(e) => setSelectedTratorId(e.target.value)}
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      required
                    >
                      <option value="">Selecione o trator...</option>
                      {tratores?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.patrimonio} — {t.marca} {t.modelo}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {alertaSelecionado && alertaSelecionado.nivel !== 'verde' && (
                    <div className={`p-3 rounded-lg border ${getNivelBadgeClasses(alertaSelecionado.nivel)}`}>
                      <p className="text-sm font-medium">{alertaSelecionado.mensagem}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase mb-1 block">
                        Tipo
                      </label>
                      <Select
                        value={form.tipo}
                        onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as ManutencaoTipo }))}
                        className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      >
                        <option value="preventiva">Preventiva</option>
                        <option value="corretiva">Corretiva</option>
                        <option value="revisao">Revisão</option>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase mb-1 block">
                        Data
                      </label>
                      <Input
                        type="date"
                        value={form.data}
                        onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                        className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase mb-1 flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5" /> Horímetro no momento *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.horimetro}
                        onChange={(e) => setForm((f) => ({ ...f, horimetro: e.target.value }))}
                        className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> Valor (R$)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.valor}
                        onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                        placeholder="Opcional"
                        className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Descrição
                    </label>
                    <Input
                      value={form.descricao}
                      onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                      placeholder="Ex: Troca de óleo e filtros"
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-[#B3B3B3] uppercase mb-1 block">
                      Observações
                    </label>
                    <Input
                      value={form.observacoes}
                      onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                      placeholder="Detalhes adicionais"
                      className="border-gray-200 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                    />
                  </div>

                  {error && <p className="text-sm text-ff-danger">{error}</p>}

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-ff-yellow text-black hover:brightness-110 font-bold"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Manutenção
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-[#888] text-center">
                    Ao salvar, o horímetro da última manutenção será atualizado e o alerta desaparecerá.
                  </p>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm dark:bg-[#14141A]">
              <CardContent className="p-6">
                <div className="p-4 rounded-xl bg-ff-yellow/10 border border-ff-yellow/30 text-sm text-gray-600 dark:text-[#B3B3B3]">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Importante</p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>Os alertas são <strong>apenas visuais</strong> — não bloqueiam abastecimentos</li>
                    <li>Registre aqui quando a manutenção foi executada</li>
                    <li>O intervalo padrão é 500 h (editável no cadastro do trator)</li>
                  </ul>
                </div>
                {selectedTrator && (
                  <div className="mt-4 flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#1A1A1A]">
                    <TractorImage src={selectedTrator.imagem_url} alt={selectedTrator.patrimonio} size="md" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedTrator.patrimonio}</p>
                      <Link to={`/tratores/${selectedTrator.id}`} className="text-xs text-ff-yellow hover:underline">
                        Ver detalhes →
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
