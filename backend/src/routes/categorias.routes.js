import { Router } from 'express';
import {
	actualizarCategoria,
	crearCategoria,
	eliminarCategoria,
	listarCategorias,
} from '../controllers/categorias.controller.js';
import { verifyToken } from '../middlewares/auth.middlewares.js';
import { soloAdmin } from '../middlewares/roles.middlewares.js';

const router = Router();

router.get('/categorias', listarCategorias);
router.post('/categorias', verifyToken, soloAdmin, crearCategoria);
router.patch('/categorias/:id', verifyToken, soloAdmin, actualizarCategoria);
router.delete('/categorias/:id', verifyToken, soloAdmin, eliminarCategoria);

export default router;