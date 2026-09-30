import prisma from '../config/prisma.js';

const buscarPuntoRetiro = async (puntoRetiroId) => {
	const puntoRetiro = await prisma.puntoRetiro.findUnique({
		where: { id: puntoRetiroId },
	});

	if (!puntoRetiro) {
		const error = new Error('El punto de retiro no existe.');
		error.statusCode = 404;
		throw error;
	}

	return puntoRetiro;
};

export const listarPuntosRetiro = async (habilitado) => {
	return prisma.puntoRetiro.findMany({
		where: habilitado === undefined ? {} : { habilitado }, //si se pasa un valor para habilitado, se filtran los puntos de retiro por ese valor; si no se pasa ningún valor, se devuelven todos los puntos de retiro
		orderBy: [{ facultad: 'asc' }, { nombre: 'asc' }],
	});
};

export const obtenerPuntoRetiro = async (puntoRetiroId) => {
	return buscarPuntoRetiro(puntoRetiroId);
};

export const crearPuntoRetiro = async ({ nombre, facultad, ubicacion }) => {
	try {
		return await prisma.puntoRetiro.create({
			data: { nombre, facultad, ubicacion },
		});
	} catch (error) {
		if (error.code === 'P2002') {
			const conflictError = new Error('Ya existe un punto de retiro con ese nombre.');
			conflictError.statusCode = 409;
			throw conflictError;
		}
		throw error;
	}
};

export const actualizarPuntoRetiro = async (puntoRetiroId, datos) => {
	await buscarPuntoRetiro(puntoRetiroId);
	try {
		return await prisma.puntoRetiro.update({
			where: { id: puntoRetiroId },
			data: datos,
		});
	} catch (error) {
		if (error.code === 'P2002') {
			const conflictError = new Error('Ya existe un punto de retiro con ese nombre.');
			conflictError.statusCode = 409;
			throw conflictError;
		}
		throw error;
	}
};

export const eliminarPuntoRetiro = async (puntoRetiroId) => {
	await buscarPuntoRetiro(puntoRetiroId);
	return prisma.puntoRetiro.update({
		where: { id: puntoRetiroId },
		data: { habilitado: false }, //cual es la difrencia entre false y trues es que false significa que el punto de retiro está deshabilitado y true significa que está habilitado
	});
};

export const listarPuntosRetiroConCantidadObjetos = async () => {
	return prisma.puntoRetiro.findMany({
		include: { _count: { select: { objetos: true } } },
		orderBy: [{ facultad: 'asc' }, { nombre: 'asc' }],
	});
};

export const listarPuntosRetiroParaMapa = async () => {
	return prisma.puntoRetiro.findMany({
		include: {
			objetos: {
				where: { objetoPrivado: false },
				orderBy: { createdAt: 'desc' },
				take: 5,
				include: { categoria: { select: { nombre: true } } },
			},
		},
		orderBy: [{ facultad: 'asc' }, { nombre: 'asc' }],
	});
};

export const obtenerPuntoRetiroConObjetos = async (puntoRetiroId) => {
	const puntoRetiro = await prisma.puntoRetiro.findUnique({
		where: { id: puntoRetiroId },
		include: {
			objetos: {
				where: { objetoPrivado: false },
				orderBy: { createdAt: 'desc' },
				include: { categoria: { select: { nombre: true } } },
			},
		},
	});

	if (!puntoRetiro) {
		const error = new Error('El punto de retiro no existe.');
		error.statusCode = 404;
		throw error;
	}

	return puntoRetiro;
};