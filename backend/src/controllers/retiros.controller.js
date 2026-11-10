import {
  buscarRetirante as buscarRetiranteService,
  listarFuncionariosConRetiros as listarFuncionariosConRetirosService,
  listarRetiros as listarRetirosService,
  registrarRetiro as registrarRetiroService,
} from '../services/retiros.service.js';
import { buscarRetiranteSchema, listarRetirosSchema } from '../schemas/retiros.schema.js';

const responderError = (res, error) => res.status(error.statusCode || 500).json({
  error: error.message || 'Error interno del servidor.',
});

export const buscarRetirante = async (req, res) => {
  try {
    const resultado = buscarRetiranteSchema.safeParse(req.query);
    if (!resultado.success) {
      return res.status(400).json({
        error: 'Error de validación en los datos enviados',
        detalles: resultado.error.issues,
      });
    }

    const usuario = await buscarRetiranteService(resultado.data.rutRetirante);
    return res.status(200).json({ usuario });
  } catch (error) {
    return responderError(res, error);
  }
};

export const registrarRetiro = async (req, res) => {
  try {
    const {
      objetoId,
      rutRetirante,
    } = req.body;

    const retiro = await registrarRetiroService({
      objetoId,
      rutRetirante,
      funcionarioId: req.user.id,
    });

    return res.status(201).json({
      message: 'Entrega registrada exitosamente.',
      retiro,
    });
  } catch (error) {
    return responderError(res, error);
  }
};

export const listarRetiros = async (req, res) => {
  try {
    const resultado = listarRetirosSchema.safeParse(req.query);
    if (!resultado.success) {
      return res.status(400).json({
        error: 'Error de validación en los datos enviados',
        detalles: resultado.error.issues,
      });
    }

    const resultadoBusqueda = await listarRetirosService(resultado.data);
    return res.status(200).json(resultadoBusqueda);
  } catch (error) {
    return responderError(res, error);
  }
};

export const listarFuncionariosConRetiros = async (_req, res) => {
  try {
    const funcionarios = await listarFuncionariosConRetirosService();
    return res.status(200).json({ funcionarios });
  } catch (error) {
    return responderError(res, error);
  }
};