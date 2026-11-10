import {
  listarRetiros as listarRetirosService,
  registrarRetiro as registrarRetiroService,
} from '../services/retiros.service.js';

const responderError = (res, error) => res.status(error.statusCode || 500).json({
  error: error.message || 'Error interno del servidor.',
});

export const registrarRetiro = async (req, res) => {
  try {
    const {
      objetoId,
      nombreRetirante,
      rutRetirante,
      correoRetirante,
    } = req.body;

    const retiro = await registrarRetiroService({
      objetoId,
      nombreRetirante,
      rutRetirante,
      correoRetirante,
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

export const listarRetiros = async (_req, res) => {
  try {
    const retiros = await listarRetirosService();
    return res.status(200).json({ retiros });
  } catch (error) {
    return responderError(res, error);
  }
};