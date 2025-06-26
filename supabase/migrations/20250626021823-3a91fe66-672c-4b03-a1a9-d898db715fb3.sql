
-- Phase 1: More comprehensive cleanup of existing policies

-- Clean up ALL existing policies for vigilantes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vigilantes;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.vigilantes;
DROP POLICY IF EXISTS "Enable update for all users" ON public.vigilantes;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.vigilantes;
DROP POLICY IF EXISTS "Admins can manage vigilantes" ON public.vigilantes;
DROP POLICY IF EXISTS "Vigilantes can view vigilantes in same condominium" ON public.vigilantes;
DROP POLICY IF EXISTS "Users can view vigilantes in their condominium" ON public.vigilantes;

-- Clean up ALL existing policies for motorcycles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.motorcycles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.motorcycles;
DROP POLICY IF EXISTS "Enable update for all users" ON public.motorcycles;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.motorcycles;
DROP POLICY IF EXISTS "Admins can manage motorcycles" ON public.motorcycles;
DROP POLICY IF EXISTS "Users can view motorcycles in their condominium" ON public.motorcycles;

-- Clean up ALL existing policies for checklists
DROP POLICY IF EXISTS "Admins can manage all checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can view checklists in their condominium" ON public.checklists;
DROP POLICY IF EXISTS "Users can create checklists in their condominium" ON public.checklists;

-- Clean up ALL existing policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Clean up condominiums policies
DROP POLICY IF EXISTS "Admins can manage condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "All authenticated users can view condominiums" ON public.condominiums;

-- Phase 2: Create proper role-based system (only if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Clean up existing role functions
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role);
DROP FUNCTION IF EXISTS public.is_current_user_admin();
DROP FUNCTION IF EXISTS public.is_admin();

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Phase 3: Implement secure RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_current_user_admin());

-- Condominiums policies
CREATE POLICY "Admins can manage condominiums" ON public.condominiums
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "All authenticated users can view condominiums" ON public.condominiums
  FOR SELECT TO authenticated USING (true);

-- Vigilantes policies (condominium-based access)
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

-- Motorcycles policies (condominium-based access)
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

-- Checklists policies (condominium-based access)
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

-- Phase 4: Set up the initial admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'kauankg@hotmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update handle_new_user function to not default to admin
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
    false  -- Never default to admin
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::app_role);
  
  RETURN new;
END;
$$;
