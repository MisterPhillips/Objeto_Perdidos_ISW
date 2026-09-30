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
  nombreRetirante,
  rutRetirante,
  correoRetirante,
  funcionarioId,
}) => prisma.$transaction(async (tx) => {
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
      nombreRetirante,
      rutRetirante,
      correoRetirante,
      objetoId,
      funcionarioId,
    },
    include: incluirRetiro,
  });
});

export const listarRetiros = async () => prisma.retiro.findMany({
  include: incluirRetiro,
  orderBy: { fechaRetiro: 'desc' },
});