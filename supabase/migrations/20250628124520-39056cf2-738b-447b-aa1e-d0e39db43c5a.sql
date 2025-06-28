
-- Remover a coluna que foi criada incorretamente
ALTER TABLE public.profiles DROP COLUMN IF EXISTS account_status;

-- Criar o enum primeiro
CREATE TYPE account_status_enum AS ENUM ('pending', 'active', 'frozen');

-- Adicionar campos para controle de conta com enum correto
ALTER TABLE public.profiles 
ADD COLUMN account_status account_status_enum NOT NULL DEFAULT 'pending',
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN frozen_by UUID REFERENCES auth.users(id),
ADD COLUMN frozen_at TIMESTAMP WITH TIME ZONE;

-- Função para verificar se usuário está ativo
CREATE OR REPLACE FUNCTION public.is_user_active(user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT account_status = 'active' FROM public.profiles WHERE id = user_id),
    false
  );
$$;

-- Atualizar usuário admin para ativo
UPDATE public.profiles 
SET account_status = 'active', 
    approved_at = now(),
    approved_by = id
WHERE email = 'kauankg@hotmail.com';
