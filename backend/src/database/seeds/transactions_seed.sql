-- Inserir dados de teste na tabela de transações
INSERT INTO transactions (event_id, user_id, amount, payment_method, status)
SELECT 
  e.id as event_id,
  u.id as user_id,
  (random() * 100 + 50)::numeric(10,2) as amount,
  CASE (random() * 2)::integer
    WHEN 0 THEN 'credit_card'
    WHEN 1 THEN 'pix'
    ELSE 'cash'
  END as payment_method,
  CASE (random() * 1)::integer
    WHEN 0 THEN 'paid'
    ELSE 'pending'
  END as status
FROM events e
CROSS JOIN users u
WHERE u.is_admin = false
LIMIT 50; 