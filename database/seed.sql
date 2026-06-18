-- ==============================================
-- SEED DATA - PLUMA AGROAVÍCOLA FLEET
-- ==============================================

-- Inserir Fazendas
INSERT INTO fazendas (nome, cidade, estado) VALUES
('Fazenda Santa Luzia', 'Pato Branco', 'PR'),
('Fazenda São José', 'Clevelândia', 'PR'),
('Fazenda Nova Esperança', 'São Lourenço do Oeste', 'SC'),
('Fazenda Boa Vista', 'Chapecó', 'SC'),
('Fazenda Terra Boa', 'Xanxerê', 'SC');

-- Inserir Usuários
INSERT INTO usuarios (nome, email, cargo, perfil) VALUES
('João da Silva', 'joao@pluma.com.br', 'Administrador', 'administrador'),
('Maria Santos', 'maria@pluma.com.br', 'Gestor', 'gestor'),
('Pedro Oliveira', 'pedro@pluma.com.br', 'Operador', 'colaborador'),
('Ana Costa', 'ana@pluma.com.br', 'Operador', 'colaborador'),
('Carlos Pereira', 'carlos@pluma.com.br', 'Mecânico', 'colaborador'),
('Fernanda Almeida', 'fernanda@pluma.com.br', 'Gestor', 'gestor'),
('Ricardo Gomes', 'ricardo@pluma.com.br', 'Operador', 'colaborador'),
('Juliana Martins', 'juliana@pluma.com.br', 'Operador', 'colaborador'),
('Luiz Fernandes', 'luiz@pluma.com.br', 'Administrador', 'administrador'),
('Camila Rocha', 'camila@pluma.com.br', 'Operador', 'colaborador');

-- Inserir Tratores
INSERT INTO tratores (patrimonio, marca, modelo, ano, numero_serie, potencia_cv, capacidade_tanque, horimetro_atual, status, setor) VALUES
('TR-001', 'John Deere', '6110J', 2020, 'JD6110J2020001', 110, 200, 5823.50, 'ativo', 'Setor Lavoura Norte'),
('TR-002', 'Massey Ferguson', '4292', 2019, 'MF42922019001', 92, 180, 7245.30, 'ativo', 'Setor Lavoura Sul'),
('TR-003', 'New Holland', 'TL75', 2021, 'NH75TL2021001', 75, 150, 4120.80, 'ativo', 'Setor Milho'),
('TR-004', 'Valtra', 'A950', 2022, 'VAL9502022001', 95, 190, 3560.20, 'ativo', 'Setor Soja'),
('TR-005', 'Case Farmall', '80', 2018, 'CF802018001', 80, 160, 6320.90, 'ativo', 'Setor Trigo'),
('TR-006', 'John Deere', '5090E', 2020, 'JD5090E2020002', 90, 170, 4870.40, 'ativo', 'Setor Lavoura Oeste'),
('TR-007', 'Massey Ferguson', '285', 2017, 'MF2852017001', 85, 140, 8900.10, 'ativo', 'Setor Pastagem'),
('TR-008', 'New Holland', 'TT4.75', 2019, 'NHTT4752019001', 75, 130, 3250.70, 'ativo', 'Setor Cerrado'),
('TR-009', 'Valtra', 'N111', 2021, 'VALN1112021001', 110, 210, 2980.60, 'ativo', 'Setor Milho'),
('TR-010', 'Case Farmall', '95C', 2022, 'CF95C2022001', 95, 185, 4420.30, 'ativo', 'Setor Soja'),
('TR-011', 'John Deere', '6125M', 2019, 'JD6125M2019001', 125, 220, 7125.80, 'ativo', 'Setor Lavoura Norte'),
('TR-012', 'Massey Ferguson', '6713', 2020, 'MF67132020001', 130, 230, 5680.20, 'ativo', 'Setor Lavoura Sul'),
('TR-013', 'New Holland', 'T6.140', 2021, 'NHT61402021001', 140, 240, 4010.50, 'ativo', 'Setor Milho'),
('TR-014', 'Valtra', 'T154', 2018, 'VALT1542018001', 150, 250, 8200.70, 'ativo', 'Setor Soja'),
('TR-015', 'Case Farmall', '110C', 2022, 'CF110C2022001', 110, 200, 3650.90, 'ativo', 'Setor Trigo'),
('TR-016', 'John Deere', '7210R', 2017, 'JD7210R2017001', 210, 300, 9500.10, 'ativo', 'Setor Lavoura Oeste'),
('TR-017', 'Massey Ferguson', '8727', 2020, 'MF87272020001', 270, 350, 6420.40, 'ativo', 'Setor Pastagem'),
('TR-018', 'New Holland', 'T8.320', 2019, 'NHT83202019001', 320, 400, 7890.60, 'ativo', 'Setor Cerrado'),
('TR-019', 'Valtra', 'S284', 2021, 'VALS2842021001', 280, 380, 4980.30, 'ativo', 'Setor Milho'),
('TR-020', 'Case Farmall', 'Magnum 310', 2022, 'CFM3102022001', 310, 420, 3320.80, 'ativo', 'Setor Soja');

-- Inserir Abastecimentos
WITH trator_ids AS (SELECT id, patrimonio FROM tratores),
     operador_ids AS (SELECT id FROM usuarios WHERE perfil = 'colaborador' OR perfil = 'gestor')
INSERT INTO abastecimentos (trator_id, operador_id, data_abastecimento, horimetro_inicial, horimetro_final, horas_trabalhadas, litros_abastecidos, valor_litro, valor_total, consumo_medio, custo_hora)
SELECT
    t.id,
    (SELECT id FROM operador_ids ORDER BY RANDOM() LIMIT 1),
    NOW() - (RANDOM() * INTERVAL '30 days') AS data_abastecimento,
    FLOOR(RANDOM() * 10000)::NUMERIC(10, 2) AS horimetro_inicial,
    FLOOR(RANDOM() * 10000 + 500)::NUMERIC(10, 2) AS horimetro_final,
    FLOOR(RANDOM() * 20 + 1)::NUMERIC(10, 2) AS horas_trabalhadas,
    FLOOR(RANDOM() * 200 + 50)::NUMERIC(10, 2) AS litros_abastecidos,
    (RANDOM() * 3 + 4)::NUMERIC(10, 2) AS valor_litro,
    0 AS valor_total,
    (RANDOM() * 10 + 15)::NUMERIC(10, 2) AS consumo_medio,
    0 AS custo_hora
FROM generate_series(1, 200)
CROSS JOIN trator_ids t
ORDER BY RANDOM()
LIMIT 200;

-- Atualizar valor_total e custo_hora
UPDATE abastecimentos
SET valor_total = litros_abastecidos * valor_litro,
    custo_hora = valor_total / NULLIF(horas_trabalhadas, 0);

-- Inserir Checklists
WITH trator_ids AS (SELECT id FROM tratores),
     operador_ids AS (SELECT id FROM usuarios WHERE perfil = 'colaborador' OR perfil = 'gestor')
INSERT INTO checklists (trator_id, operador_id, data_checklist, score, status)
SELECT
    t.id,
    (SELECT id FROM operador_ids ORDER BY RANDOM() LIMIT 1),
    NOW() - (RANDOM() * INTERVAL '30 days') AS data_checklist,
    FLOOR(RANDOM() * 50 + 50) AS score,
    'aprovado' AS status
FROM generate_series(1, 500)
CROSS JOIN trator_ids t
ORDER BY RANDOM()
LIMIT 500;

-- Inserir Checklist Itens
WITH checklist_ids AS (SELECT id FROM checklists),
     checklist_items_list AS (VALUES
        ('Óleo do Motor'), ('Radiador'), ('Combustível'), ('Pneus'), ('Bateria'),
        ('Sistema Hidráulico'), ('Freios'), ('Iluminação'), ('Limpador de Parabrisa'), ('Emergência Geral')
     )
INSERT INTO checklist_itens (checklist_id, item, resultado)
SELECT
    c.id,
    i.column1,
    CASE WHEN RANDOM() > 0.1 THEN 'conforme' ELSE 'atencao' END AS resultado
FROM checklist_ids c
CROSS JOIN checklist_items_list i;

-- Inserir Pneus
WITH trator_ids AS (SELECT id, patrimonio FROM tratores),
     posicoes AS (VALUES ('Dianteiro Esquerdo'), ('Dianteiro Direito'), ('Traseiro Esquerdo'), ('Traseiro Direito'))
INSERT INTO pneus (trator_id, posicao, marca, modelo, medida, pressao_recomendada, pressao_atual, vida_util, status)
SELECT
    t.id,
    p.column1,
    (ARRAY['Michelin', 'Bridgestone', 'Goodyear', 'Firestone', 'Pirelli'])[FLOOR(RANDOM() * 5 + 1)],
    (ARRAY['Agribib', 'Alliance', 'Trelleborg', 'Mitrac'])[FLOOR(RANDOM() * 4 + 1)],
    '18.4R38',
    2.2,
    (RANDOM() * 0.5 + 1.8)::NUMERIC(5,2),
    FLOOR(RANDOM() * 100 + 1) AS vida_util,
    'ok'
FROM trator_ids t
CROSS JOIN posicoes p;

-- Inserir Manutenções
WITH trator_ids AS (SELECT id FROM tratores)
INSERT INTO manutencoes (trator_id, tipo, descricao, data_manutencao, valor, responsavel, status, proxima_revisao)
SELECT
    t.id,
    (ARRAY['Preventiva', 'Corretiva', 'Troca de Óleo', 'Revisão Geral'])[FLOOR(RANDOM() * 4 + 1)],
    'Manutenção periódica conforme manual do fabricante',
    NOW() - (RANDOM() * INTERVAL '30 days'),
    (RANDOM() * 5000 + 500)::NUMERIC(12,2),
    (ARRAY['Carlos Pereira', 'Oficina Local', 'Concessionária'])[FLOOR(RANDOM() * 3 + 1)],
    'concluida',
    NOW() + (RANDOM() * INTERVAL '180 days')
FROM generate_series(1, 50)
CROSS JOIN trator_ids t
ORDER BY RANDOM()
LIMIT 50;

-- Atualizar fazenda_id em alguns tratores para testes
UPDATE tratores
SET fazenda_id = (SELECT id FROM fazendas ORDER BY RANDOM() LIMIT 1)
WHERE id IN (SELECT id FROM tratores ORDER BY RANDOM() LIMIT 10);
