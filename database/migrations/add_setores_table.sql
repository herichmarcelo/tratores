-- Tabela de setores vinculados às fazendas
CREATE TABLE IF NOT EXISTS setores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso aos setores" ON setores
    FOR ALL USING (true);
