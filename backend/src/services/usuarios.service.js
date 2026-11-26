import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { registrarAuditoria } from './auditoria.service.js';

const crearError = (mensaje, statusCode) => {
	const error = new Error(mensaje);
	error.statusCode = statusCode;
	return error;
};

const seleccionarUsuarioPublico = {
	id: true,
	nombre: true,
	rut: true,
	correo: true,
	rol: true,
	activo: true,
	createdAt: true,
	updatedAt: true,
};

const comprobarUltimoAdmin = async (usuarioId) => {
	const administradoresActivos = await prisma.usuario.count({
		where: { rol: 'ADMIN', activo: true },
	});

	if (administradoresActivos <= 1) {
		const usuario = await prisma.usuario.findUnique({
			where: { id: usuarioId },
			select: { rol: true, activo: true },
		});

		if (usuario?.rol === 'ADMIN' && usuario.activo) { // usuario?.rol es si existe el usuario y tiene rol de ADMIN y está activo, entonces se lanza el error
			throw crearError('No se puede desactivar o quitar el rol al último administrador activo.', 409);
		}
	}
};

export const listarUsuarios = async () => prisma.usuario.findMany({
	select: seleccionarUsuarioPublico,
	orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
});

export const crearUsuario = async ({ nombre, rut, correo, contrasena, rol }, actorId) => {
	const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

	try {
		return await prisma.$transaction(async (tx) => {
			const usuario = await tx.usuario.create({
				data: {
					nombre,
					rut,
					correo: correo.toLowerCase(),
					contrasena: contrasenaHasheada,
					rol,
				},
				select: seleccionarUsuarioPublico,
			});
			await registrarAuditoria(tx, {
				tipoEntidad: 'USUARIO',
				entidadId: usuario.id,
				accion: 'CREAR',
				actorId,
			});
			return usuario;
		});
	} catch (error) {
		if (error.code === 'P2002') {
			if (String(error.meta?.target).includes('rut')) {
				throw crearError('Ya existe un usuario con ese RUT.', 409);
			}
			throw crearError('Ya existe un usuario con ese correo.', 409);
		}
		throw error;
	}
};

export const actualizarUsuario = async (usuarioId, datos, actorId) => {
	const existente = await prisma.usuario.findUnique({ where: { id: usuarioId } });
	if (!existente) throw crearError('El usuario no existe.', 404);
	if (datos.activo === false && usuarioId === actorId) {
		throw crearError('No puedes desactivar tu propia cuenta.', 400);
	}

	const dejaraDeSerAdminActivo = existente.rol === 'ADMIN'&& existente.activo
		&& (datos.rol !== undefined && datos.rol !== 'ADMIN'
			|| datos.activo === false);

	if (dejaraDeSerAdminActivo) await comprobarUltimoAdmin(usuarioId);

	const datosActualizados = { ...datos };
	if (datosActualizados.correo) datosActualizados.correo = datosActualizados.correo.toLowerCase();
	if (datosActualizados.contrasena) {
		datosActualizados.contrasena = await bcrypt.hash(datosActualizados.contrasena, 10);
	}
	let accion = 'EDITAR';
	if (datos.activo !== undefined && datos.activo !== existente.activo) {
		accion = datos.activo ? 'ACTIVAR' : 'DESACTIVAR';
	}

	try {
		return await prisma.$transaction(async (tx) => {
			const usuario = await tx.usuario.update({
				where: { id: usuarioId },
				data: datosActualizados,
				select: seleccionarUsuarioPublico,
			});
			await registrarAuditoria(tx, {
				tipoEntidad: 'USUARIO',
				entidadId: usuario.id,
				accion,
				actorId,
			});
			return usuario;
		});
	} catch (error) {
		if (error.code === 'P2002') {
			if (String(error.meta?.target).includes('rut')) {
				throw crearError('Ya existe un usuario con ese RUT.', 409);
			}
			throw crearError('Ya existe un usuario con ese correo.', 409);
		}
		throw error;
	}
};