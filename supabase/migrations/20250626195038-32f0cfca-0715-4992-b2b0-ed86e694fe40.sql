
-- Habilitar RLS na tabela condominiums se ainda não estiver habilitado
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- Recriar as políticas de condominiums para garantir isolamento correto
DROP POLICY IF EXISTS "Users can view their own condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "Users can create their own condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "Users can update their own condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "Users can delete their own condominiums" ON public.condominiums;

-- Política para visualizar apenas próprios condomínios
CREATE POLICY "Users can view their own condominiums" ON public.condominiums
  FOR SELECT TO authenticated USING (
    public.is_current_user_admin() OR 
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
    public.is_current_user_admin() OR 
    auth.uid() = user_id
  ) WITH CHECK (
    public.is_current_user_admin() OR 
    auth.uid() = user_id
  );

-- Política para deletar apenas próprios condomínios
CREATE POLICY "Users can delete their own condominiums" ON public.condominiums
  FOR DELETE TO authenticated USING (
    public.is_current_user_admin() OR 
    auth.uid() = user_id
  );

-- Criar políticas para a tabela profiles para permitir que admin gerencie usuários
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (
    auth.uid() = id OR public.is_current_user_admin()
  );

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (
    auth.uid() = id OR public.is_current_user_admin()
  ) WITH CHECK (
    auth.uid() = id OR public.is_current_user_admin()
  );

-- Política para permitir criação de perfil durante signup
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = id
  );

-- Política para admin deletar usuários
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (
    public.is_current_user_admin()
  );

-- Criar políticas para user_roles para permitir que admin gerencie roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Política para usuários verem suas próprias roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR public.is_current_user_admin()
  );

-- Política para admin gerenciar todas as roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (
    public.is_current_user_admin()
  ) WITH CHECK (
    public.is_current_user_admin()
  );
