import prisma from '../config/prisma.js';
const estadosObjeto = ['EN_REVISION', 'DISPONIBLE', 'ENTREGADO'];

//////////////////// REGISTRAR OBJETO ////////////////////

export const registrarObjeto = async ({ descripcion, categoriaId, puntoRetiroId, objetoPrivado = false, registradoPorId }) => {
  const puntoRetiro = await prisma.puntoRetiro.findUnique({
    where: { id: puntoRetiroId },
  });

  if (!puntoRetiro) {
    const error = new Error('El punto de retiro indicado no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (!puntoRetiro.habilitado) {
    const error = new Error('El punto de retiro indicado no está habilitado.');
    error.statusCode = 400;
    throw error;
  }

  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
  });

  if (!categoria) {
    const error = new Error('La categoría indicada no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (!categoria.activa) {
    const error = new Error('La categoría indicada está inactiva.');
    error.statusCode = 400;
    throw error;
  }

  const nuevoObjeto = await prisma.objeto.create({
    data: {
      descripcion,
      categoriaId,
      puntoRetiroId,
      objetoPrivado,
      registradoPorId,
    },
    include: {
      categoria: true, //estos include permiten que al crear un objeto, se devuelvan también los datos de la categoría y del punto de retiro asociados a ese objeto
      puntoRetiro: true,
    },
  });

  return nuevoObjeto;
};

//////////////////// CATÁLOGO CONSOLIDADO ////////////////////

export const obtenerCatalogo = async (filtros) => {
  const { facultad, categoriaId } = filtros;

  const where = {
    estado: 'DISPONIBLE', //solo se muestran los objetos disponibles en el catálogo
    objetoPrivado: false,
    puntoRetiro: {
      habilitado: true, //solo se muestran los objetos de puntos de retiro habilitados
    },
    categoria: {
      activa: true,//solo se muestran los objetos de categorías activas
    },
  };

  if (facultad) {
    where.puntoRetiro.facultad = facultad; //si se indica la facultad en los filtros, se agregará a la condición where para filtrar los objetos por la facultad del punto de retiro
  }

  if (categoriaId) {
    where.categoriaId = Number(categoriaId);//si se indica la categoría en los filtros, se agregará a la condición where para filtrar los objetos por la categoría
  }

  const objetos = await prisma.objeto.findMany({
    where,
    include: {
      categoria: true,
      puntoRetiro: true,
    },
    orderBy: {
      createdAt: 'desc', //los objetos se ordenan por fecha de creación, de más reciente a más antiguo
    },
  });

  return objetos;
};

//////////////////// ACTUALIZAR ESTADO ////////////////////

export const cambiarEstadoObjeto = async (objetoId, estado) => {
  if (!estadosObjeto.includes(estado)) {
    const error = new Error('El estado indicado no es válido.');
    error.statusCode = 400;
    throw error;
  }

  if (estado === 'ENTREGADO') {
    const error = new Error('La entrega debe registrarse desde el módulo de entregas.');
    error.statusCode = 400;
    throw error;
  }

  const objeto = await prisma.objeto.findUnique({
    where: { id: objetoId },
  });

  if (!objeto) {
    const error = new Error('El objeto indicado no existe.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.objeto.update({
    where: { id: objetoId },
    data: { estado },
    include: {
      categoria: true,
      puntoRetiro: true,
    },
  });
};