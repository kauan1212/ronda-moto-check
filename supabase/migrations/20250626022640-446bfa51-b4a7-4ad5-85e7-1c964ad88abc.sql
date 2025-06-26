
-- Remover todas as políticas RLS que dependem das funções
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "Admins can manage all vigilantes" ON public.vigilantes;
DROP POLICY IF EXISTS "Users can view vigilantes in their condominium" ON public.vigilantes;
DROP POLICY IF EXISTS "Admins can manage all motorcycles" ON public.motorcycles;
DROP POLICY IF EXISTS "Users can view motorcycles in their condominium" ON public.motorcycles;
DROP POLICY IF EXISTS "Admins can manage all checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can view checklists in their condominium" ON public.checklists;
DROP POLICY IF EXISTS "Users can create checklists in their condominium" ON public.checklists;

-- Agora remover as funções
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;

-- Remover o tipo app_role
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Recriar o tipo app_role
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Recriar a tabela user_roles
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user'::public.app_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recriar as funções
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

-- Recriar todas as políticas RLS
-- Profiles policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_current_user_admin());

-- User roles policies
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_current_user_admin());

-- Condominiums policies
CREATE POLICY "Admins can manage condominiums" ON public.condominiums
  FOR ALL USING (public.is_current_user_admin());

-- Vigilantes policies
CREATE POLICY "Admins can manage all vigilantes" ON public.vigilantes
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can view vigilantes in their condominium" ON public.vigilantes
  FOR SELECT TO authenticated USING (
    public.is_current_user_admin() OR
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Motorcycles policies
CREATE POLICY "Admins can manage all motorcycles" ON public.motorcycles
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can view motorcycles in their condominium" ON public.motorcycles
  FOR SELECT TO authenticated USING (
    public.is_current_user_admin() OR
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Checklists policies
CREATE POLICY "Admins can manage all checklists" ON public.checklists
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can view checklists in their condominium" ON public.checklists
  FOR SELECT TO authenticated USING (
    public.is_current_user_admin() OR
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create checklists in their condominium" ON public.checklists
  FOR INSERT TO authenticated WITH CHECK (
    public.is_current_user_admin() OR
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Recriar a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    false
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil/role para usuário %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir o usuário admin inicial
DO $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::public.app_role
  FROM auth.users 
  WHERE email = 'kauankg@hotmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
