
import {
  actualizarObjeto as actualizarObjetoService,
  actualizarImagenObjeto as actualizarImagenObjetoService,
  eliminarObjeto as eliminarObjetoService,
  entregarObjeto as entregarObjetoService,
  actualizarDocumento as actualizarDocumentoService,
  registrarObjeto,
  registrarDocumento,
  obtenerCatalogo,
  obtenerObjetosGestion,
} from '../services/objetos.service.js';
import {
  actualizarObjetoParamsSchema,
  actualizarObjetoSchema,
  actualizarDocumentoSchema,
  crearObjetoSchema,
  eliminarObjetoParamsSchema,
  entregarObjetoParamsSchema,
  entregarObjetoSchema,
  usuarioObjetoIdSchema,
  crearDocumentoSchema,
} from '../schemas/objetos.schema.js';
import { leerImagen } from '../services/imagenes.service.js';
import { notificarDocumentoRegistrado } from '../services/notificaciones.service.js';
import prisma from '../config/prisma.js';

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
      archivoImagen: req.file,
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

export const crearDocumento = async (req, res) => {
  try {
    const datos = validar(crearDocumentoSchema, req.body, res);
    if (!datos) return;

    const registradoPorId = validar(usuarioObjetoIdSchema, req.user?.id, res, 401);
    if (!registradoPorId) return;

    const objeto = await registrarDocumento({ ...datos, registradoPorId });
    let correo;

    try {
      correo = await notificarDocumentoRegistrado({
        rutPropietario: datos.rutPropietario,
        facultad: objeto.puntoRetiro.facultad,
      });
    } catch (error) {
      console.error('No se pudo enviar el aviso del documento registrado.', error.message);
      correo = { enviado: false, motivo: 'error_envio' };
    }

    return res.status(201).json({
      message: 'Documento registrado exitosamente.',
      objeto,
      correo,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};

//////////////////// CATÁLOGO ////////////////////

export const listarObjetos = async (req, res) => {
  try {
    const objetos = await obtenerCatalogo(req.query);

    const objetosVisibles = objetos.map((objeto) => {
      const objetoVisible = req.user.rol === 'ESTUDIANTE' && objeto.objetoPrivado
        ? { ...objeto, descripcion: null, imagen: null }
        : objeto;

      if (req.user.rol === 'FUNCIONARIO') return objetoVisible;

      const { nombrePropietario, rutPropietario, ...objetoSinDatosPropietario } = objetoVisible;
      return objetoSinDatosPropietario;
    });

    return res.status(200).json({
      message: 'Catálogo obtenido exitosamente.',
      objetos: objetosVisibles,
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

export const actualizarDocumento = async (req, res) => {
  try {
    const parametros = validar(actualizarObjetoParamsSchema, req.params, res);
    if (!parametros) return;

    const datos = validar(actualizarDocumentoSchema, req.body || {}, res);
    if (!datos) return;

    const objeto = await actualizarDocumentoService(parametros.id, datos);

    return res.status(200).json({
      message: 'Documento actualizado exitosamente.',
      objeto,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};

export const actualizarObjeto = async (req, res) => {
  try {
    const parametros = validar(actualizarObjetoParamsSchema, req.params, res);
    if (!parametros) return;
    const datos = validar(actualizarObjetoSchema, req.body || {}, res);
    if (!datos) return;

    const objeto = req.file
      ? await actualizarImagenObjetoService(parametros.id, datos, req.file)
      : await actualizarObjetoService(parametros.id, datos);
    return res.status(200).json({ message: 'Objeto actualizado exitosamente.', objeto });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Error interno del servidor.' });
  }
};

export const obtenerImagenObjeto = async (req, res) => {
  try {
    const parametros = validar(actualizarObjetoParamsSchema, req.params, res);
    if (!parametros) return;

    const objeto = await prisma.objeto.findUnique({
      where: { id: parametros.id },
      select: { imagen: true, objetoPrivado: true },
    });
    if (!objeto?.imagen || (objeto.objetoPrivado && req.user.rol !== 'FUNCIONARIO')) {
      return res.status(404).json({ error: 'La imagen no está disponible.' });
    }

    const imagen = await leerImagen(objeto.imagen);
    return res
      .type('image/jpeg')
      .set('Cache-Control', 'private, no-store')
      .send(imagen);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'El archivo de imagen no está disponible.' });
    }
    return res.status(error.statusCode || 500).json({ error: error.message || 'No fue posible obtener la imagen.' });
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
