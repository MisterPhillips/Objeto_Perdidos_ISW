import { z } from 'zod';

const identificador = (mensaje) => z.coerce
  .number({ error: mensaje })
  .int({ error: mensaje })
  .positive({ error: mensaje });

const textoObligatorio = (campo, maximo) => {
  const mensaje = `El campo ${campo} es obligatorio y tiene un límite de longitud.`;
  return z.string({ error: mensaje })
    .trim()
    .min(1, { error: mensaje })
    .max(maximo, { error: mensaje });
};

export const crearObjetoSchema = z.object({
  descripcion: z.string({ error: 'La descripción es obligatoria y no puede superar los 150 caracteres.' })
    .trim()
    .min(1, { error: 'La descripción es obligatoria y no puede superar los 150 caracteres.' })
    .max(150, { error: 'La descripción es obligatoria y no puede superar los 150 caracteres.' }),
  categoriaId: identificador('El identificador de categoría no es válido.'),
  puntoRetiroId: identificador('El identificador del punto de retiro no es válido.'),
  objetoPrivado: z.boolean({ error: 'El campo objetoPrivado debe ser booleano.' }).optional().default(false),
});

export const actualizarObjetoParamsSchema = z.object({
  id: identificador('El identificador del objeto no es válido.'),
});

export const actualizarObjetoSchema = z.object({
  descripcion: z.string({ error: 'La descripción debe contener entre 1 y 150 caracteres.' })
    .trim()
    .min(1, { error: 'La descripción debe contener entre 1 y 150 caracteres.' })
    .max(150, { error: 'La descripción debe contener entre 1 y 150 caracteres.' })
    .optional(),
  categoriaId: identificador('El campo categoriaId no es válido.').optional(),
  puntoRetiroId: identificador('El campo puntoRetiroId no es válido.').optional(),
  objetoPrivado: z.boolean({ error: 'El campo objetoPrivado debe ser booleano.' }).optional(),
}).refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
  error: 'Indica al menos un campo para actualizar.',
});

export const eliminarObjetoParamsSchema = actualizarObjetoParamsSchema;

export const entregarObjetoParamsSchema = actualizarObjetoParamsSchema;

export const entregarObjetoSchema = z.object({
  nombreRetirante: textoObligatorio('nombreRetirante', 100),
  rutRetirante: textoObligatorio('rutRetirante', 20),
  correoRetirante: textoObligatorio('correoRetirante', 150)
    .refine((correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo), {
      error: 'El correo del retirante no es válido.',
    }),
});

export const actualizarEstadoObjetoSchema = z.object({
  id: identificador('El identificador del objeto no es válido.'),
  estado: z.unknown().refine(Boolean, { error: 'El estado es obligatorio.' }),
});

export const usuarioObjetoIdSchema = identificador('No se pudo identificar al funcionario autenticado.');