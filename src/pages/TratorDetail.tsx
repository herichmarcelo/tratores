import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Fuel,
  Gauge,
  ClipboardList,
  TrendingUp,
  Zap,
  MapPin,
  Loader2,
  User,
  DollarSign,
  Sun,
  Moon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TractorImage } from '../components/TractorImage';
import {
  useTrator,
  useAbastecimentos,
  useChecklists,
  useManutencoes,
  useVwEficienciaTratores,
} from '../hooks';
import { useTheme } from '../contexts/ThemeContext';

const getStatusColor = (status: string, isDark: boolean) => {
  const lower = status.toLowerCase();
  if (lower.includes('ativo') || lower.includes('aprovado') || lower.includes('conclu')) {
    return isDark ? 'bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30' : 'bg-green-100 text-green-700 border-green-200';
  }
  if (lower.includes('manutenção') || lower.includes('pendente') || lower.includes('atencao')) {
    return isDark ? 'bg-ff-warning/20 text-ff-warning border-ff-warning/30' : 'bg-amber-100 text-amber-700 border-amber-200';
  }
  if (lower.includes('reprovado') || lower.includes('inativo')) {
    return isDark ? 'bg-ff-danger/20 text-ff-danger border-ff-danger/30' : 'bg-red-100 text-red-700 border-red-200';
  }
  return isDark ? 'bg-[#1A1A1A] text-[#B3B3B3] border-[#2A2A2A]' : 'bg-gray-100 text-gray-700 border-gray-200';
};

type DetailTab = 'abastecimento' | 'checklists' | 'eficiencia';

const tabs: { id: DetailTab; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'abastecimento', label: 'Histórico de Abastecimento', shortLabel: 'Abastecimento', icon: Fuel },
  { id: 'checklists', label: 'Checklists de Manutenção', shortLabel: 'Checklists', icon: ClipboardList },
  { id: 'eficiencia', label: 'Eficiência do Trator', shortLabel: 'Eficiência', icon: TrendingUp },
];

export const TratorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, setPreference } = useTheme();
  const [activeTab, setActiveTab] = useState<DetailTab>('abastecimento');
  const isDark = theme === 'dark';

  const { data: trator, isLoading: tratorLoading, isError } = useTrator(id ?? '');
  const { data: abastecimentos, isLoading: abastecimentosLoading } = useAbastecimentos();
  const { data: checklists, isLoading: checklistsLoading } = useChecklists();
  const { data: manutencoes, isLoading: manutencoesLoading } = useManutencoes();
  const { data: eficienciaTratores, isLoading: eficienciaLoading } = useVwEficienciaTratores();

  const abastecimentosTrator = useMemo(
    () => abastecimentos?.filter((a) => a.trator_id === id) ?? [],
    [abastecimentos, id],
  );

  const checklistsTrator = useMemo(
    () => checklists?.filter((c) => c.trator_id === id) ?? [],
    [checklists, id],
  );

  const manutencoesTrator = useMemo(
    () => manutencoes?.filter((m) => m.trator_id === id) ?? [],
    [manutencoes, id],
  );

  const eficiencia = eficienciaTratores?.find((e) => e.trator_id === id);
  const eficienciaPercentual = eficiencia?.eficiencia_percentual ?? 0;

  const totalLitros = abastecimentosTrator.reduce((acc, a) => acc + (a.litros_abastecidos || 0), 0);
  const custoTotal = abastecimentosTrator.reduce((acc, a) => acc + (a.valor_total || 0), 0);
  const mediaConsumo = abastecimentosTrator.length > 0
    ? abastecimentosTrator.reduce((acc, a) => acc + (a.consumo_medio || 0), 0) / abastecimentosTrator.length
    : 0;

  const consumoChartData = useMemo(
    () => [...abastecimentosTrator]
      .sort((a, b) => new Date(a.data_abastecimento).getTime() - new Date(b.data_abastecimento).getTime())
      .slice(-8)
      .map((a) => ({
        data: new Date(a.data_abastecimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        consumo: a.consumo_medio ?? 0,
        litros: a.litros_abastecidos,
      })),
    [abastecimentosTrator],
  );

  const eficienciaLabel = eficienciaPercentual >= 90
    ? 'Excelente'
    : eficienciaPercentual >= 75
      ? 'Bom'
      : 'Atenção';

  const toggleTheme = () => {
    setPreference(isDark ? 'light' : 'dark');
  };

  if (tratorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-ff-yellow animate-spin" />
      </div>
    );
  }

  if (isError || !trator) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0A0A0A] p-4 md:p-6 text-center space-y-4">
        <p className="text-gray-500 dark:text-[#B3B3B3]">Trator não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/tratores')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Tratores
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#0A0A0A] pb-6">
      {/* Header com voltar CORRIGIDO */}
      <div className="sticky top-0 z-50 bg-white dark:bg-[#14141A] border-b border-gray-100 dark:border-[#2A2A2A] px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
        <Button
          variant="ghost"
          className="text-gray-600 dark:text-[#B3B3B3] hover:text-ff-yellow dark:hover:text-ff-yellow -ml-2"
          onClick={() => navigate('/tratores')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-gray-600 dark:text-[#B3B3B3] hover:text-ff-yellow dark:hover:text-ff-yellow"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <div className="px-4 lg:px-6 pt-4 space-y-4 lg:space-y-6">
        {/* Card do trator */}
        <Card className="border-none shadow-sm dark:bg-[#14141A]">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <TractorImage
                src={trator.imagem_url}
                alt={`${trator.marca} ${trator.modelo}`}
                size="xl"
                fit="contain"
                bordered={false}
                className="w-full sm:w-32 h-24 sm:h-24 mx-auto sm:mx-0"
              />
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{trator.patrimonio}</h1>
                  <Badge className={getStatusColor(trator.status, isDark)}>{trator.status}</Badge>
                </div>
                <p className="text-gray-600 dark:text-[#B3B3B3] text-lg mb-3">
                  {trator.marca} {trator.modelo}
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex flex-col items-center sm:items-start gap-1 p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-[#B3B3B3]">
                      <Gauge className="w-4 h-4" />
                      <span>Horímetro</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trator.horimetro_atual != null ? `${trator.horimetro_atual.toLocaleString('pt-BR')} h` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start gap-1 p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-[#B3B3B3]">
                      <Fuel className="w-4 h-4" />
                      <span>Tanque</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trator.capacidade_tanque ? `${trator.capacidade_tanque} L` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start gap-1 p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-[#B3B3B3]">
                      <Zap className="w-4 h-4" />
                      <span>Potência</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trator.potencia_cv ? `${trator.potencia_cv} CV` : '—'}
                    </span>
                  </div>
                </div>
                {(trator.fazenda?.nome || trator.setor) && (
                  <div className="flex items-center justify-center sm:justify-start gap-1 mt-3 text-sm text-gray-500 dark:text-[#B3B3B3]">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>
                      {[trator.fazenda?.nome, trator.setor].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abas */}
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-lg w-max min-w-full sm:min-w-0 sm:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-[#14141A] text-ff-yellow shadow-sm'
                    : 'text-gray-500 dark:text-[#B3B3B3] hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'abastecimento' && (
          <div className="space-y-3">
            {abastecimentosLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-ff-yellow animate-spin" />
              </div>
            ) : abastecimentosTrator.length === 0 ? (
              <Card className="border-none shadow-sm dark:bg-[#14141A]">
                <CardContent className="p-8 text-center text-gray-500 dark:text-[#B3B3B3]">
                  Nenhum abastecimento registrado para este trator.
                </CardContent>
              </Card>
            ) : (
              abastecimentosTrator.map((ab) => (
                <Card key={ab.id} className="border-none shadow-sm dark:bg-[#14141A]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#B3B3B3]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(ab.data_abastecimento).toLocaleDateString('pt-BR')}</span>
                          {ab.operador && (
                            <>
                              <User className="w-3.5 h-3.5 ml-1" />
                              <span>{ab.operador.nome}</span>
                            </>
                          )}
                        </div>
                        {ab.horimetro_inicial != null && ab.horimetro_final != null && (
                          <p className="text-xs text-gray-400 dark:text-[#B3B3B3]">
                            Horímetro: {ab.horimetro_inicial} → {ab.horimetro_final} h
                            {ab.horas_trabalhadas != null && ` (${ab.horas_trabalhadas} h trabalhadas)`}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{ab.litros_abastecidos} L</p>
                        {ab.consumo_medio != null && (
                          <Badge className="bg-ff-green-active/20 text-ff-green-active border-ff-green-active/30 text-xs mt-1">
                            {ab.consumo_medio.toFixed(2)} L/h
                          </Badge>
                        )}
                        {ab.valor_total != null && (
                          <p className="text-xs text-gray-500 dark:text-[#B3B3B3] mt-1">
                            R$ {ab.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="space-y-4">
            {checklistsLoading || manutencoesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-ff-yellow animate-spin" />
              </div>
            ) : (
              <>
                {checklistsTrator.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wide">Checklists</h3>
                    {checklistsTrator.map((cl) => (
                      <Card key={cl.id} className="border-none shadow-sm dark:bg-[#14141A]">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getStatusColor(cl.status, isDark)}>{cl.status}</Badge>
                                {cl.score != null && (
                                  <span className="text-sm font-semibold text-gray-700 dark:text-[#B3B3B3]">Score: {cl.score}%</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#B3B3B3]">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(cl.data_checklist).toLocaleDateString('pt-BR')}</span>
                                <Clock className="w-3 h-3 ml-1" />
                                <span>
                                  {new Date(cl.data_checklist).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {cl.operador && (
                                  <>
                                    <User className="w-3 h-3 ml-1" />
                                    <span>{cl.operador.nome}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {manutencoesTrator.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-[#B3B3B3] uppercase tracking-wide">Manutenções</h3>
                    {manutencoesTrator.map((m) => (
                      <Card key={m.id} className="border-none shadow-sm dark:bg-[#14141A]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{m.tipo}</p>
                              {m.descricao && <p className="text-sm text-gray-600 dark:text-[#B3B3B3] mt-1">{m.descricao}</p>}
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#B3B3B3] mt-2">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(m.data_manutencao).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(m.status ?? 'pendente', isDark)}>{m.status ?? 'pendente'}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {checklistsTrator.length === 0 && manutencoesTrator.length === 0 && (
                  <Card className="border-none shadow-sm dark:bg-[#14141A]">
                    <CardContent className="p-8 text-center text-gray-500 dark:text-[#B3B3B3]">
                      Nenhum checklist ou manutenção registrado para este trator.
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'eficiencia' && (
          <div className="space-y-4">
            {eficienciaLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-ff-yellow animate-spin" />
              </div>
            ) : (
              <>
                <Card className="border-none shadow-md dark:bg-[#14141A]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-ff-yellow" />
                      Eficiência do Trator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4 py-2">
                      <p className="text-5xl sm:text-6xl font-bold text-ff-yellow">{eficienciaPercentual}%</p>
                      <div className="h-4 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden mx-4 sm:mx-12">
                        <div
                          className="h-full bg-ff-yellow rounded-full transition-all"
                          style={{ width: `${Math.min(eficienciaPercentual, 100)}%` }}
                        />
                      </div>
                      <p className={`text-lg font-semibold ${
                        eficienciaPercentual >= 90
                          ? 'text-ff-green-active'
                          : eficienciaPercentual >= 75
                            ? 'text-ff-warning'
                            : 'text-ff-danger'
                      }`}>
                        {eficienciaLabel}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="border-none shadow-sm dark:bg-[#14141A]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-ff-warning/20 rounded-lg">
                        <Fuel className="w-5 h-5 text-amber-600 dark:text-ff-warning" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Total abastecido</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {totalLitros.toLocaleString('pt-BR')} L
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm dark:bg-[#14141A]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-ff-green-active/20 rounded-lg">
                        <Gauge className="w-5 h-5 text-green-600 dark:text-ff-green-active" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Consumo médio</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {mediaConsumo > 0 ? `${mediaConsumo.toFixed(2)} L/h` : '—'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm dark:bg-[#14141A]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-ff-green-active/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-ff-green-active" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#B3B3B3]">Custo total diesel</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {consumoChartData.length > 0 && (
                  <Card className="border-none shadow-sm dark:bg-[#14141A]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        Consumo por abastecimento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-56 sm:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={consumoChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A2A' : '#e5e7eb'} />
                            <XAxis dataKey="data" stroke={isDark ? '#B3B3B3' : '#6b7280'} fontSize={12} />
                            <YAxis stroke={isDark ? '#B3B3B3' : '#6b7280'} fontSize={12} unit=" L/h" />
                            <Tooltip
                              formatter={(value) => [`${Number(value).toFixed(2)} L/h`, 'Consumo']}
                              contentStyle={{ backgroundColor: isDark ? '#14141A' : 'white', borderColor: isDark ? '#2A2A2A' : '#e5e7eb', color: isDark ? 'white' : 'inherit' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="consumo"
                              stroke="#3EC300"
                              strokeWidth={2}
                              dot={{ fill: '#3EC300', r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {abastecimentosTrator.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-[#B3B3B3] text-center py-4">
                    Registre abastecimentos para calcular a eficiência com mais precisão.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
