-- Gestão de Tanques de Combustível com Custo Médio Ponderado (CMP)
-- Rode no SQL Editor do Supabase após 01_frangoforte_fleet_tables.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- TABELAS
-- ==============================================

CREATE TABLE IF NOT EXISTS tanques_combustivel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fazenda_id UUID REFERENCES fazendas(id) ON DELETE SET NULL,
    setor_id UUID REFERENCES setores(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    capacidade NUMERIC(15, 3) NOT NULL CHECK (capacidade > 0),
    saldo_atual NUMERIC(15, 3) NOT NULL DEFAULT 0 CHECK (saldo_atual >= 0),
    custo_medio_atual NUMERIC(15, 6) NOT NULL DEFAULT 0,
    custo_total_estoque NUMERIC(15, 6) NOT NULL DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimentacoes_tanque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanque_id UUID NOT NULL REFERENCES tanques_combustivel(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA', 'AJUSTE')),
    litros NUMERIC(15, 3) NOT NULL CHECK (litros > 0),
    custo_unitario NUMERIC(15, 6) NOT NULL,
    custo_total NUMERIC(15, 6) NOT NULL,
    custo_medio_gerado NUMERIC(15, 6),
    data_movimentacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    referencia_id UUID,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE abastecimentos
    ADD COLUMN IF NOT EXISTS tanque_id UUID REFERENCES tanques_combustivel(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tanques_fazenda ON tanques_combustivel(fazenda_id);
CREATE INDEX IF NOT EXISTS idx_tanques_setor ON tanques_combustivel(setor_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tanque ON movimentacoes_tanque(tanque_id, data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_tanque ON abastecimentos(tanque_id);

-- ==============================================
-- ENTRADA: Compra de combustível (recalcula CMP)
-- ==============================================

CREATE OR REPLACE FUNCTION register_fuel_purchase(
    p_tanque_id UUID,
    p_litros NUMERIC,
    p_preco_litro NUMERIC,
    p_observacoes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tank tanques_combustivel%ROWTYPE;
    v_novo_saldo NUMERIC(15, 3);
    v_novo_cmp NUMERIC(15, 6);
    v_novo_custo_total NUMERIC(15, 6);
    v_mov_id UUID;
BEGIN
    IF p_litros IS NULL OR p_litros <= 0 THEN
        RAISE EXCEPTION 'Litros deve ser maior que zero';
    END IF;
    IF p_preco_litro IS NULL OR p_preco_litro <= 0 THEN
        RAISE EXCEPTION 'Preço por litro deve ser maior que zero';
    END IF;

    SELECT * INTO v_tank
    FROM tanques_combustivel
    WHERE id = p_tanque_id AND ativo = TRUE
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tanque não encontrado ou inativo';
    END IF;

    v_novo_saldo := v_tank.saldo_atual + p_litros;

    IF v_novo_saldo > v_tank.capacidade THEN
        RAISE EXCEPTION 'Capacidade do tanque excedida. Saldo atual: % L, capacidade: % L',
            v_tank.saldo_atual, v_tank.capacidade;
    END IF;

    IF v_tank.saldo_atual = 0 THEN
        v_novo_cmp := p_preco_litro;
    ELSE
        v_novo_cmp := (
            (v_tank.saldo_atual * v_tank.custo_medio_atual) + (p_litros * p_preco_litro)
        ) / v_novo_saldo;
    END IF;

    v_novo_custo_total := v_novo_saldo * v_novo_cmp;

    UPDATE tanques_combustivel
    SET saldo_atual = v_novo_saldo,
        custo_medio_atual = v_novo_cmp,
        custo_total_estoque = v_novo_custo_total,
        updated_at = NOW()
    WHERE id = p_tanque_id;

    INSERT INTO movimentacoes_tanque (
        tanque_id, tipo, litros, custo_unitario, custo_total, custo_medio_gerado, observacoes
    ) VALUES (
        p_tanque_id,
        'ENTRADA',
        p_litros,
        p_preco_litro,
        p_litros * p_preco_litro,
        v_novo_cmp,
        p_observacoes
    )
    RETURNING id INTO v_mov_id;

    RETURN v_mov_id;
END;
$$;

-- ==============================================
-- SAÍDA: Abastecimento de trator (CMP não muda)
-- ==============================================

CREATE OR REPLACE FUNCTION fuel_tractor(
    p_tanque_id UUID,
    p_trator_id UUID,
    p_operador_id UUID,
    p_litros NUMERIC,
    p_horimetro_inicial NUMERIC,
    p_horimetro_final NUMERIC,
    p_data_abastecimento TIMESTAMPTZ DEFAULT NOW(),
    p_observacoes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tank tanques_combustivel%ROWTYPE;
    v_cmp NUMERIC(15, 6);
    v_novo_saldo NUMERIC(15, 3);
    v_novo_custo_total NUMERIC(15, 6);
    v_horas NUMERIC(15, 3);
    v_valor_litro NUMERIC(15, 6);
    v_valor_total NUMERIC(15, 6);
    v_consumo NUMERIC(15, 6);
    v_custo_hora NUMERIC(15, 6);
    v_abast_id UUID;
    v_mov_id UUID;
BEGIN
    IF p_litros IS NULL OR p_litros <= 0 THEN
        RAISE EXCEPTION 'Litros deve ser maior que zero';
    END IF;

    IF p_horimetro_final IS NOT NULL AND p_horimetro_inicial IS NOT NULL
       AND p_horimetro_final <= p_horimetro_inicial THEN
        RAISE EXCEPTION 'Horímetro final deve ser maior que o inicial';
    END IF;

    SELECT * INTO v_tank
    FROM tanques_combustivel
    WHERE id = p_tanque_id AND ativo = TRUE
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tanque não encontrado ou inativo';
    END IF;

    IF p_litros > v_tank.saldo_atual THEN
        RAISE EXCEPTION 'Saldo insuficiente no tanque. Disponível: % L, solicitado: % L',
            v_tank.saldo_atual, p_litros;
    END IF;

    v_cmp := v_tank.custo_medio_atual;
    v_valor_litro := v_cmp;
    v_valor_total := p_litros * v_cmp;
    v_novo_saldo := v_tank.saldo_atual - p_litros;
    v_novo_custo_total := v_novo_saldo * v_cmp;

    v_horas := COALESCE(p_horimetro_final, 0) - COALESCE(p_horimetro_inicial, 0);
    IF v_horas < 0 THEN v_horas := 0; END IF;

    v_consumo := CASE WHEN v_horas > 0 THEN p_litros / v_horas ELSE 0 END;
    v_custo_hora := CASE WHEN v_horas > 0 THEN v_valor_total / v_horas ELSE 0 END;

    UPDATE tanques_combustivel
    SET saldo_atual = v_novo_saldo,
        custo_total_estoque = v_novo_custo_total,
        updated_at = NOW()
    WHERE id = p_tanque_id;

    INSERT INTO abastecimentos (
        trator_id,
        operador_id,
        tanque_id,
        data_abastecimento,
        horimetro_inicial,
        horimetro_final,
        horas_trabalhadas,
        litros_abastecidos,
        valor_litro,
        valor_total,
        consumo_medio,
        custo_hora,
        observacoes
    ) VALUES (
        p_trator_id,
        p_operador_id,
        p_tanque_id,
        COALESCE(p_data_abastecimento, NOW()),
        p_horimetro_inicial,
        p_horimetro_final,
        NULLIF(v_horas, 0),
        p_litros,
        v_valor_litro,
        v_valor_total,
        NULLIF(v_consumo, 0),
        NULLIF(v_custo_hora, 0),
        p_observacoes
    )
    RETURNING id INTO v_abast_id;

    INSERT INTO movimentacoes_tanque (
        tanque_id, tipo, litros, custo_unitario, custo_total, custo_medio_gerado, referencia_id, observacoes
    ) VALUES (
        p_tanque_id,
        'SAIDA',
        p_litros,
        v_cmp,
        v_valor_total,
        v_cmp,
        v_abast_id,
        p_observacoes
    )
    RETURNING id INTO v_mov_id;

    IF p_horimetro_final IS NOT NULL THEN
        UPDATE tratores
        SET horimetro_atual = p_horimetro_final,
            updated_at = NOW()
        WHERE id = p_trator_id;
    END IF;

    RETURN v_abast_id;
END;
$$;

-- RLS
ALTER TABLE tanques_combustivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_tanque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso tanques" ON tanques_combustivel;
CREATE POLICY "Permitir acesso tanques" ON tanques_combustivel
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso movimentacoes tanque" ON movimentacoes_tanque;
CREATE POLICY "Permitir acesso movimentacoes tanque" ON movimentacoes_tanque
    FOR ALL USING (true) WITH CHECK (true);
