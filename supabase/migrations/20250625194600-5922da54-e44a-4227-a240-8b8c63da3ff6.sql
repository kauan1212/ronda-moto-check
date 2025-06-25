
-- Criar tabela de condomínios
CREATE TABLE public.condominiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna condominium_id nas tabelas existentes
ALTER TABLE public.vigilantes ADD COLUMN condominium_id UUID REFERENCES public.condominiums(id);
ALTER TABLE public.motorcycles ADD COLUMN condominium_id UUID REFERENCES public.condominiums(id);
ALTER TABLE public.checklists ADD COLUMN condominium_id UUID REFERENCES public.condominiums(id);

-- Inserir um condomínio exemplo
INSERT INTO public.condominiums (name, address, phone, email) 
VALUES ('Condomínio Exemplo', 'Rua das Flores, 123', '(11) 99999-9999', 'admin@condominio.com');

-- Atualizar registros existentes para usar o condomínio exemplo
UPDATE public.vigilantes SET condominium_id = (SELECT id FROM public.condominiums LIMIT 1) WHERE condominium_id IS NULL;
UPDATE public.motorcycles SET condominium_id = (SELECT id FROM public.condominiums LIMIT 1) WHERE condominium_id IS NULL;
UPDATE public.checklists SET condominium_id = (SELECT id FROM public.condominiums LIMIT 1) WHERE condominium_id IS NULL;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_condominiums_updated_at
    BEFORE UPDATE ON public.condominiums
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
