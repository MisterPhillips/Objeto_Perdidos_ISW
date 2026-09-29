import prisma from '../config/prisma.js';

export const obtenerCategorias = async () => {
  return prisma.categoria.findMany({
    select: { //para mostrar solo los campos que quiero mostrar
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
    if (error.code === 'P2002') {
      const conflictError = new Error('Ya existe una categoría con ese nombre.');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
};

export const actualizarCategoria = async (categoriaId, datos) => {
  const categoria = await prisma.categoria.findUnique({
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
    data: { activa: false },
  });
};