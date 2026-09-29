import {
	actualizarPuntoRetiro as actualizarPuntoRetiroService,
	crearPuntoRetiro as crearPuntoRetiroService,
	eliminarPuntoRetiro as eliminarPuntoRetiroService,
	listarPuntosRetiro as listarPuntosRetiroService,
	obtenerPuntoRetiro as obtenerPuntoRetiroService,
} from '../services/puntoretiro.service.js';

const obtenerIdPuntoRetiro = (id) => {
	const puntoRetiroId = Number(id);
	return Number.isInteger(puntoRetiroId) && puntoRetiroId > 0 ? puntoRetiroId : null;
};

export const listarPuntosRetiro = async (req, res) => {
	try {
		const { habilitado } = req.query;
		if (habilitado !== undefined && habilitado !== 'true' && habilitado !== 'false') {
			return res.status(400).json({ error: 'El filtro habilitado debe ser true o false.' });
		}

		const puntosRetiro = await listarPuntosRetiroService(
			habilitado === undefined ? undefined : habilitado === 'true'
		);
		return res.status(200).json({
			message: 'Puntos de retiro obtenidos exitosamente.',
			puntosRetiro,
		});
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};

export const obtenerPuntoRetiro = async (req, res) => {
	try {
		const puntoRetiroId = obtenerIdPuntoRetiro(req.params.id);
		if (!puntoRetiroId) {
			return res.status(400).json({ error: 'El identificador del punto de retiro no es válido.' });
		}

		const puntoRetiro = await obtenerPuntoRetiroService(puntoRetiroId);
		return res.status(200).json({ puntoRetiro });
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};

export const crearPuntoRetiro = async (req, res) => {
	try {
		const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';
		const facultad = typeof req.body?.facultad === 'string' ? req.body.facultad.trim() : '';
		const ubicacion = req.body?.ubicacion;

		if (!nombre || !facultad) {
			return res.status(400).json({ error: 'El nombre y la facultad son obligatorios.' });
		}
		if (nombre.length > 100 || facultad.length > 100) {
			return res.status(400).json({ error: 'El nombre y la facultad no pueden superar los 100 caracteres.' });
		}
		if (ubicacion !== undefined && ubicacion !== null && typeof ubicacion !== 'string') {
			return res.status(400).json({ error: 'La ubicación debe ser texto.' });
		}
		if (typeof ubicacion === 'string' && ubicacion.trim().length > 150) {
			return res.status(400).json({ error: 'La ubicación no puede superar los 150 caracteres.' });
		}

		const puntoRetiro = await crearPuntoRetiroService({
			nombre,
			facultad,
			ubicacion: typeof ubicacion === 'string' ? ubicacion.trim() || null : ubicacion,
		});
		return res.status(201).json({
			message: 'Punto de retiro creado exitosamente.',
			puntoRetiro,
		});
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};

export const actualizarPuntoRetiro = async (req, res) => {
	try {
		const puntoRetiroId = obtenerIdPuntoRetiro(req.params.id);
		if (!puntoRetiroId) {
			return res.status(400).json({ error: 'El identificador del punto de retiro no es válido.' });
		}

		const datos = {};
		for (const campo of ['nombre', 'facultad']) {
			if (req.body?.[campo] !== undefined) {
				if (typeof req.body[campo] !== 'string' || !req.body[campo].trim()) {
					return res.status(400).json({ error: `El campo ${campo} debe ser texto y no puede estar vacío.` });
				}
				datos[campo] = req.body[campo].trim();
				if (datos[campo].length > 100) {
					return res.status(400).json({ error: `El campo ${campo} no puede superar los 100 caracteres.` });
				}
			}
		}

		if (req.body?.ubicacion !== undefined) {
			const { ubicacion } = req.body;
			if (ubicacion !== null && typeof ubicacion !== 'string') {
				return res.status(400).json({ error: 'La ubicación debe ser texto.' });
			}
			if (typeof ubicacion === 'string' && ubicacion.trim().length > 150) {
				return res.status(400).json({ error: 'La ubicación no puede superar los 150 caracteres.' });
			}
			datos.ubicacion = typeof ubicacion === 'string' ? ubicacion.trim() || null : null;
		}

		if (req.body?.habilitado !== undefined) {
			if (typeof req.body.habilitado !== 'boolean') {
				return res.status(400).json({ error: 'El campo habilitado debe ser booleano.' });
			}
			datos.habilitado = req.body.habilitado;
		}

		if (Object.keys(datos).length === 0) {
			return res.status(400).json({ error: 'Indica al menos un campo para actualizar.' });
		}

		const puntoRetiro = await actualizarPuntoRetiroService(puntoRetiroId, datos);
		return res.status(200).json({
			message: 'Punto de retiro actualizado exitosamente.',
			puntoRetiro,
		});
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};

export const eliminarPuntoRetiro = async (req, res) => {
	try {
		const puntoRetiroId = obtenerIdPuntoRetiro(req.params.id);
		if (!puntoRetiroId) {
			return res.status(400).json({ error: 'El identificador del punto de retiro no es válido.' });
		}

		const puntoRetiro = await eliminarPuntoRetiroService(puntoRetiroId);
		return res.status(200).json({
			message: 'Punto de retiro deshabilitado exitosamente.',
			puntoRetiro,
		});
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};
