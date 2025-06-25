
import { z } from 'zod';

export const vigilanteSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  registration: z.string().min(1, 'Registro é obrigatório'),
  status: z.enum(['active', 'inactive'])
});

export type VigilanteForm = z.infer<typeof vigilanteSchema>;
