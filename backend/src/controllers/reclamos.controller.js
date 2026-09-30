import {
	actualizarSolicitudReclamo as actualizarSolicitudReclamoService,
	crearSolicitudReclamo as crearSolicitudReclamoService,
	listarMisSolicitudes as listarMisSolicitudesService,
	listarSolicitudes as listarSolicitudesService,
} from '../services/reclamos.service.js';

//CON SUJETO A CAMBIO
//solo se puede crear una solicitud de reclamo si el objeto está disponible y no hay otra solicitud pendiente para el mismo objeto por el mismo usuario
const obtenerId = (id) => {
	const valor = Number(id);
	return Number.isInteger(valor) && valor > 0 ? valor : null;
};

const estadosSolicitud = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

const responderError = (res, error) => res.status(error.statusCode || 500).json({
	error: error.message || 'Error interno del servidor.',
});

export const crearSolicitudReclamo = async (req, res) => {
	try {
		const objetoId = obtenerId(req.params.id);
		if (!objetoId) return res.status(400).json({ error: 'El identificador del objeto no es válido.' });

		const detalle = typeof req.body?.detalle === 'string' ? req.body.detalle.trim() : '';
		if (detalle.length < 10 || detalle.length > 500) {
			return res.status(400).json({ error: 'Describe cómo identificas el objeto (entre 10 y 500 caracteres).' });
		}

		const solicitud = await crearSolicitudReclamoService({
			objetoId,
			usuarioId: req.user.id,
			detalle,
		});
		return res.status(201).json({ message: 'Solicitud de reclamo enviada.', solicitud });
	} catch (error) {
		return responderError(res, error);
	}
};

export const listarMisSolicitudes = async (req, res) => {
	try {
		const solicitudes = await listarMisSolicitudesService(req.user.id);
		return res.status(200).json({ solicitudes });
	} catch (error) {
		return responderError(res, error);
	}
};

export const listarSolicitudes = async (req, res) => {
	try {
		const { estado } = req.query;
		if (estado !== undefined && !estadosSolicitud.includes(estado)) {
			return res.status(400).json({ error: 'El estado de la solicitud no es válido.' });
		}

		const solicitudes = await listarSolicitudesService(estado);
		return res.status(200).json({ solicitudes });
	} catch (error) {
		return responderError(res, error);
	}
};

export const actualizarSolicitudReclamo = async (req, res) => {
	try {
		const solicitudId = obtenerId(req.params.id);
		if (!solicitudId) return res.status(400).json({ error: 'El identificador de la solicitud no es válido.' });

		const { estado } = req.body || {};
		if (!['APROBADA', 'RECHAZADA'].includes(estado)) {
			return res.status(400).json({ error: 'La solicitud debe aprobarse o rechazarse.' });
		}

		const solicitud = await actualizarSolicitudReclamoService(solicitudId, estado);
		return res.status(200).json({ message: 'Solicitud actualizada.', solicitud });
	} catch (error) {
		return responderError(res, error);
	}
};