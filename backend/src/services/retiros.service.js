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
      imagen: true,
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

export const listarRetiros = async ({
  busqueda = '',
  funcionarioId,
  diasDesde,
  pagina = 1,
  limite = 6,
}) => {
  const termino = busqueda.trim();
  const numeroBusqueda = Number(termino);
  const fechaInicio = diasDesde
    ? new Date(Date.now() - diasDesde * 24 * 60 * 60 * 1000)
    : undefined;
  const where = {
    ...(funcionarioId ? { funcionarioId } : {}),
    ...(fechaInicio ? {
      fechaRetiro: {
        gte: fechaInicio,
      },
    } : {}),
    ...(termino ? {
      OR: [
        { nombreRetirante: { contains: termino, mode: 'insensitive' } },
        { rutRetirante: { contains: termino, mode: 'insensitive' } },
        { correoRetirante: { contains: termino, mode: 'insensitive' } },
        { objeto: { descripcion: { contains: termino, mode: 'insensitive' } } },
        { funcionario: { nombre: { contains: termino, mode: 'insensitive' } } },
        ...(Number.isInteger(numeroBusqueda) && numeroBusqueda > 0
          ? [{ objetoId: numeroBusqueda }]
          : []),
      ],
    } : {}),
  };
  const skip = (pagina - 1) * limite;

  const [retiros, total] = await prisma.$transaction([
    prisma.retiro.findMany({
      where,
      include: incluirRetiro,
      orderBy: { fechaRetiro: 'desc' },
      skip,
      take: limite,
    }),
    prisma.retiro.count({ where }),
  ]);

  return {
    retiros,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  };
};

export const listarFuncionariosConRetiros = async () => prisma.usuario.findMany({
  where: { retirosRealizados: { some: {} } },
  select: { id: true, nombre: true },
  orderBy: { nombre: 'asc' },
});