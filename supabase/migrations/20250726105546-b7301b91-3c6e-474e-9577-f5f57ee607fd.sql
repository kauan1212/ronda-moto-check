-- Congelar todos os usuários não-admin
UPDATE public.profiles 
SET account_status = 'frozen',
    frozen_by = (SELECT id FROM public.profiles WHERE email = 'kauankg@hotmail.com'),
    frozen_at = now()
WHERE is_admin = false;