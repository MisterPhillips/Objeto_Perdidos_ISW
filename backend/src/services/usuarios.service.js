import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

const rolesPermitidos = ['FUNCIONARIO', 'ESTUDIANTE', 'ADMIN'];

const crearError = (mensaje, statusCode) => {
	const error = new Error(mensaje);
	error.statusCode = statusCode;
	return error;
};

const seleccionarUsuarioPublico = {
	id: true,
	nombre: true,
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

export const crearUsuario = async ({ nombre, correo, contrasena, rol }) => {
	const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

	try {
		return await prisma.usuario.create({
			data: {
				nombre,
				correo: correo.toLowerCase(),
				contrasena: contrasenaHasheada,
				rol,
			},
			select: seleccionarUsuarioPublico,
		});
	} catch (error) {
		if (error.code === 'P2002') {
			throw crearError('Ya existe un usuario con ese correo.', 409);
		}
		throw error;
	}
};

export const actualizarUsuario = async (usuarioId, datos) => {
	const existente = await prisma.usuario.findUnique({ where: { id: usuarioId } });
	if (!existente) throw crearError('El usuario no existe.', 404);

	const dejaraDeSerAdminActivo = existente.rol === 'ADMIN'
		&& existente.activo
		&& (datos.rol !== undefined && datos.rol !== 'ADMIN'
			|| datos.activo === false);

	if (dejaraDeSerAdminActivo) await comprobarUltimoAdmin(usuarioId);

	const datosActualizados = { ...datos };
	if (datosActualizados.correo) datosActualizados.correo = datosActualizados.correo.toLowerCase();
	if (datosActualizados.contrasena) {
		datosActualizados.contrasena = await bcrypt.hash(datosActualizados.contrasena, 10);
	}

	try {
		return await prisma.usuario.update({
			where: { id: usuarioId },
			data: datosActualizados,
			select: seleccionarUsuarioPublico,
		});
	} catch (error) {
		if (error.code === 'P2002') {
			throw crearError('Ya existe un usuario con ese correo.', 409);
		}
		throw error;
	}
};

export const desactivarUsuario = async (usuarioId, administradorId) => {
	if (usuarioId === administradorId) {
		throw crearError('No puedes desactivar tu propia cuenta.', 400);
	}

	const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
	if (!usuario) throw crearError('El usuario no existe.', 404);
	if (usuario.activo && usuario.rol === 'ADMIN') await comprobarUltimoAdmin(usuarioId);

	return prisma.usuario.update({
		where: { id: usuarioId },
		data: { activo: false },
		select: seleccionarUsuarioPublico,
	});
};

export { rolesPermitidos };