
import { z } from 'zod';

export const motorcycleSchema = z.object({
  plate: z.string().min(1, 'Placa é obrigatória'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.number().min(1900, 'Ano deve ser maior que 1900').max(new Date().getFullYear() + 1, 'Ano não pode ser futuro'),
  color: z.string().min(1, 'Cor é obrigatória'),
  status: z.enum(['available', 'in_use', 'maintenance'])
});

export type MotorcycleForm = z.infer<typeof motorcycleSchema>;
