import {
  listarRetiros as listarRetirosService,
  registrarRetiro as registrarRetiroService,
} from '../services/retiros.service.js';

const textoValido = (valor, maximo) => (
  typeof valor === 'string' && valor.trim().length > 0 && valor.trim().length <= maximo
);

const rutChilenoValido = (rut) => {
  const valor = rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
  const coincidencia = /^(\d{7,8})-([0-9K])$/.exec(valor);

  if (!coincidencia) return false;

  const cuerpo = coincidencia[1];
  const digitoEsperado = coincidencia[2];
  let suma = 0;
  let multiplicador = 2;

  for (let indice = cuerpo.length - 1; indice >= 0; indice -= 1) {
    suma += Number(cuerpo[indice]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  const digitoCalculado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return digitoCalculado === digitoEsperado;
};

const responderError = (res, error) => res.status(error.statusCode || 500).json({
  error: error.message || 'Error interno del servidor.',
});

export const registrarRetiro = async (req, res) => {
  try {
    const objetoId = Number(req.body?.objetoId);
    const { nombreRetirante, rutRetirante, correoRetirante } = req.body || {};

    if (!Number.isInteger(objetoId) || objetoId <= 0) {
      return res.status(400).json({ error: 'El identificador del objeto no es válido.' });
    }

    if (!textoValido(nombreRetirante, 100) || !textoValido(rutRetirante, 20)) {
      return res.status(400).json({ error: 'El nombre y el RUT son obligatorios.' });
    }

    if (!rutChilenoValido(rutRetirante)) {
      return res.status(400).json({ error: 'Ingresa un RUT válido, por ejemplo 12.345.678-5.' });
    }

    if (!textoValido(correoRetirante, 150) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoRetirante.trim())) {
      return res.status(400).json({ error: 'Ingresa un correo válido.' });
    }

    const retiro = await registrarRetiroService({
      objetoId,
      nombreRetirante: nombreRetirante.trim(),
      rutRetirante: rutRetirante.trim().replace(/\s/g, '').toUpperCase(),
      correoRetirante: correoRetirante.trim().toLowerCase(),
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