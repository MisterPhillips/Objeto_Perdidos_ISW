
import {
  actualizarObjeto as actualizarObjetoService,
  eliminarObjeto as eliminarObjetoService,
  entregarObjeto as entregarObjetoService,
  registrarObjeto,
  obtenerCatalogo,
  obtenerObjetosGestion,
  cambiarEstadoObjeto,
} from '../services/objetos.service.js';

const obtenerId = (id) => {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
};

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

export const listarObjetosGestion = async (_req, res) => {
  try {
    const objetos = await obtenerObjetosGestion();
    return res.status(200).json({ objetos });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export const actualizarObjeto = async (req, res) => {
  try {
    const objetoId = obtenerId(req.params.id);
    if (!objetoId) return res.status(400).json({ error: 'El identificador del objeto no es válido.' });

    const datos = {};
    if (req.body?.descripcion !== undefined) {
      if (typeof req.body.descripcion !== 'string' || !req.body.descripcion.trim() || req.body.descripcion.trim().length > 150) {
        return res.status(400).json({ error: 'La descripción debe contener entre 1 y 150 caracteres.' });
      }
      datos.descripcion = req.body.descripcion.trim();
    }
    for (const campo of ['categoriaId', 'puntoRetiroId']) {
      if (req.body?.[campo] !== undefined) {
        const valor = Number(req.body[campo]);
        if (!Number.isInteger(valor) || valor <= 0) {
          return res.status(400).json({ error: `El campo ${campo} no es válido.` });
        }
        datos[campo] = valor;
      }
    }
    if (req.body?.objetoPrivado !== undefined) {
      if (typeof req.body.objetoPrivado !== 'boolean') {
        return res.status(400).json({ error: 'El campo objetoPrivado debe ser booleano.' });
      }
      datos.objetoPrivado = req.body.objetoPrivado;
    }
    if (Object.keys(datos).length === 0) {
      return res.status(400).json({ error: 'Indica al menos un campo para actualizar.' });
    }

    const objeto = await actualizarObjetoService(objetoId, datos);
    return res.status(200).json({ message: 'Objeto actualizado exitosamente.', objeto });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export const eliminarObjeto = async (req, res) => {
  try {
    const objetoId = obtenerId(req.params.id);
    if (!objetoId) return res.status(400).json({ error: 'El identificador del objeto no es válido.' });
    await eliminarObjetoService(objetoId);
    return res.status(200).json({ message: 'Objeto eliminado exitosamente.' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export const entregarObjeto = async (req, res) => {
  try {
    const objetoId = obtenerId(req.params.id);
    if (!objetoId) return res.status(400).json({ error: 'El identificador del objeto no es válido.' });

    const datosRetiro = {};
    for (const campo of ['nombreRetirante', 'rutRetirante', 'correoRetirante']) {
      const valor = typeof req.body?.[campo] === 'string' ? req.body[campo].trim() : '';
      const maximo = campo === 'correoRetirante' ? 150 : campo === 'rutRetirante' ? 20 : 100;
      if (!valor || valor.length > maximo) {
        return res.status(400).json({ error: `El campo ${campo} es obligatorio y tiene un límite de longitud.` });
      }
      datosRetiro[campo] = valor;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosRetiro.correoRetirante)) {
      return res.status(400).json({ error: 'El correo del retirante no es válido.' });
    }

    const objeto = await entregarObjetoService(objetoId, datosRetiro, req.user.id);
    return res.status(200).json({ message: 'Objeto entregado exitosamente.', objeto });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
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