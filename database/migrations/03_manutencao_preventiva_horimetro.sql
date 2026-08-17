-- Manutenção Preventiva por Horímetro
-- Rode no SQL Editor do Supabase após 01_frangoforte_fleet_tables.sql

-- Campos de controle na frota
ALTER TABLE tratores
    ADD COLUMN IF NOT EXISTS intervalo_manutencao_horas INTEGER DEFAULT 500;

ALTER TABLE tratores
    ADD COLUMN IF NOT EXISTS horimetro_ultima_manutencao NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE tratores
    ADD COLUMN IF NOT EXISTS alerta_manutencao_ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE tratores
    ADD COLUMN IF NOT EXISTS centro_custo VARCHAR(100);

-- Campos adicionais no histórico (tabela já existe na migration 01)
ALTER TABLE manutencoes
    ADD COLUMN IF NOT EXISTS horimetro_no_momento NUMERIC(10, 2);

ALTER TABLE manutencoes
    ADD COLUMN IF NOT EXISTS observacoes TEXT;

ALTER TABLE manutencoes
    ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- Default do tipo para registros preventivos
ALTER TABLE manutencoes
    ALTER COLUMN tipo SET DEFAULT 'preventiva';

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_manutencoes_trator_data
    ON manutencoes(trator_id, data_manutencao DESC);

CREATE INDEX IF NOT EXISTS idx_tratores_alerta_manutencao
    ON tratores(alerta_manutencao_ativo, horimetro_ultima_manutencao);

-- Garantir RLS (idempotente)
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso manutencoes" ON manutencoes;
CREATE POLICY "Permitir acesso manutencoes" ON manutencoes
    FOR ALL USING (true) WITH CHECK (true);
