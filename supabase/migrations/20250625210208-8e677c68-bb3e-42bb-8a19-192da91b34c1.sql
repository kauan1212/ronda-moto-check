
-- Primeiro, vamos limpar e recriar as políticas para vigilantes
DROP POLICY IF EXISTS "Users can view vigilantes" ON public.vigilantes;
DROP POLICY IF EXISTS "Users can create vigilantes" ON public.vigilantes;
DROP POLICY IF EXISTS "Users can update vigilantes" ON public.vigilantes;
DROP POLICY IF EXISTS "Users can delete vigilantes" ON public.vigilantes;

-- Criar políticas simples e funcionais para vigilantes
CREATE POLICY "Enable read access for all users" 
  ON public.vigilantes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for all users" 
  ON public.vigilantes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
  ON public.vigilantes 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users" 
  ON public.vigilantes 
  FOR DELETE 
  USING (true);

-- Agora vamos fazer o mesmo para motorcycles
DROP POLICY IF EXISTS "Users can view motorcycles" ON public.motorcycles;
DROP POLICY IF EXISTS "Users can create motorcycles" ON public.motorcycles;
DROP POLICY IF EXISTS "Users can update motorcycles" ON public.motorcycles;
DROP POLICY IF EXISTS "Users can delete motorcycles" ON public.motorcycles;

-- Criar políticas simples e funcionais para motorcycles
CREATE POLICY "Enable read access for all users" 
  ON public.motorcycles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for all users" 
  ON public.motorcycles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
  ON public.motorcycles 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users" 
  ON public.motorcycles 
  FOR DELETE 
  USING (true);

-- Verificar se RLS está habilitado para as tabelas
ALTER TABLE public.vigilantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;
