import {
	actualizarUsuario as actualizarUsuarioService,
	crearUsuario as crearUsuarioService,
	listarUsuarios as listarUsuariosService,
} from '../services/usuarios.service.js';
import {
	actualizarUsuarioParamsSchema,
	actualizarUsuarioSchema,
	crearUsuarioSchema,
} from '../schemas/usuarios.schema.js';

const responderError = (res, error) => res.status(error.statusCode || 500).json({
	error: error.message || 'Error interno del servidor.',
});

const validar = (schema, datos, res) => {
	const resultado = schema.safeParse(datos);
	if (!resultado.success) {
		res.status(400).json({ error: resultado.error.issues[0].message });
		return null;
	}
	return resultado.data;
};

export const listarUsuarios = async (_req, res) => {
	try {
		const usuarios = await listarUsuariosService();
		return res.status(200).json({ usuarios });
	} catch (error) {
		return responderError(res, error);
	}
};

export const crearUsuario = async (req, res) => {
	try {
		const datos = validar(crearUsuarioSchema, req.body, res);
		if (!datos) return;

		const usuario = await crearUsuarioService(datos, req.user.id);
		return res.status(201).json({ message: 'Usuario creado exitosamente.', usuario });
	} catch (error) {
		return responderError(res, error);
	}
};

export const actualizarUsuario = async (req, res) => {
	try {
		const parametros = validar(actualizarUsuarioParamsSchema, req.params, res);
		if (!parametros) return;

		const datos = validar(actualizarUsuarioSchema, req.body || {}, res);
		if (!datos) return;

		const usuario = await actualizarUsuarioService(parametros.id, datos, req.user.id);
		return res.status(200).json({ message: 'Usuario actualizado exitosamente.', usuario });
	} catch (error) {
		return responderError(res, error);
	}
};