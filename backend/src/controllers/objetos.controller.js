
import {
  registrarObjeto,
  obtenerCatalogo,
  cambiarEstadoObjeto,
  actualizarObjeto,
  eliminarObjeto,
} from '../services/objetos.service.js';

export const crearObjeto = async (req, res) => {
  try {
    const { descripcion, categoriaId, puntoRetiroId } = req.body;

    if (!descripcion || !categoriaId || !puntoRetiroId) {
      return res.status(400).json({
        error: 'Descripción, categoría y punto de retiro son obligatorios.',
      });
    }

    const registradoPorId = req.user.id;

    const nuevoObjeto = await registrarObjeto({
      descripcion,
      categoriaId,
      puntoRetiroId,
      registradoPorId,
    });

    return res.status(201).json({
      message: 'Objeto registrado exitosamente.',
      objeto: nuevoObjeto,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};

//////////////////// CATÁLOGO ////////////////////

export const listarObjetos = async (req, res) => {
  try {
    const objetos = await obtenerCatalogo(req.query);

    return res.status(200).json({
      message: 'Catálogo obtenido exitosamente.',
      objetos,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};

export const actualizarEstadoObjeto = async (req, res) => {
  try {
    const objetoId = Number(req.params.id);
    const { estado } = req.body;

    if (!Number.isInteger(objetoId) || objetoId <= 0) {
      return res.status(400).json({ error: 'El identificador del objeto no es válido.' });
    }

    if (!estado) {
      return res.status(400).json({ error: 'El estado es obligatorio.' });
    }

    const objetoActualizado = await cambiarEstadoObjeto(objetoId, estado);

    return res.status(200).json({
      message: 'Estado del objeto actualizado exitosamente.',
      objeto: objetoActualizado,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};

export const editarObjeto = async (req, res) => {
  try {
    const objetoId = Number(req.params.id);

    if (!Number.isInteger(objetoId) || objetoId <= 0) {
      return res.status(400).json({ error: 'El identificador del objeto no es válido.' });
    }

    const { descripcion, categoriaId, puntoRetiroId } = req.body;
    const cambios = {};

    if (descripcion !== undefined) cambios.descripcion = descripcion;

    if (categoriaId !== undefined) {
      const id = Number(categoriaId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El identificador de la categoría no es válido.' });
      }
      cambios.categoriaId = id;
    }

    if (puntoRetiroId !== undefined) {
      const id = Number(puntoRetiroId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'El identificador del punto de retiro no es válido.' });
      }
      cambios.puntoRetiroId = id;
    }

    const objetoActualizado = await actualizarObjeto(objetoId, cambios);

    return res.status(200).json({
      message: 'Objeto actualizado exitosamente.',
      objeto: objetoActualizado,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};

export const borrarObjeto = async (req, res) => {
  try {
    const objetoId = Number(req.params.id);

    if (!Number.isInteger(objetoId) || objetoId <= 0) {
      return res.status(400).json({ error: 'El identificador del objeto no es válido.' });
    }

    await eliminarObjeto(objetoId);

    return res.status(200).json({ message: 'Objeto eliminado exitosamente.' });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};