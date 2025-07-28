-- Script para bloquear o usuário testedesistemavistoria@gmail.com
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se o usuário existe
SELECT 
  id, 
  email, 
  account_status, 
  created_at 
FROM public.profiles 
WHERE email = 'testedesistemavistoria@gmail.com';

-- Bloquear o usuário
UPDATE public.profiles 
SET account_status = 'frozen',
    frozen_by = (SELECT id FROM public.profiles WHERE email = 'kauankg@hotmail.com'),
    frozen_at = now()
WHERE email = 'testedesistemavistoria@gmail.com';

-- Verificar se foi bloqueado
SELECT 
  id, 
  email, 
  account_status, 
  frozen_at,
  frozen_by
FROM public.profiles 
WHERE email = 'testedesistemavistoria@gmail.com'; 