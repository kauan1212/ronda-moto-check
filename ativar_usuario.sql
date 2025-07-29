-- Script para ativar o usuário testedesistema01@gmail.com
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, verificar se o usuário existe
SELECT 
  id, 
  email, 
  full_name,
  is_admin,
  account_status,
  created_at
FROM public.profiles 
WHERE email = 'testedesistema01@gmail.com';

-- 2. Ativar o usuário (definir status como 'active')
UPDATE public.profiles 
SET account_status = 'active',
    approved_at = now(),
    approved_by = (SELECT id FROM public.profiles WHERE email = 'kauankg@hotmail.com'),
    frozen_at = NULL,
    frozen_by = NULL
WHERE email = 'testedesistema01@gmail.com';

-- 3. Verificar se foi ativado
SELECT 
  id, 
  email, 
  account_status,
  approved_at,
  approved_by
FROM public.profiles 
WHERE email = 'testedesistema01@gmail.com';

-- 4. Verificar condomínios existentes
SELECT 
  id,
  name,
  address,
  user_id,
  created_at
FROM public.condominiums 
ORDER BY created_at;

-- 5. Associar o usuário aos condomínios existentes (se necessário)
-- Primeiro, vamos ver quais condomínios não têm user_id definido
SELECT 
  id,
  name,
  address,
  user_id
FROM public.condominiums 
WHERE user_id IS NULL OR user_id = '';

-- 6. Atualizar condomínios sem user_id para pertencer ao usuário ativado
UPDATE public.condominiums 
SET user_id = (SELECT id FROM public.profiles WHERE email = 'testedesistema01@gmail.com')
WHERE user_id IS NULL OR user_id = '';

-- 7. Verificar vigilantes existentes
SELECT 
  id,
  name,
  email,
  condominium_id,
  created_at
FROM public.vigilantes 
ORDER BY created_at;

-- 8. Verificar motos existentes
SELECT 
  id,
  brand,
  model,
  plate,
  condominium_id,
  created_at
FROM public.motorcycles 
ORDER BY created_at;

-- 9. Verificar se há condomínios associados ao usuário
SELECT 
  c.id,
  c.name,
  c.address,
  c.user_id,
  p.email as user_email
FROM public.condominiums c
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com';

-- 10. Verificar vigilantes dos condomínios do usuário
SELECT 
  v.id,
  v.name,
  v.email,
  v.condominium_id,
  c.name as condominium_name,
  p.email as user_email
FROM public.vigilantes v
JOIN public.condominiums c ON v.condominium_id = c.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com';

-- 11. Verificar motos dos condomínios do usuário
SELECT 
  m.id,
  m.brand,
  m.model,
  m.plate,
  m.condominium_id,
  c.name as condominium_name,
  p.email as user_email
FROM public.motorcycles m
JOIN public.condominiums c ON m.condominium_id = c.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com';

-- 12. Resumo final - mostrar tudo que o usuário tem acesso
SELECT 
  'CONDOMÍNIOS' as tipo,
  c.id,
  c.name as nome,
  c.address as endereco,
  NULL as detalhes
FROM public.condominiums c
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com'

UNION ALL

SELECT 
  'VIGILANTES' as tipo,
  v.id,
  v.name as nome,
  c.name as endereco,
  v.email as detalhes
FROM public.vigilantes v
JOIN public.condominiums c ON v.condominium_id = c.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com'

UNION ALL

SELECT 
  'MOTOS' as tipo,
  m.id,
  CONCAT(m.brand, ' ', m.model) as nome,
  c.name as endereco,
  m.plate as detalhes
FROM public.motorcycles m
JOIN public.condominiums c ON m.condominium_id = c.id
JOIN public.profiles p ON c.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com'

ORDER BY tipo, nome; 