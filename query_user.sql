-- Script para consultar o usuário com email: testedesistema01@gmail.com
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se o usuário existe na tabela profiles
SELECT 
  id, 
  email, 
  full_name,
  is_admin,
  account_status,
  created_at,
  approved_at,
  approved_by,
  frozen_at,
  frozen_by,
  logo_url
FROM public.profiles 
WHERE email = 'testedesistema01@gmail.com';

-- Verificar também na tabela auth.users (se existir)
SELECT 
  id, 
  email, 
  created_at,
  last_sign_in_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'testedesistema01@gmail.com';

-- Verificar roles do usuário (se existir)
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE p.email = 'testedesistema01@gmail.com'; 