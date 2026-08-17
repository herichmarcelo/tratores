-- Tabelas da frota para o projeto Frango Forte
-- NÃO recria usuarios (já existe com nome_completo, senha, funcao)
-- Rode no SQL Editor do Supabase se as telas de tratores/fazendas falharem

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS setores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS checklist_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    resultado VARCHAR(50) CHECK (resultado IN ('conforme', 'atencao', 'reprovado')),
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE OR REPLACE VIEW vw_checklists_pendentes AS
SELECT
    c.id,
    t.patrimonio,
    t.marca,
    t.modelo,
    COALESCE(u.nome_completo, '') AS operador,
    c.data_checklist,
    c.status
FROM checklists c
JOIN tratores t ON c.trator_id = t.id
LEFT JOIN usuarios u ON c.operador_id = u.id
WHERE c.status = 'pendente';

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

ALTER TABLE fazendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratores ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pneus ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso fazendas" ON fazendas;
CREATE POLICY "Permitir acesso fazendas" ON fazendas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso usuarios" ON usuarios;
CREATE POLICY "Permitir acesso usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso setores" ON setores;
CREATE POLICY "Permitir acesso setores" ON setores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso tratores" ON tratores;
CREATE POLICY "Permitir acesso tratores" ON tratores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso abastecimentos" ON abastecimentos;
CREATE POLICY "Permitir acesso abastecimentos" ON abastecimentos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso checklists" ON checklists;
CREATE POLICY "Permitir acesso checklists" ON checklists FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso checklist_itens" ON checklist_itens;
CREATE POLICY "Permitir acesso checklist_itens" ON checklist_itens FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso pneus" ON pneus;
CREATE POLICY "Permitir acesso pneus" ON pneus FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso manutencoes" ON manutencoes;
CREATE POLICY "Permitir acesso manutencoes" ON manutencoes FOR ALL USING (true) WITH CHECK (true);
