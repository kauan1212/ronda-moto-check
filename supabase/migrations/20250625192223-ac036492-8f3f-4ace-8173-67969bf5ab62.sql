
-- Limpar dados fictícios e criar estrutura real
DROP TABLE IF EXISTS public.motorcycles CASCADE;
DROP TABLE IF EXISTS public.checklists CASCADE;
DROP TABLE IF EXISTS public.vigilantes CASCADE;

-- Criar tabela de vigilantes
CREATE TABLE public.vigilantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  registration TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de motocicletas
CREATE TABLE public.motorcycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de checklists
CREATE TABLE public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vigilante_id UUID REFERENCES public.vigilantes(id) ON DELETE CASCADE,
  vigilante_name TEXT NOT NULL,
  motorcycle_id UUID REFERENCES public.motorcycles(id) ON DELETE CASCADE,
  motorcycle_plate TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('start', 'end')),
  
  -- Foto facial
  face_photo TEXT,
  
  -- Itens de verificação com status
  tires_status TEXT CHECK (tires_status IN ('good', 'regular', 'needs_repair')),
  tires_observation TEXT,
  brakes_status TEXT CHECK (brakes_status IN ('good', 'regular', 'needs_repair')),
  brakes_observation TEXT,
  engine_oil_status TEXT CHECK (engine_oil_status IN ('good', 'regular', 'needs_repair')),
  engine_oil_observation TEXT,
  coolant_status TEXT CHECK (coolant_status IN ('good', 'regular', 'needs_repair')),
  coolant_observation TEXT,
  lights_status TEXT CHECK (lights_status IN ('good', 'regular', 'needs_repair')),
  lights_observation TEXT,
  electrical_status TEXT CHECK (electrical_status IN ('good', 'regular', 'needs_repair')),
  electrical_observation TEXT,
  suspension_status TEXT CHECK (suspension_status IN ('good', 'regular', 'needs_repair')),
  suspension_observation TEXT,
  cleaning_status TEXT CHECK (cleaning_status IN ('good', 'regular', 'needs_repair')),
  cleaning_observation TEXT,
  leaks_status TEXT CHECK (leaks_status IN ('good', 'regular', 'needs_repair')),
  leaks_observation TEXT,
  
  -- Fotos da motocicleta
  motorcycle_photos TEXT[],
  
  -- Nível de combustível e fotos
  fuel_level INTEGER,
  fuel_photos TEXT[],
  
  -- Quilometragem e fotos
  motorcycle_km TEXT,
  km_photos TEXT[],
  
  -- Observações gerais
  general_observations TEXT,
  damages TEXT,
  
  -- Assinatura
  signature TEXT,
  
  -- Status e timestamps
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.vigilantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (já que vigilantes acessam via link)
CREATE POLICY "Public access to vigilantes" ON public.vigilantes FOR ALL USING (true);
CREATE POLICY "Public access to motorcycles" ON public.motorcycles FOR ALL USING (true);
CREATE POLICY "Public access to checklists" ON public.checklists FOR ALL USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vigilantes_updated_at BEFORE UPDATE ON public.vigilantes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_motorcycles_updated_at BEFORE UPDATE ON public.motorcycles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
