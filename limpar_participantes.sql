-- Script para limpar todos os dados de participantes
-- Execute este script no seu banco de dados SQLite

-- Verificar quantos registros existem antes da limpeza
SELECT COUNT(*) as total_registros FROM registrations;

-- Limpar todos os registros de participantes
DELETE FROM registrations;

-- Verificar se a limpeza foi bem-sucedida
SELECT COUNT(*) as registros_restantes FROM registrations;

-- Opcional: Resetar o auto-increment do ID (se necessário)
-- DELETE FROM sqlite_sequence WHERE name='registrations';

-- Confirmar as mudanças
-- COMMIT; 