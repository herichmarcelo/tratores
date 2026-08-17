export type UserProfile = 'administrador' | 'colaborador' | 'gestor';

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  perfil: UserProfile;
  fazenda_id?: string;
  foto_url?: string;
  ativo: boolean;
  created_at: Date;
  updated_at?: Date;
  fazenda?: Fazenda;
}

export interface Fazenda {
  id: string;
  nome: string;
  razao_social?: string;
  inscricao_estadual?: string;
  cpf_proprietario?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface Setor {
  id: string;
  nome: string;
  fazenda_id?: string;
  ativo: boolean;
  created_at: Date;
  updated_at?: Date;
  fazenda?: Fazenda;
}

export interface Tractor {
  id: string;
  patrimonio: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  numero_serie?: string;
  potencia_cv?: number;
  capacidade_tanque?: number;
  horimetro_atual?: number;
  intervalo_manutencao_horas?: number;
  horimetro_ultima_manutencao?: number;
  alerta_manutencao_ativo?: boolean;
  centro_custo?: string;
  status: string;
  fazenda_id?: string;
  setor?: string;
  observacoes?: string;
  imagem_url?: string;
  created_at: Date;
  updated_at?: Date;
  fazenda?: Fazenda;
}

export interface Abastecimento {
  id: string;
  trator_id: string;
  tanque_id?: string;
  operador_id?: string;
  data_abastecimento: Date;
  horimetro_inicial?: number;
  horimetro_final?: number;
  horas_trabalhadas?: number;
  litros_abastecidos: number;
  valor_litro?: number;
  valor_total?: number;
  consumo_medio?: number;
  custo_hora?: number;
  observacoes?: string;
  foto_comprovante?: string;
  foto_painel?: string;
  foto_bomba?: string;
  created_at: Date;
  trator?: Tractor;
  operador?: User;
}

export type TankMovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export interface Tank {
  id: string;
  fazenda_id?: string;
  setor_id?: string;
  nome: string;
  capacidade: number;
  saldo_atual: number;
  custo_medio_atual: number;
  custo_total_estoque: number;
  ativo: boolean;
  created_at: Date;
  updated_at?: Date;
  fazenda?: Fazenda;
  setor?: Setor;
}

export interface TankMovement {
  id: string;
  tanque_id: string;
  tipo: TankMovementType;
  litros: number;
  custo_unitario: number;
  custo_total: number;
  custo_medio_gerado?: number;
  data_movimentacao: Date;
  referencia_id?: string;
  observacoes?: string;
  created_at: Date;
  tanque?: Tank;
}

export interface FuelTractorInput {
  tanque_id: string;
  trator_id: string;
  operador_id?: string;
  litros: number;
  horimetro_inicial?: number;
  horimetro_final?: number;
  data_abastecimento?: Date;
  observacoes?: string;
}

export interface FuelPurchaseInput {
  tanque_id: string;
  litros: number;
  preco_litro: number;
  observacoes?: string;
}

export interface Checklist {
  id: string;
  trator_id: string;
  operador_id?: string;
  data_checklist: Date;
  score?: number;
  status: string;
  observacoes?: string;
  assinatura?: string;
  created_at: Date;
  trator?: Tractor;
  operador?: User;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  item: string;
  resultado?: 'conforme' | 'atencao' | 'reprovado';
  observacao?: string;
  created_at: Date;
}

export interface Pneu {
  id: string;
  trator_id: string;
  posicao?: string;
  marca?: string;
  modelo?: string;
  medida?: string;
  pressao_recomendada?: number;
  pressao_atual?: number;
  vida_util?: number;
  status?: string;
  created_at: Date;
  trator?: Tractor;
}

export type ManutencaoTipo = 'preventiva' | 'corretiva' | 'revisao';

export type NivelAlerta = 'verde' | 'amarelo' | 'laranja' | 'vermelho';

export interface AlertaManutencao {
  trator_id: string;
  patrimonio: string;
  marca_modelo: string;
  horimetro_atual: number;
  proxima_manutencao: number;
  horas_restantes: number;
  percentual_uso: number;
  nivel: NivelAlerta;
  mensagem: string;
}

export interface Manutencao {
  id: string;
  trator_id: string;
  tipo: ManutencaoTipo | string;
  data_manutencao: Date | string;
  horimetro_no_momento?: number;
  valor?: number;
  descricao?: string;
  responsavel?: string;
  responsavel_id?: string;
  status?: string;
  proxima_revisao?: Date;
  observacoes?: string;
  created_at: Date;
  trator?: Tractor;
}

// Views
export interface VwConsumoFrota {
  patrimonio: string;
  marca?: string;
  modelo?: string;
  fazenda?: string;
  total_litros?: number;
  total_custo?: number;
  consumo_medio?: number;
}

export interface VwEficienciaTratores {
  trator_id: string;
  patrimonio: string;
  marca?: string;
  modelo?: string;
  eficiencia_percentual?: number;
}

export interface VwCustosFrota {
  patrimonio: string;
  fazenda?: string;
  custo_abastecimento?: number;
  custo_manutencao?: number;
  custo_total?: number;
}

export interface VwChecklistsPendentes {
  id: string;
  patrimonio: string;
  marca?: string;
  modelo?: string;
  operador?: string;
  data_checklist: Date;
  status: string;
}

export interface VwManutencoesAbertas {
  id: string;
  patrimonio: string;
  marca?: string;
  modelo?: string;
  tipo: string;
  descricao?: string;
  data_manutencao: Date;
  status?: string;
  proxima_revisao?: Date;
}
