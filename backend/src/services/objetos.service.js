// services/objetos.service.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const estadosObjeto = ['EN_REVISION', 'DISPONIBLE', 'ENTREGADO'];

//////////////////// REGISTRAR OBJETO ////////////////////

export const registrarObjeto = async ({ descripcion, categoriaId, puntoRetiroId, registradoPorId }) => {
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

  const nuevoObjeto = await prisma.objeto.create({
    data: {
      descripcion,
      categoriaId,
      puntoRetiroId,
      registradoPorId,
    },
    include: {
      categoria: true,
      puntoRetiro: true,
    },
  });

  return nuevoObjeto;
};

//////////////////// CATÁLOGO CONSOLIDADO ////////////////////

export const obtenerCatalogo = async (filtros) => {
  const { facultad, categoriaId, estado } = filtros;

  const where = {
    puntoRetiro: {
      habilitado: true,
    },
  };

  if (facultad) {
    where.puntoRetiro.facultad = facultad;
  }

  if (categoriaId) {
    where.categoriaId = Number(categoriaId);
  }

  if (estado) {
    where.estado = estado;
  }

  const objetos = await prisma.objeto.findMany({
    where,
    include: {
      categoria: true,
      puntoRetiro: true,
    },
    orderBy: {
      createdAt: 'desc',
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

//////////////////// ACTUALIZAR DATOS DEL OBJETO ////////////////////

export const actualizarObjeto = async (objetoId, cambios) => {
  const objeto = await prisma.objeto.findUnique({
    where: { id: objetoId },
  });

  if (!objeto) {
    const error = new Error('El objeto indicado no existe.');
    error.statusCode = 404;
    throw error;
  }

  const data = {};

  if (cambios.descripcion !== undefined) {
    if (typeof cambios.descripcion !== 'string' || !cambios.descripcion.trim()) {
      const error = new Error('La descripción no puede estar vacía.');
      error.statusCode = 400;
      throw error;
    }
    data.descripcion = cambios.descripcion.trim();
  }

  if (cambios.categoriaId !== undefined) {
    const categoria = await prisma.categoria.findUnique({
      where: { id: cambios.categoriaId },
    });

    if (!categoria) {
      const error = new Error('La categoría indicada no existe.');
      error.statusCode = 404;
      throw error;
    }
    data.categoriaId = cambios.categoriaId;
  }

  if (cambios.puntoRetiroId !== undefined) {
    const puntoRetiro = await prisma.puntoRetiro.findUnique({
      where: { id: cambios.puntoRetiroId },
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
    data.puntoRetiroId = cambios.puntoRetiroId;
  }

  if (Object.keys(data).length === 0) {
    const error = new Error('Debes indicar al menos un dato válido para actualizar.');
    error.statusCode = 400;
    throw error;
  }

  return prisma.objeto.update({
    where: { id: objetoId },
    data,
    include: {
      categoria: true,
      puntoRetiro: true,
    },
  });
};

//////////////////// ELIMINAR OBJETO ////////////////////

export const eliminarObjeto = async (objetoId) => {
  const objeto = await prisma.objeto.findUnique({
    where: { id: objetoId },
  });

  if (!objeto) {
    const error = new Error('El objeto indicado no existe.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.objeto.delete({
    where: { id: objetoId },
  });
};