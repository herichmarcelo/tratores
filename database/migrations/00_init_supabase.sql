-- ==============================================
-- SETUP INICIAL — rode este script PRIMEIRO no Supabase
-- SQL Editor → New query → Run
-- ==============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fazendas (necessária antes de setores/tratores)
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

-- Usuários
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

-- Setores
CREATE TABLE IF NOT EXISTS setores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tratores
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

-- RLS
ALTER TABLE fazendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso fazendas" ON fazendas FOR ALL USING (true);
CREATE POLICY "Permitir acesso usuarios" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir acesso setores" ON setores FOR ALL USING (true);
CREATE POLICY "Permitir acesso tratores" ON tratores FOR ALL USING (true);

-- Admin inicial (senha: 123456)
INSERT INTO usuarios (nome, email, cargo, perfil, senha_hash)
VALUES (
    'Administrador',
    'admin@pluma.com.br',
    'Administrador',
    'administrador',
    '$2b$10$Kh.tPLJPerkYK/ShNdzQT.NvTq1eROZ6v46md7XhO0fwIIfOF4gG.'
)
ON CONFLICT (email) DO UPDATE SET
    senha_hash = EXCLUDED.senha_hash,
    perfil = EXCLUDED.perfil;

-- Colaborador de teste (senha: 123456) — só Dashboard + Abastecimentos
INSERT INTO usuarios (nome, email, cargo, perfil, senha_hash)
VALUES (
    'João Operador',
    'operador@pluma.com.br',
    'Operador',
    'colaborador',
    '$2b$10$Kh.tPLJPerkYK/ShNdzQT.NvTq1eROZ6v46md7XhO0fwIIfOF4gG.'
)
ON CONFLICT (email) DO UPDATE SET
    senha_hash = EXCLUDED.senha_hash,
    perfil = EXCLUDED.perfil;
