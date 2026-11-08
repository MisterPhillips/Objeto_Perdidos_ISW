import nodemailer from 'nodemailer';
import prisma from '../config/prisma.js';

export const notificarDocumentoRegistrado = async ({ rutPropietario, facultad }) => {
  if (!rutPropietario) {
    return { enviado: false, motivo: 'rut_faltante' };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { rut: rutPropietario },
    select: { correo: true },
  });

  if (!usuario) {
    return { enviado: false, motivo: 'sin_coincidencia' };
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  const port = Number(SMTP_PORT);

  if (
    !SMTP_HOST
    || !Number.isInteger(port)
    || port < 1
    || port > 65535
    || !SMTP_USER
    || !SMTP_PASSWORD
    || !SMTP_FROM
  ) {
    return { enviado: false, motivo: 'smtp_no_configurado' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: usuario.correo,
    subject: 'Documento personal encontrado',
    text: `Se encontró un documento personal asociado a tus datos. Puedes consultar con el funcionario en la facultad: ${facultad}.`,
  });

  return { enviado: true };
};
