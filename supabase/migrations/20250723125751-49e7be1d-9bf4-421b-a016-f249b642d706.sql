-- Congelar o usuário de teste para verificar se o sistema funciona
UPDATE public.profiles 
SET account_status = 'frozen',
    frozen_by = (SELECT id FROM public.profiles WHERE email = 'kauankg@hotmail.com'),
    frozen_at = now()
WHERE email = 'testedesistemavistoria@gmail.com';