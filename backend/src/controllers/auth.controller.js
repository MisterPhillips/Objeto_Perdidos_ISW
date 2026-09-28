import { registerUserService, loginUserService } from '../services/auth.service.js';

export const registerUser = async (req, res) => {
  try {
    const usuario = await registerUserService(req.body);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      usuario,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};

//////////////////// LOGIN ////////////////////

export const loginUser = async (req, res) => {
  try {
    const data = await loginUserService(req.body);

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      usuario: data.usuario,
      token: data.token,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || 'Error interno del servidor.',
    });
  }
};