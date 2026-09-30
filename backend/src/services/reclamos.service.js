import prisma from '../config/prisma.js';
//CON SUJETO A CAMBIO
const crearError = (mensaje, statusCode) => {
	const error = new Error(mensaje);
	error.statusCode = statusCode;
	return error;
};

const incluirObjeto = {
	categoria: true,
	puntoRetiro: true,
};

export const crearSolicitudReclamo = async ({ objetoId, usuarioId, detalle }) => {
	const objeto = await prisma.objeto.findUnique({
		where: { id: objetoId },
		select: { id: true, estado: true },
	});

	if (!objeto) throw crearError('El objeto no existe.', 404);
	if (objeto.estado !== 'DISPONIBLE') {
		throw crearError('Solo se pueden reclamar objetos disponibles.', 409);
	}

	const solicitudPendiente = await prisma.solicitudReclamo.findFirst({
		where: { objetoId, usuarioId, estado: 'PENDIENTE' },
	});
	if (solicitudPendiente) {
		throw crearError('Ya tienes una solicitud pendiente para este objeto.', 409);
	}

	return prisma.solicitudReclamo.create({
		data: { objetoId, usuarioId, detalle },
		include: {
			objeto: { include: incluirObjeto },
		},
	});
};

export const listarMisSolicitudes = async (usuarioId) => prisma.solicitudReclamo.findMany({
	where: { usuarioId },
	include: {
		objeto: { include: incluirObjeto },
	},
	orderBy: { createdAt: 'desc' },
});

export const listarSolicitudes = async (estado) => prisma.solicitudReclamo.findMany({
	where: estado ? { estado } : {},
	include: {
		usuario: { select: { id: true, nombre: true, correo: true } },
		objeto: { include: incluirObjeto },
	},
	orderBy: { createdAt: 'asc' },
});

export const actualizarSolicitudReclamo = async (solicitudId, estado) => prisma.$transaction(async (tx) => {
	const solicitud = await tx.solicitudReclamo.findUnique({
		where: { id: solicitudId },
		select: { id: true, objetoId: true, estado: true },
	});

	if (!solicitud) throw crearError('La solicitud no existe.', 404);
	if (solicitud.estado !== 'PENDIENTE') {
		throw crearError('La solicitud ya fue resuelta.', 409);
	}

	if (estado === 'APROBADA') {
		const objetoActualizado = await tx.objeto.updateMany({
			where: { id: solicitud.objetoId, estado: 'DISPONIBLE' },
			data: { estado: 'ENTREGADO' },
		});

		if (objetoActualizado.count !== 1) {
			throw crearError('El objeto ya no está disponible para entrega.', 409);
		}
	}

	const solicitudActualizada = await tx.solicitudReclamo.updateMany({
		where: { id: solicitudId, estado: 'PENDIENTE' },
		data: { estado },
	});
	if (solicitudActualizada.count !== 1) {
		throw crearError('La solicitud ya fue resuelta.', 409);
	}

	if (estado === 'APROBADA') {
		await tx.solicitudReclamo.updateMany({
			where: {
				objetoId: solicitud.objetoId,
				estado: 'PENDIENTE',
				id: { not: solicitudId },
			},
			data: { estado: 'RECHAZADA' },
		});
	}

	return tx.solicitudReclamo.findUnique({
		where: { id: solicitudId },
		include: {
			usuario: { select: { id: true, nombre: true, correo: true } },
			objeto: { include: incluirObjeto },
		},
	});
});