import { z } from 'zod';

export const listarAuditoriaSchema = z.object({
  pagina: z.coerce.number().int().positive().optional().default(1),
  limite: z.coerce.number().int().positive().max(50).optional().default(20),
});
