-- Senha criptografada do usuário (bcrypt)
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS senha_hash TEXT;

-- Senha padrão temporária "123456" para usuários já existentes sem senha
-- Altere após o primeiro login em Configurações
UPDATE usuarios
SET senha_hash = '$2b$10$Kh.tPLJPerkYK/ShNdzQT.NvTq1eROZ6v46md7XhO0fwIIfOF4gG.'
WHERE senha_hash IS NULL;
