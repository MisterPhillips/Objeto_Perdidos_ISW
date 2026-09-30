
import {
  registrarObjeto,
  obtenerCatalogo,
  cambiarEstadoObjeto,
} from '../services/objetos.service.js';

export const crearObjeto = async (req, res) => {
  try {
    const { descripcion, categoriaId, puntoRetiroId, objetoPrivado = false } = req.body;

    if (!descripcion || !categoriaId || !puntoRetiroId) {
      return res.status(400).json({
        error: 'Descripción, categoría y punto de retiro son obligatorios.',
      });
    }

    if (typeof objetoPrivado !== 'boolean') {
      return res.status(400).json({ error: 'El campo objetoPrivado debe ser booleano.' });
    }

    const registradoPorId = req.user.id; //verifica que el usuario esté autenticado y obtiene su id del token

    const nuevoObjeto = await registrarObjeto({
      descripcion,
      categoriaId,
      puntoRetiroId,
      objetoPrivado,
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