-- Corrige RLS: tabelas com segurança ativa mas sem política de acesso
-- Rode no Supabase → SQL Editor

-- Tratores (causa do erro ao cadastrar)
DROP POLICY IF EXISTS "Permitir acesso tratores" ON tratores;
CREATE POLICY "Permitir acesso tratores" ON tratores
    FOR ALL USING (true) WITH CHECK (true);

-- Demais tabelas (evita erros futuros)
DROP POLICY IF EXISTS "Permitir acesso abastecimentos" ON abastecimentos;
CREATE POLICY "Permitir acesso abastecimentos" ON abastecimentos
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso checklists" ON checklists;
CREATE POLICY "Permitir acesso checklists" ON checklists
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso checklist_itens" ON checklist_itens;
CREATE POLICY "Permitir acesso checklist_itens" ON checklist_itens
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso pneus" ON pneus;
CREATE POLICY "Permitir acesso pneus" ON pneus
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso manutencoes" ON manutencoes;
CREATE POLICY "Permitir acesso manutencoes" ON manutencoes
    FOR ALL USING (true) WITH CHECK (true);

-- Garantir políticas nas tabelas base (caso não existam)
DROP POLICY IF EXISTS "Permitir acesso fazendas" ON fazendas;
CREATE POLICY "Permitir acesso fazendas" ON fazendas
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso usuarios" ON usuarios;
CREATE POLICY "Permitir acesso usuarios" ON usuarios
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso setores" ON setores;
CREATE POLICY "Permitir acesso setores" ON setores
    FOR ALL USING (true) WITH CHECK (true);
