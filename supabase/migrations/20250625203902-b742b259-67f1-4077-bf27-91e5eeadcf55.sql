
-- Enable RLS on all tables that don't have it yet
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- Drop existing public access policies that are too permissive
DROP POLICY IF EXISTS "Public access to vigilantes" ON public.vigilantes;
DROP POLICY IF EXISTS "Public access to motorcycles" ON public.motorcycles;
DROP POLICY IF EXISTS "Public access to checklists" ON public.checklists;

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create admin role check function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Create secure policies for condominiums
CREATE POLICY "Admins can manage condominiums" ON public.condominiums
  FOR ALL USING (public.is_admin());

CREATE POLICY "All authenticated users can view condominiums" ON public.condominiums
  FOR SELECT TO authenticated USING (true);

-- Create secure policies for vigilantes
CREATE POLICY "Admins can manage vigilantes" ON public.vigilantes
  FOR ALL USING (public.is_admin());

CREATE POLICY "Vigilantes can view vigilantes in same condominium" ON public.vigilantes
  FOR SELECT TO authenticated USING (
    public.is_admin() OR 
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Create secure policies for motorcycles
CREATE POLICY "Admins can manage motorcycles" ON public.motorcycles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view motorcycles in their condominium" ON public.motorcycles
  FOR SELECT TO authenticated USING (
    public.is_admin() OR
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Create secure policies for checklists
CREATE POLICY "Admins can manage all checklists" ON public.checklists
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view checklists in their condominium" ON public.checklists
  FOR SELECT TO authenticated USING (
    public.is_admin() OR
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create checklists in their condominium" ON public.checklists
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin() OR
    condominium_id IN (
      SELECT condominium_id FROM public.vigilantes 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Update the profile creation function to NOT default to admin
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
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'),
    false  -- Default to non-admin instead of true
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
