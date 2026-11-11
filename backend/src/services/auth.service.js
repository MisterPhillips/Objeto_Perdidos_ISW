import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const sanitizeUser = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  correo: usuario.correo,
  rol: usuario.rol,
  createdAt: usuario.createdAt,
  updatedAt: usuario.updatedAt,
});

export const registerUserService = async ({ nombre, correo, contrasena, rut }) => {
  const correoNormalizado = correo.trim().toLowerCase();

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { correo: correoNormalizado },
  });

  if (usuarioExistente) {
    const error = new Error('El correo electrónico ya está registrado.');
    error.statusCode = 400;
    throw error;
  }

  const contraseñaHasheada = await bcrypt.hash(contrasena, 10);

  let nuevoUsuario;
  try {
    nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        rut,
        correo: correoNormalizado,
        contrasena: contraseñaHasheada,
        rol: 'ESTUDIANTE',
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (error.code === 'P2002' && String(error.meta?.target).includes('rut')) {
      const rutError = new Error('Ya existe una cuenta con ese RUT.');
      rutError.statusCode = 409;
      throw rutError;
    }
    throw error;
  }

  return sanitizeUser(nuevoUsuario);
};

//////////////////// LOGIN ////////////////////

const generateToken = (usuario) => {
  const secret = process.env.JWT_SECRET || 'jwt_secret_local';

  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    secret,
    { expiresIn: '8h' }
  );
};

export const loginUserService = async ({ correo, contrasena }) => {
  const correoNormalizado = correo.trim().toLowerCase();

  const usuario = await prisma.usuario.findUnique({
    where: { correo: correoNormalizado },
  });

  if (!usuario) {
    const error = new Error('Credenciales inválidas.');
    error.statusCode = 401;
    throw error;
  }

  if (!usuario.activo) {
    const error = new Error('La cuenta está desactivada.');
    error.statusCode = 401;
    throw error;
  }

  const contraseñaValida = await bcrypt.compare(contrasena, usuario.contrasena);

  if (!contraseñaValida) {
    const error = new Error('Credenciales inválidas.');
    error.statusCode = 401;
    throw error;
  }

  const { contrasena: _, ...usuarioSinPassword } = usuario;

  return {
    usuario: sanitizeUser(usuarioSinPassword),
    token: generateToken(usuarioSinPassword),
  };
};
