import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const directorioImagenes = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/objetos');
const tamanioMaximoProcesado = 1024 * 1024;
const formatosPermitidos = new Set(['jpeg', 'png', 'webp']);

const errorImagen = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  return error;
};

export const guardarImagen = async (archivo) => {
  let metadata;
  try {
    metadata = await sharp(archivo.buffer, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw errorImagen('El archivo no contiene una imagen válida.');
  }

  if (!formatosPermitidos.has(metadata.format)) {
    throw errorImagen('La imagen debe estar realmente en formato JPG, PNG o WebP.');
  }

  let imagen;
  for (const calidad of [76, 66, 56, 46]) {
    try {
      imagen = await sharp(archivo.buffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: calidad, mozjpeg: true })
        .toBuffer();
    } catch {
      throw errorImagen('No se pudo procesar la imagen seleccionada.');
    }

    if (imagen.length <= tamanioMaximoProcesado) break;
  }

  if (imagen.length > tamanioMaximoProcesado) {
    throw errorImagen('La imagen sigue siendo demasiado pesada después de comprimirla.');
  }

  await mkdir(directorioImagenes, { recursive: true });
  const nombre = `${randomUUID()}.jpg`;
  await writeFile(path.join(directorioImagenes, nombre), imagen, { flag: 'wx' });
  return nombre;
};

export const eliminarImagen = async (nombre) => {
  if (!nombre) return;
  if (!/^[\da-f-]{36}\.jpg$/i.test(nombre)) {
    throw new Error('El nombre de imagen almacenado no es válido.');
  }

  try {
    await unlink(path.join(directorioImagenes, nombre));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

export const leerImagen = async (nombre) => {
  if (!/^[\da-f-]{36}\.jpg$/i.test(nombre)) {
    throw new Error('El nombre de imagen almacenado no es válido.');
  }
  return readFile(path.join(directorioImagenes, nombre));
};
