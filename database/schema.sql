-- ==============================================
-- PLUMA AGROAVÍCOLA FLEET - SCHEMA COMPLETO
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- TABELA: FAZENDAS
-- ==============================================
CREATE TABLE IF NOT EXISTS fazendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    inscricao_estadual VARCHAR(50),
    cpf_proprietario VARCHAR(14),
    endereco TEXT,
    cidade VARCHAR(255),
    estado VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: USUARIOS
-- ==============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cargo VARCHAR(100),
    perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('administrador', 'colaborador', 'gestor')),
    foto_url TEXT,
    senha_hash TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: SETORES
-- ==============================================
CREATE TABLE IF NOT EXISTS setores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: TRATORES
-- ==============================================
CREATE TABLE IF NOT EXISTS tratores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patrimonio VARCHAR(100) UNIQUE NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    ano INT,
    numero_serie VARCHAR(255),
    potencia_cv INT,
    capacidade_tanque NUMERIC(10, 2),
    horimetro_atual NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'ativo',
    fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL,
    setor VARCHAR(255),
    observacoes TEXT,
    imagem_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: ABASTECIMENTOS
-- ==============================================
CREATE TABLE IF NOT EXISTS abastecimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trator_id UUID NOT NULL REFERENCES tratores(id) ON DELETE CASCADE,
    operador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    data_abastecimento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    horimetro_inicial NUMERIC(10, 2),
    horimetro_final NUMERIC(10, 2),
    horas_trabalhadas NUMERIC(10, 2),
    litros_abastecidos NUMERIC(10, 2) NOT NULL,
    valor_litro NUMERIC(10, 2),
    valor_total NUMERIC(10, 2),
    consumo_medio NUMERIC(10, 2),
    custo_hora NUMERIC(10, 2),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: CHECKLISTS
-- ==============================================
CREATE TABLE IF NOT EXISTS checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trator_id UUID NOT NULL REFERENCES tratores(id) ON DELETE CASCADE,
    operador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    data_checklist TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    score INT,
    status VARCHAR(50) DEFAULT 'pendente',
    observacoes TEXT,
    assinatura TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: CHECKLIST_ITENS
-- ==============================================
CREATE TABLE IF NOT EXISTS checklist_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    resultado VARCHAR(50) CHECK (resultado IN ('conforme', 'atencao', 'reprovado')),
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: PNEUS
-- ==============================================
CREATE TABLE IF NOT EXISTS pneus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trator_id UUID NOT NULL REFERENCES tratores(id) ON DELETE CASCADE,
    posicao VARCHAR(50),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    medida VARCHAR(50),
    pressao_recomendada NUMERIC(5, 2),
    pressao_atual NUMERIC(5, 2),
    vida_util INT,
    status VARCHAR(50) DEFAULT 'ok',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- TABELA: MANUTENCOES
-- ==============================================
CREATE TABLE IF NOT EXISTS manutencoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trator_id UUID NOT NULL REFERENCES tratores(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_manutencao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valor NUMERIC(12, 2),
    responsavel VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pendente',
    proxima_revisao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- VIEWS PARA ANALYTICS
-- ==============================================

-- View: vw_consumo_frota
CREATE OR REPLACE VIEW vw_consumo_frota AS
SELECT
    t.patrimonio,
    t.marca,
    t.modelo,
    f.nome AS fazenda,
    SUM(a.litros_abastecidos) AS total_litros,
    SUM(a.valor_total) AS total_custo,
    AVG(a.consumo_medio) AS consumo_medio
FROM abastecimentos a
JOIN tratores t ON a.trator_id = t.id
LEFT JOIN fazendas f ON t.fazenda_id = f.id
GROUP BY t.id, f.id;

-- View: vw_eficiencia_tratores
CREATE OR REPLACE VIEW vw_eficiencia_tratores AS
SELECT
    t.id AS trator_id,
    t.patrimonio,
    t.marca,
    t.modelo,
    ROUND(
        CASE WHEN (AVG(a.consumo_medio) IS NOT NULL AND t.capacidade_tanque IS NOT NULL AND t.capacidade_tanque > 0)
        THEN (t.capacidade_tanque / NULLIF(AVG(a.consumo_medio), 0)) * 10
        ELSE 85 END,
        0
    ) AS eficiencia_percentual
FROM tratores t
LEFT JOIN abastecimentos a ON t.id = a.trator_id
GROUP BY t.id;

-- View: vw_custos_frota
CREATE OR REPLACE VIEW vw_custos_frota AS
SELECT
    t.patrimonio,
    f.nome AS fazenda,
    SUM(a.valor_total) AS custo_abastecimento,
    SUM(m.valor) AS custo_manutencao,
    (SUM(a.valor_total) + COALESCE(SUM(m.valor), 0)) AS custo_total
FROM tratores t
LEFT JOIN fazendas f ON t.fazenda_id = f.id
LEFT JOIN abastecimentos a ON t.id = a.trator_id
LEFT JOIN manutencoes m ON t.id = m.trator_id
GROUP BY t.id, f.id;

-- View: vw_checklists_pendentes
CREATE OR REPLACE VIEW vw_checklists_pendentes AS
SELECT
    c.id,
    t.patrimonio,
    t.marca,
    t.modelo,
    u.nome AS operador,
    c.data_checklist,
    c.status
FROM checklists c
JOIN tratores t ON c.trator_id = t.id
LEFT JOIN usuarios u ON c.operador_id = u.id
WHERE c.status = 'pendente';

-- View: vw_manutencoes_abertas
CREATE OR REPLACE VIEW vw_manutencoes_abertas AS
SELECT
    m.id,
    t.patrimonio,
    t.marca,
    t.modelo,
    m.tipo,
    m.descricao,
    m.data_manutencao,
    m.status,
    m.proxima_revisao
FROM manutencoes m
JOIN tratores t ON m.trator_id = t.id
WHERE m.status IN ('pendente', 'em_andamento');

-- ==============================================
-- TRIGGERS PARA UPDATED_AT
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fazendas_updated_at BEFORE UPDATE ON fazendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON setores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tratores_updated_at BEFORE UPDATE ON tratores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- RLS - ROW LEVEL SECURITY (EXEMPLO)
-- ==============================================
ALTER TABLE fazendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratores ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pneus ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;

-- Política: Administradores podem acessar tudo
CREATE POLICY "Administradores podem acessar tudo" ON fazendas
    FOR ALL USING (true);

CREATE POLICY "Permitir acesso aos usuarios" ON usuarios
    FOR ALL USING (true);

CREATE POLICY "Permitir acesso aos setores" ON setores
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso aos tratores" ON tratores
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso aos abastecimentos" ON abastecimentos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso aos checklists" ON checklists
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso aos checklist_itens" ON checklist_itens
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso aos pneus" ON pneus
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso as manutencoes" ON manutencoes
    FOR ALL USING (true) WITH CHECK (true);

-- (Você pode adicionar políticas mais restritivas posteriormente)
