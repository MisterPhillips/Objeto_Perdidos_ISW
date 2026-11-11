export const validate = (schema, target = 'body') => (req, res, next) => {
  const resultado = schema.safeParse(req[target]);

  if (!resultado.success) {
    return res.status(400).json({
      error: 'Error de validación en los datos enviados',
      detalles: resultado.error.issues,
    });
  }

  req[target] = resultado.data;
  return next();
};
