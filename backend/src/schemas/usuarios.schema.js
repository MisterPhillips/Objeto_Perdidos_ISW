import { z } from 'zod';
import { normalizarRutChileno, rutChilenoValido } from '../utils/rut.js';

const usuarioId = z.coerce
	.number({ error: 'El identificador del usuario no es válido.' })
	.int({ error: 'El identificador del usuario no es válido.' })
	.positive({ error: 'El identificador del usuario no es válido.' });

const nombreUsuario = z.string({
	error: 'El nombre es obligatorio y no puede superar 100 caracteres.',
})
	.trim()
	.min(1, { error: 'El nombre es obligatorio y no puede superar 100 caracteres.' })
	.max(100, { error: 'El nombre es obligatorio y no puede superar 100 caracteres.' });

const rutUsuario = z.string({
	error: 'Ingresa un RUT válido, por ejemplo 12.345.678-5.',
})
	.trim()
	.max(20, { error: 'Ingresa un RUT válido, por ejemplo 12.345.678-5.' })
	.refine(rutChilenoValido, {
		error: 'Ingresa un RUT válido, por ejemplo 12.345.678-5.',
	})
	.transform(normalizarRutChileno);

const correoUsuario = z.string({
	error: 'Indica un correo válido de hasta 150 caracteres.',
})
	.trim()
	.min(1, { error: 'Indica un correo válido de hasta 150 caracteres.' })
	.max(150, { error: 'Indica un correo válido de hasta 150 caracteres.' })
	.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
		error: 'Indica un correo válido de hasta 150 caracteres.',
	});

const contrasenaUsuario = z.string({
	error: 'La contraseña debe tener al menos 8 caracteres.',
})
	.min(8, { error: 'La contraseña debe tener al menos 8 caracteres.' });

const rolUsuario = z.enum(['FUNCIONARIO', 'ESTUDIANTE', 'ADMIN'], {
	error: 'El rol indicado no es válido.',
});

export const crearUsuarioSchema = z.object({
	nombre: nombreUsuario,
	rut: rutUsuario,
	correo: correoUsuario,
	contrasena: contrasenaUsuario,
	rol: rolUsuario,
});

export const actualizarUsuarioParamsSchema = z.object({ id: usuarioId });

export const actualizarUsuarioSchema = z.object({
	nombre: nombreUsuario.optional(),
	rut: rutUsuario.optional(),
	correo: correoUsuario.optional(),
	contrasena: contrasenaUsuario.optional(),
	rol: rolUsuario.optional(),
	activo: z.boolean({ error: 'El campo activo debe ser booleano.' }).optional(),
}).refine((datos) => Object.values(datos).some((valor) => valor !== undefined), {
	error: 'Indica al menos un campo para actualizar.',
});

export const eliminarUsuarioParamsSchema = actualizarUsuarioParamsSchema;
