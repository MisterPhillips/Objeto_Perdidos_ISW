import multer from 'multer';

const tiposPermitidos = new Set(['image/jpeg', 'image/png', 'image/webp']);

const recibirImagen = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!tiposPermitidos.has(file.mimetype)) {
      const error = new Error('La imagen debe estar en formato JPG, PNG o WebP.');
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  },
}).single('imagen');

export const cargarImagenObjeto = (req, res, next) => {
  recibirImagen(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const status = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 413
      : error.statusCode || 400;
    const message = status === 413
      ? 'La imagen no puede superar los 5 MB.'
      : error.message || 'No se pudo procesar la imagen.';

    res.status(status).json({ error: message });
  });
};
