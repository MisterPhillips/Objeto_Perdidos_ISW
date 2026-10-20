import {
	crearCategoria as crearCategoriaService,
	obtenerCategorias as obtenerCategoriasService,
	actualizarCategoria as actualizarCategoriaService,
	eliminarCategoria as eliminarCategoriaService,
} from '../services/categorias.service.js';
import {
	actualizarCategoriaParamsSchema,
	actualizarCategoriaSchema,
	crearCategoriaSchema,
	eliminarCategoriaParamsSchema,
} from '../schemas/categorias.schema.js';

const validar = (schema, datos, res) => {
	const resultado = schema.safeParse(datos);
	if (!resultado.success) {
		res.status(400).json({ error: resultado.error.issues[0].message });
		return null;
	}
	return resultado.data;
};

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
		const datos = validar(crearCategoriaSchema, req.body, res);
		if (!datos) return;

		const categoria = await crearCategoriaService({
			...datos,
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
		const parametros = validar(actualizarCategoriaParamsSchema, req.params, res);
		if (!parametros) return;
		const datos = validar(actualizarCategoriaSchema, req.body || {}, res);
		if (!datos) return;

		const categoria = await actualizarCategoriaService(parametros.id, datos);
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
		const parametros = validar(eliminarCategoriaParamsSchema, req.params, res);
		if (!parametros) return;

		const categoria = await eliminarCategoriaService(parametros.id);
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
