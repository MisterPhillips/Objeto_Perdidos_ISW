import {
	crearCategoria as crearCategoriaService,
	obtenerCategorias as obtenerCategoriasService,
	actualizarCategoria as actualizarCategoriaService,
	eliminarCategoria as eliminarCategoriaService,
} from '../services/categorias.service.js';

export const listarCategorias = async (_req, res) => {
	try {
		const categorias = await obtenerCategoriasService();

		return res.status(200).json({
			message: 'Categorías obtenidas exitosamente.',
			categorias,
		});
	} catch (error) {
		const status = error.statusCode || 500;
		return res.status(status).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};

export const crearCategoria = async (req, res) => {
	try {
		// Limpia el nombre y usa una cadena vacía si falta o no es texto; la descripción se lee sin modificar.
		const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';
		const descripcion = req.body?.descripcion;

		if (!nombre) {
			return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
		}

		if (nombre.length > 80) {
			return res.status(400).json({ error: 'El nombre no puede superar los 80 caracteres.' });
		}

		if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
			return res.status(400).json({ error: 'La descripción debe ser texto.' });
		}

		const categoria = await crearCategoriaService({
			nombre,
			descripcion: typeof descripcion === 'string' ? descripcion.trim() || null : descripcion,
		});

		return res.status(201).json({
			message: 'Categoría creada exitosamente.',
			categoria,
		});
	} catch (error) {
		const status = error.statusCode || 500;
		return res.status(status).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};

export const actualizarCategoria = async (req, res) => {
	try {
		const categoriaId = Number(req.params.id);//toma id de la categoria de la url y lo convierte a numero
		if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
			return res.status(400).json({ error: 'El identificador de la categoría no es válido.' });
		}

		const datos = {};//objeto que contendra los datos a actualizar
		if (req.body?.nombre !== undefined) {
			if (typeof req.body.nombre !== 'string' || !req.body.nombre.trim()) {
				return res.status(400).json({ error: 'El nombre debe ser texto y no puede estar vacío.' });
			}

			datos.nombre = req.body.nombre.trim();
			if (datos.nombre.length > 80) {
				return res.status(400).json({ error: 'El nombre no puede superar los 80 caracteres.' });
			}
		}

		if (req.body?.descripcion !== undefined) {
			const { descripcion } = req.body;
			if (descripcion !== null && typeof descripcion !== 'string') {
				return res.status(400).json({ error: 'La descripción debe ser texto.' });
			}

			datos.descripcion = typeof descripcion === 'string' ? descripcion.trim() || null : null;
		}

		if (Object.keys(datos).length === 0) { //obtine las llaves del objeto datos y si no hay ninguna, significa que no se proporcionaron datos para actualizar
			return res.status(400).json({ error: 'Indica el nombre o la descripción para actualizar.' });
		}

		const categoria = await actualizarCategoriaService(categoriaId, datos);
		return res.status(200).json({
			message: 'Categoría actualizada exitosamente.',
			categoria,
		});
	} catch (error) {
		const status = error.statusCode || 500;
		return res.status(status).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};

export const eliminarCategoria = async (req, res) => {
	try {
		const categoriaId = Number(req.params.id);
		if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
			return res.status(400).json({ error: 'El identificador de la categoría no es válido.' });
		}

		const categoria = await eliminarCategoriaService(categoriaId);
		return res.status(200).json({
			message: 'Categoría eliminada lógicamente.',
			categoria,
		});
	} catch (error) {
		const status = error.statusCode || 500;
		return res.status(status).json({
			error: error.message || 'Error interno del servidor.',
		});
	}
};
