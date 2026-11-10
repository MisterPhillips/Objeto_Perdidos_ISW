import { z } from 'zod';
import { normalizarRutChileno, rutChilenoValido } from '../utils/rut.js';

const objetoId = z.coerce
  .number({ error: 'El identificador del objeto no es válido.' })
  .int({ error: 'El identificador del objeto no es válido.' })
  .positive({ error: 'El identificador del objeto no es válido.' });

const nombreRetirante = z.string({
  error: 'El nombre de quien retira es obligatorio.',
})
  .trim()
  .min(1, { error: 'El nombre de quien retira es obligatorio.' })
  .max(100, { error: 'El nombre de quien retira no puede superar los 100 caracteres.' });

const rutRetirante = z.string({
  error: 'El RUT de quien retira es obligatorio.',
})
  .trim()
  .max(20, { error: 'El RUT no puede superar los 20 caracteres.' })
  .refine(rutChilenoValido, {
    error: 'Ingresa un RUT válido, por ejemplo 12.345.678-5.',
  })
  .transform(normalizarRutChileno);

const correoRetirante = z.string({
  error: 'El correo de quien retira es obligatorio.',
})
  .trim()
  .max(150, { error: 'El correo no puede superar los 150 caracteres.' })
  .email({ error: 'Ingresa un correo válido.' })
  .transform((correo) => correo.toLowerCase());

export const registrarRetiroSchema = z.object({
  objetoId,
  nombreRetirante,
  rutRetirante,
  correoRetirante,
});
