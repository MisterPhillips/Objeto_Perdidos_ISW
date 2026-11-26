import prisma from '../config/prisma.js';
import { registrarAuditoria } from './auditoria.service.js';

export const obtenerCategorias = async () => {
  return prisma.categoria.findMany({ //findmany es un método de Prisma que devuelve todos los registros de la tabla categoria
    select: { //para mostrar solo los campos que quiero mostrar
      id: true,
      nombre: true,
      descripcion: true,
    },
    where: { activa: true },
    orderBy: { nombre: 'asc' },
  });
};

export const crearCategoria = async ({ nombre, descripcion }, actorId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const categoria = await tx.categoria.create({
        data: { nombre, descripcion },
      });
      await registrarAuditoria(tx, {
        tipoEntidad: 'CATEGORIA',
        entidadId: categoria.id,
        accion: 'CREAR',
        actorId,
      });
      return categoria;
    });
  } catch (error) {
    if (error.code === 'P2002') {//P2002 es el código de error de Prisma para violación de restricción única
      const conflictError = new Error('Ya existe una categoría con ese nombre.');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
};

export const actualizarCategoria = async (categoriaId, datos, actorId) => {
  const categoria = await prisma.categoria.findUnique({ //findunique es un método de Prisma que devuelve un registro de la tabla categoria según el id
    where: { id: categoriaId },
  });

  if (!categoria) {
    const error = new Error('La categoría no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (!categoria.activa && datos.activa !== true) {
    const error = new Error('La categoría no existe o está inactiva.');
    error.statusCode = 404;
    throw error;
  }

  const accion = datos.activa !== undefined && datos.activa !== categoria.activa
    ? (datos.activa ? 'ACTIVAR' : 'DESACTIVAR')
    : 'EDITAR';

  try {
    return await prisma.$transaction(async (tx) => {
      const categoriaActualizada = await tx.categoria.update({
        where: { id: categoriaId },
        data: datos,
      });
      await registrarAuditoria(tx, {
        tipoEntidad: 'CATEGORIA',
        entidadId: categoriaId,
        accion,
        actorId,
      });
      return categoriaActualizada;
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const conflictError = new Error('Ya existe una categoría con ese nombre.');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
};