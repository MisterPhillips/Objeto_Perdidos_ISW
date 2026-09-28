import jwt from 'jsonwebtoken';

export const validateRegister = (req, res, next) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({
      error: 'Nombre, correo y contraseña son obligatorios.',
    });
  }

  next();
};

//////////////////// LOGIN ////////////////////

export const validateLogin = (req, res, next) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      error: 'Correo y contraseña son obligatorios.',
    });
  }

  next();
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_local');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

//comentario random