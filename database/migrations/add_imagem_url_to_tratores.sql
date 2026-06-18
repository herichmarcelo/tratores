-- Adiciona coluna para URL da imagem do trator (Cloudinary)
ALTER TABLE tratores
ADD COLUMN IF NOT EXISTS imagem_url TEXT;
