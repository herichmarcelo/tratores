export type UserProfile = 'administrador' | 'colaborador' | 'gestor';

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  perfil: UserProfile;
  foto_url?: string;
  ativo: boolean;
  created_at: Date;
  updated_at?: Date;
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
  created_at: Date;
  trator?: Tractor;
  operador?: User;
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

export interface Manutencao {
  id: string;
  trator_id: string;
  tipo: string;
  descricao?: string;
  data_manutencao: Date;
  valor?: number;
  responsavel?: string;
  status?: string;
  proxima_revisao?: Date;
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
