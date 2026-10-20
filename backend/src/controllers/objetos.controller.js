
import {
  actualizarObjeto as actualizarObjetoService,
  eliminarObjeto as eliminarObjetoService,
  entregarObjeto as entregarObjetoService,
  registrarObjeto,
  obtenerCatalogo,
  obtenerObjetosGestion,
  cambiarEstadoObjeto,
} from '../services/objetos.service.js';
import {
  actualizarEstadoObjetoSchema,
  actualizarObjetoParamsSchema,
  actualizarObjetoSchema,
  crearObjetoSchema,
  eliminarObjetoParamsSchema,
  entregarObjetoParamsSchema,
  entregarObjetoSchema,
  usuarioObjetoIdSchema,
} from '../schemas/objetos.schema.js';

const validar = (schema, datos, res, estado = 400) => {
  const resultado = schema.safeParse(datos);
  if (!resultado.success) {
    res.status(estado).json({ error: resultado.error.issues[0].message });
    return null;
  }
  return resultado.data;
};

export const crearObjeto = async (req, res) => {
  try {
    const datos = validar(crearObjetoSchema, req.body, res);
    if (!datos) return;
    const { descripcion, categoriaId, puntoRetiroId, objetoPrivado } = datos;
    const registradoPorId = validar(usuarioObjetoIdSchema, req.user?.id, res, 401);
    if (!registradoPorId) return;

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
    const parametros = validar(actualizarObjetoParamsSchema, req.params, res);
    if (!parametros) return;
    const datos = validar(actualizarObjetoSchema, req.body || {}, res);
    if (!datos) return;

    const objeto = await actualizarObjetoService(parametros.id, datos);
    return res.status(200).json({ message: 'Objeto actualizado exitosamente.', objeto });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export const eliminarObjeto = async (req, res) => {
  try {
    const parametros = validar(eliminarObjetoParamsSchema, req.params, res);
    if (!parametros) return;
    await eliminarObjetoService(parametros.id);
    return res.status(200).json({ message: 'Objeto eliminado exitosamente.' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export const entregarObjeto = async (req, res) => {
  try {
    const parametros = validar(entregarObjetoParamsSchema, req.params, res);
    if (!parametros) return;
    const datosRetiro = validar(entregarObjetoSchema, req.body || {}, res);
    if (!datosRetiro) return;

    const objeto = await entregarObjetoService(parametros.id, datosRetiro, req.user.id);
    return res.status(200).json({ message: 'Objeto entregado exitosamente.', objeto });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export const actualizarEstadoObjeto = async (req, res) => {
  try {
    const datos = validar(actualizarEstadoObjetoSchema, { ...req.body, id: req.params.id }, res);
    if (!datos) return;

    const objetoActualizado = await cambiarEstadoObjeto(datos.id, datos.estado);

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