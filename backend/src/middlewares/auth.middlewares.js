import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { normalizarRutChileno, rutChilenoValido } from '../utils/rut.js';

export const validateRegister = (req, res, next) => {
  const { nombre, correo, contrasena, rut } = req.body || {};

  if (!nombre || !correo || !contrasena || typeof rut !== 'string' || !rut.trim()) {
    return res.status(400).json({
      error: 'Nombre, correo, RUT y contraseña son obligatorios.',
    });
  }

  if (!rutChilenoValido(rut)) {
    return res.status(400).json({ error: 'Ingresa un RUT válido, por ejemplo 12.345.678-5.' });
  }

  req.body.rut = normalizarRutChileno(rut);
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

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_local');
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, correo: true, rol: true, activo: true },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'La cuenta no está activa.' });
    }

    req.user = { id: usuario.id, correo: usuario.correo, rol: usuario.rol };
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'No fue posible verificar la cuenta.' });
  }
};