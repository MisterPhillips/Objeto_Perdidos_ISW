import prisma from '../config/prisma.js';

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

export const crearCategoria = async ({ nombre, descripcion }) => {
  try {
    return await prisma.categoria.create({
      data: { nombre, descripcion },
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

export const actualizarCategoria = async (categoriaId, datos) => {
  const categoria = await prisma.categoria.findUnique({ //findunique es un método de Prisma que devuelve un registro de la tabla categoria según el id
    where: { id: categoriaId },
  });

  if (!categoria || !categoria.activa) {
    const error = new Error('La categoría no existe o está inactiva.');
    error.statusCode = 404;
    throw error;
  }

  try {
    return await prisma.categoria.update({
      where: { id: categoriaId },
      data: datos,
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

export const eliminarCategoria = async (categoriaId) => {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
  });

  if (!categoria || !categoria.activa) {
    const error = new Error('La categoría no existe o ya está inactiva.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.categoria.update({
    where: { id: categoriaId },
    data: { activa: false }, //es false porque se quiere desactivar la categoría, no eliminarla físicamente de la base de datos
  });
};