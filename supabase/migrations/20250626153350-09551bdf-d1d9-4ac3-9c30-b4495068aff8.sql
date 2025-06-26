
-- First, create the missing function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Add user_id column to condominiums table to track ownership
ALTER TABLE public.condominiums 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing condominiums to belong to the admin user
UPDATE public.condominiums 
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'kauankg@hotmail.com' LIMIT 1
)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting existing data
ALTER TABLE public.condominiums 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage condominiums" ON public.condominiums;
DROP POLICY IF EXISTS "All authenticated users can view condominiums" ON public.condominiums;

-- Create new policies for condominiums
CREATE POLICY "Users can view their own condominiums" ON public.condominiums
  FOR SELECT TO authenticated USING (
    public.is_current_user_admin() OR 
    auth.uid() = user_id
  );

CREATE POLICY "Users can create their own condominiums" ON public.condominiums
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own condominiums" ON public.condominiums
  FOR UPDATE TO authenticated USING (
    public.is_current_user_admin() OR 
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own condominiums" ON public.condominiums
  FOR DELETE TO authenticated USING (
    public.is_current_user_admin() OR 
    auth.uid() = user_id
  );

-- Update vigilantes policies to be more restrictive
DROP POLICY IF EXISTS "Admins can manage all vigilantes" ON public.vigilantes;
DROP POLICY IF EXISTS "Users can view vigilantes in their condominium" ON public.vigilantes;
DROP POLICY IF EXISTS "Users can manage vigilantes in their own condominiums" ON public.vigilantes;

CREATE POLICY "Admins can manage all vigilantes" ON public.vigilantes
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can manage vigilantes in their own condominiums" ON public.vigilantes
  FOR ALL TO authenticated USING (
    public.is_current_user_admin() OR
    condominium_id IN (
      SELECT id FROM public.condominiums 
      WHERE user_id = auth.uid()
    )
  );

-- Update motorcycles policies
DROP POLICY IF EXISTS "Admins can manage all motorcycles" ON public.motorcycles;
DROP POLICY IF EXISTS "Users can view motorcycles in their condominium" ON public.motorcycles;
DROP POLICY IF EXISTS "Users can manage motorcycles in their own condominiums" ON public.motorcycles;

CREATE POLICY "Admins can manage all motorcycles" ON public.motorcycles
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can manage motorcycles in their own condominiums" ON public.motorcycles
  FOR ALL TO authenticated USING (
    public.is_current_user_admin() OR
    condominium_id IN (
      SELECT id FROM public.condominiums 
      WHERE user_id = auth.uid()
    )
  );

-- Update checklists policies
DROP POLICY IF EXISTS "Admins can manage all checklists" ON public.checklists;
DROP POLICY IF EXISTS "Users can view checklists in their condominium" ON public.checklists;
DROP POLICY IF EXISTS "Users can create checklists in their condominium" ON public.checklists;
DROP POLICY IF EXISTS "Users can manage checklists in their own condominiums" ON public.checklists;

CREATE POLICY "Admins can manage all checklists" ON public.checklists
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can manage checklists in their own condominiums" ON public.checklists
  FOR ALL TO authenticated USING (
    public.is_current_user_admin() OR
    condominium_id IN (
      SELECT id FROM public.condominiums 
      WHERE user_id = auth.uid()
    )
  );
