import prisma from '../config/prisma.js';

const errorConEstado = (mensaje, statusCode) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

const incluirRetiro = {
  objeto: {
    select: {
      id: true,
      descripcion: true,
      categoria: { select: { nombre: true } },
      puntoRetiro: { select: { nombre: true, facultad: true } },
    },
  },
  funcionario: {
    select: { id: true, nombre: true, correo: true },
  },
};

export const registrarRetiro = async ({
  objetoId,
  rutRetirante,
  funcionarioId,
}) => prisma.$transaction(async (tx) => {
  const usuarioRetirante = await tx.usuario.findUnique({
    where: { rut: rutRetirante },
    select: { id: true, nombre: true, rut: true, correo: true, activo: true },
  });

  if (!usuarioRetirante || !usuarioRetirante.activo) {
    throw errorConEstado('El RUT no corresponde a un usuario universitario activo.', 400);
  }

  const objetoActualizado = await tx.objeto.updateMany({
    where: { id: objetoId, estado: 'DISPONIBLE' },
    data: { estado: 'ENTREGADO' },
  });

  if (objetoActualizado.count !== 1) {
    const objeto = await tx.objeto.findUnique({
      where: { id: objetoId },
      select: { id: true },
    });

    if (!objeto) throw errorConEstado('El objeto indicado no existe.', 404);
    throw errorConEstado('El objeto no está disponible para entrega.', 409);
  }

  return tx.retiro.create({
    data: {
      nombreRetirante: usuarioRetirante.nombre,
      rutRetirante: usuarioRetirante.rut,
      correoRetirante: usuarioRetirante.correo,
      objetoId,
      funcionarioId,
    },
    include: incluirRetiro,
  });
});

export const buscarRetirante = async (rutRetirante) => {
  const usuario = await prisma.usuario.findUnique({
    where: { rut: rutRetirante },
    select: { nombre: true, rut: true, correo: true, activo: true },
  });

  if (!usuario || !usuario.activo) {
    throw errorConEstado('El RUT no corresponde a un usuario universitario activo.', 404);
  }

  return usuario;
};

export const listarRetiros = async () => prisma.retiro.findMany({
  include: incluirRetiro,
  orderBy: { fechaRetiro: 'desc' },
});