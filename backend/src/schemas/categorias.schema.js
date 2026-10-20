import { z } from 'zod';

const categoriaId = z.coerce
	.number({ error: 'El identificador de la categoría no es válido.' })
	.int({ error: 'El identificador de la categoría no es válido.' })
	.positive({ error: 'El identificador de la categoría no es válido.' });

const descripcionOpcional = z.string({ error: 'La descripción debe ser texto.' })
	.trim()
	.transform((descripcion) => descripcion || null)
	.nullable()
	.optional();

export const crearCategoriaSchema = z.object({
	nombre: z.string({ error: 'El nombre de la categoría es obligatorio.' })
		.trim()
		.min(1, { error: 'El nombre de la categoría es obligatorio.' })
		.max(80, { error: 'El nombre no puede superar los 80 caracteres.' }),
	descripcion: descripcionOpcional,
});

export const actualizarCategoriaParamsSchema = z.object({ id: categoriaId });

export const actualizarCategoriaSchema = z.object({
	nombre: z.string({ error: 'El nombre debe ser texto y no puede estar vacío.' })
		.trim()
		.min(1, { error: 'El nombre debe ser texto y no puede estar vacío.' })
		.max(80, { error: 'El nombre no puede superar los 80 caracteres.' })
		.optional(),
	descripcion: descripcionOpcional,
}).refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
	error: 'Indica el nombre o la descripción para actualizar.',
});

export const eliminarCategoriaParamsSchema = actualizarCategoriaParamsSchema;