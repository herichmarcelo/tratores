-- Foto do colaborador
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Dados completos da fazenda
ALTER TABLE fazendas
ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255),
ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(50),
ADD COLUMN IF NOT EXISTS cpf_proprietario VARCHAR(14),
ADD COLUMN IF NOT EXISTS endereco TEXT;
