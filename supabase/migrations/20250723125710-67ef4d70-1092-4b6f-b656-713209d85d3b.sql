-- Descongelar o usuário de teste para testar o sistema
UPDATE public.profiles 
SET account_status = 'active',
    frozen_by = NULL,
    frozen_at = NULL
WHERE email = 'testedesistemavistoria@gmail.com';