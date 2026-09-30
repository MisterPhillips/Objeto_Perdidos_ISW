import {
	actualizarUsuario as actualizarUsuarioService,
	crearUsuario as crearUsuarioService,
	desactivarUsuario as desactivarUsuarioService,
	listarUsuarios as listarUsuariosService,
	rolesPermitidos,
} from '../services/usuarios.service.js';

const obtenerId = (id) => {
	const usuarioId = Number(id);
	return Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : null;
};

const responderError = (res, error) => res.status(error.statusCode || 500).json({
	error: error.message || 'Error interno del servidor.',
});

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
		const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';
		const correo = typeof req.body?.correo === 'string' ? req.body.correo.trim() : '';
		const contrasena = req.body?.contrasena;
		const rol = req.body?.rol;

		if (!nombre || nombre.length > 100) {
			return res.status(400).json({ error: 'El nombre es obligatorio y no puede superar 100 caracteres.' });
		}
		if (!correo || correo.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
			return res.status(400).json({ error: 'Indica un correo válido de hasta 150 caracteres.' });
		}
		if (typeof contrasena !== 'string' || contrasena.length < 8) {
			return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
		}
		if (!rolesPermitidos.includes(rol)) {
			return res.status(400).json({ error: 'El rol indicado no es válido.' });
		}

		const usuario = await crearUsuarioService({ nombre, correo, contrasena, rol });
		return res.status(201).json({ message: 'Usuario creado exitosamente.', usuario });
	} catch (error) {
		return responderError(res, error);
	}
};

export const actualizarUsuario = async (req, res) => {
	try {
		const usuarioId = obtenerId(req.params.id);
		if (!usuarioId) return res.status(400).json({ error: 'El identificador del usuario no es válido.' });

		const datos = {};
		if (req.body?.nombre !== undefined) {
			if (typeof req.body.nombre !== 'string' || !req.body.nombre.trim() || req.body.nombre.trim().length > 100) {
				return res.status(400).json({ error: 'El nombre es obligatorio y no puede superar 100 caracteres.' });
			}
			datos.nombre = req.body.nombre.trim();
		}
		if (req.body?.correo !== undefined) {
			if (typeof req.body.correo !== 'string' || req.body.correo.trim().length > 150
				|| !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.correo.trim())) {
				return res.status(400).json({ error: 'Indica un correo válido de hasta 150 caracteres.' });
			}
			datos.correo = req.body.correo.trim();
		}
		if (req.body?.rol !== undefined) {
			if (!rolesPermitidos.includes(req.body.rol)) {
				return res.status(400).json({ error: 'El rol indicado no es válido.' });
			}
			datos.rol = req.body.rol;
		}
		if (req.body?.activo !== undefined) {
			if (typeof req.body.activo !== 'boolean') {
				return res.status(400).json({ error: 'El campo activo debe ser booleano.' });
			}
			datos.activo = req.body.activo;
		}
		if (req.body?.contrasena !== undefined) {
			if (typeof req.body.contrasena !== 'string' || req.body.contrasena.length < 8) {
				return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
			}
			datos.contrasena = req.body.contrasena;
		}
		if (Object.keys(datos).length === 0) {
			return res.status(400).json({ error: 'Indica al menos un campo para actualizar.' });
		}

		const usuario = await actualizarUsuarioService(usuarioId, datos);
		return res.status(200).json({ message: 'Usuario actualizado exitosamente.', usuario });
	} catch (error) {
		return responderError(res, error);
	}
};

export const eliminarUsuario = async (req, res) => {
	try {
		const usuarioId = obtenerId(req.params.id);
		if (!usuarioId) return res.status(400).json({ error: 'El identificador del usuario no es válido.' });

		const usuario = await desactivarUsuarioService(usuarioId, req.user.id);
		return res.status(200).json({ message: 'Usuario desactivado exitosamente.', usuario });
	} catch (error) {
		return responderError(res, error);
	}
};