-- Hierarquia: Administrador (tudo) | Gestor (sua fazenda) | Colaborador (abastecimento)
-- Vincula usuários à propriedade/fazenda

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_usuarios_fazenda ON usuarios(fazenda_id);

COMMENT ON COLUMN usuarios.fazenda_id IS 'Fazenda/propriedade do gestor ou colaborador. NULL = administrador (acesso global).';
