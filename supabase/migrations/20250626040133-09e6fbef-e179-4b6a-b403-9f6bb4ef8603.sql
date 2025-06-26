
-- Verificar e corrigir as restrições de check constraint para os status dos itens do checklist
-- Remover as restrições antigas se existirem e criar novas mais flexíveis

-- Remover constraint existente se houver
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_coolant_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_tires_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_brakes_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_engine_oil_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_lights_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_electrical_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_suspension_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_cleaning_status_check;
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_leaks_status_check;

-- Criar novas constraints mais flexíveis que permitam valores nulos e os status corretos
ALTER TABLE checklists ADD CONSTRAINT checklists_coolant_status_check 
  CHECK (coolant_status IS NULL OR coolant_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_tires_status_check 
  CHECK (tires_status IS NULL OR tires_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_brakes_status_check 
  CHECK (brakes_status IS NULL OR brakes_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_engine_oil_status_check 
  CHECK (engine_oil_status IS NULL OR engine_oil_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_lights_status_check 
  CHECK (lights_status IS NULL OR lights_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_electrical_status_check 
  CHECK (electrical_status IS NULL OR electrical_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_suspension_status_check 
  CHECK (suspension_status IS NULL OR suspension_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_cleaning_status_check 
  CHECK (cleaning_status IS NULL OR cleaning_status IN ('good', 'regular', 'needs_repair', 'na'));

ALTER TABLE checklists ADD CONSTRAINT checklists_leaks_status_check 
  CHECK (leaks_status IS NULL OR leaks_status IN ('good', 'regular', 'needs_repair', 'na'));
