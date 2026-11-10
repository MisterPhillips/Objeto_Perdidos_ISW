import { z } from 'zod';
import { normalizarRutChileno, rutChilenoValido } from '../utils/rut.js';

const objetoId = z.coerce
  .number({ error: 'El identificador del objeto no es válido.' })
  .int({ error: 'El identificador del objeto no es válido.' })
  .positive({ error: 'El identificador del objeto no es válido.' });

const rutRetirante = z.string({
  error: 'El RUT de quien retira es obligatorio.',
})
  .trim()
  .max(20, { error: 'El RUT no puede superar los 20 caracteres.' })
  .refine(rutChilenoValido, {
    error: 'Ingresa un RUT válido, por ejemplo 12.345.678-5.',
  })
  .transform(normalizarRutChileno);

export const registrarRetiroSchema = z.object({
  objetoId,
  rutRetirante,
});

export const buscarRetiranteSchema = z.object({ rutRetirante });
