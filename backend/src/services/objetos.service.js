import prisma from '../config/prisma.js';
import { eliminarImagen, guardarImagen } from './imagenes.service.js';

//////////////////// REGISTRAR OBJETO ////////////////////

export const registrarObjeto = async ({ descripcion, categoriaId, puntoRetiroId, objetoPrivado = false, registradoPorId, archivoImagen }) => {
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

  const imagen = archivoImagen ? await guardarImagen(archivoImagen) : null;
  try {
    return await prisma.objeto.create({
      data: {
        descripcion,
        imagen,
        estado: 'DISPONIBLE',
        categoriaId,
        puntoRetiroId,
        objetoPrivado,
        registradoPorId,
      },
      include: {
        categoria: true,
        puntoRetiro: true,
      },
    });
  } catch (error) {
    if (imagen) {
      try {
        await eliminarImagen(imagen);
      } catch (errorLimpieza) {
        console.error('No se pudo limpiar la imagen de un objeto que no se registró.', errorLimpieza);
      }
    }
    throw error;
  }
};

export const registrarDocumento = async ({
  nombrePropietario,
  rutPropietario,
  descripcion,
  puntoRetiroId,
  registradoPorId,
}) => {
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
    where: { nombre: 'Documento personal' },
  });

  if (!categoria?.activa) {
    const error = new Error('Debe existir una categoría activa llamada "Documento personal".');
    error.statusCode = 400;
    throw error;
  }

  return prisma.objeto.create({
    data: {
      descripcion,
      nombrePropietario,
      rutPropietario: rutPropietario || null,
      estado: 'DISPONIBLE',
      objetoPrivado: false,
      categoriaId: categoria.id,
      puntoRetiroId,
      registradoPorId,
    },
    include: {
      categoria: true,
      puntoRetiro: true,
    },
  });
};

//////////////////// CATÁLOGO CONSOLIDADO ////////////////////

export const obtenerCatalogo = async (filtros) => {
  const { facultad, categoriaId } = filtros;

  const where = {
    estado: {
      in: ['DISPONIBLE'],
    },
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

export const obtenerObjetosGestion = async () => prisma.objeto.findMany({
  include: {
    categoria: true,
    puntoRetiro: true,
  },
  orderBy: { createdAt: 'desc' },
});

export const actualizarObjeto = async (objetoId, datos) => {
  const objeto = await prisma.objeto.findUnique({ where: { id: objetoId } });
  if (!objeto) {
    const error = new Error('El objeto indicado no existe.');
    error.statusCode = 404;
    throw error;
  }
  if (objeto.estado === 'ENTREGADO') {
    const error = new Error('No se puede editar un objeto que ya fue entregado.');
    error.statusCode = 409;
    throw error;
  }

  if (datos.categoriaId !== undefined) {
    const categoria = await prisma.categoria.findUnique({ where: { id: datos.categoriaId } });
    if (!categoria || !categoria.activa) {
      const error = new Error('La categoría indicada no existe o está inactiva.');
      error.statusCode = 400;
      throw error;
    }
  }
  if (datos.puntoRetiroId !== undefined) {
    const puntoRetiro = await prisma.puntoRetiro.findUnique({ where: { id: datos.puntoRetiroId } });
    if (!puntoRetiro || !puntoRetiro.habilitado) {
      const error = new Error('El punto de retiro indicado no existe o está deshabilitado.');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.objeto.update({
    where: { id: objetoId },
    data: datos,
    include: { categoria: true, puntoRetiro: true },
  });
};

export const actualizarImagenObjeto = async (objetoId, datos, archivoImagen) => {
  const objeto = await prisma.objeto.findUnique({ where: { id: objetoId } });
  if (!objeto) {
    const error = new Error('El objeto indicado no existe.');
    error.statusCode = 404;
    throw error;
  }
  if (objeto.estado === 'ENTREGADO') {
    const error = new Error('No se puede editar un objeto que ya fue entregado.');
    error.statusCode = 409;
    throw error;
  }

  const imagenNueva = await guardarImagen(archivoImagen);
  let objetoActualizado;
  try {
    objetoActualizado = await actualizarObjeto(objetoId, { ...datos, imagen: imagenNueva });
  } catch (error) {
    try {
      await eliminarImagen(imagenNueva);
    } catch (errorLimpieza) {
      console.error('No se pudo limpiar una imagen cuyo cambio no se guardó.', errorLimpieza);
    }
    throw error;
  }

  if (objeto.imagen) {
    try {
      await eliminarImagen(objeto.imagen);
    } catch (errorLimpieza) {
      console.error('No se pudo eliminar la imagen anterior del objeto.', errorLimpieza);
    }
  }
  return objetoActualizado;
};

export const eliminarObjeto = async (objetoId) => {
  const objeto = await prisma.objeto.findUnique({
    where: { id: objetoId },
  });
  if (!objeto) {
    const error = new Error('El objeto indicado no existe.');
    error.statusCode = 404;
    throw error;
  }
  const eliminado = await prisma.objeto.delete({ where: { id: objetoId } });
  if (objeto.imagen) {
    try {
      await eliminarImagen(objeto.imagen);
    } catch (errorLimpieza) {
      console.error('No se pudo eliminar la imagen de un objeto eliminado.', errorLimpieza);
    }
  }
  return eliminado;
};

export const entregarObjeto = async (objetoId, datosRetiro, funcionarioId) => prisma.$transaction(async (tx) => {
  const objeto = await tx.objeto.findUnique({ where: { id: objetoId }, select: { id: true, estado: true } });
  if (!objeto) {
    const error = new Error('El objeto indicado no existe.');
    error.statusCode = 404;
    throw error;
  }
  if (objeto.estado !== 'DISPONIBLE') {
    const error = new Error('Solo se pueden entregar objetos disponibles.');
    error.statusCode = 409;
    throw error;
  }

  const actualizacion = await tx.objeto.updateMany({
    where: { id: objetoId, estado: 'DISPONIBLE' },
    data: { estado: 'ENTREGADO' },
  });
  if (actualizacion.count !== 1) {
    const error = new Error('El objeto ya no está disponible para entrega.');
    error.statusCode = 409;
    throw error;
  }

  await tx.retiro.create({ data: { ...datosRetiro, objetoId, funcionarioId } });
  return tx.objeto.findUnique({
    where: { id: objetoId },
    include: { categoria: true, puntoRetiro: true },
  });
});
