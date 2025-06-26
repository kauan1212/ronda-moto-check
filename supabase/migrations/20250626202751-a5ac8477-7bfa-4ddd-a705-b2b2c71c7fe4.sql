
-- Verificar e corrigir as políticas RLS para condominiums
-- Primeiro, remover as políticas existentes
DROP POLICY IF EXISTS "Users can view their own condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "Users can create their own condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "Users can update their own condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "Users can delete their own condominiums" ON public.condominiums;

-- Garantir que RLS está habilitado
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- Criar política para visualizar apenas próprios condomínios (sem privilégios especiais para admin)
CREATE POLICY "Users can view their own condominiums" ON public.condominiums
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id
  );

-- Política para criar condomínios (deve pertencer ao usuário logado)
CREATE POLICY "Users can create their own condominiums" ON public.condominiums
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
  );

-- Política para atualizar apenas próprios condomínios
CREATE POLICY "Users can update their own condominiums" ON public.condominiums
  FOR UPDATE TO authenticated USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Política para deletar apenas próprios condomínios
CREATE POLICY "Users can delete their own condominiums" ON public.condominiums
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id
  );

-- Verificar se todos os condomínios têm user_id definido
UPDATE public.condominiums 
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'kauankg@hotmail.com' LIMIT 1
)
WHERE user_id IS NULL;
