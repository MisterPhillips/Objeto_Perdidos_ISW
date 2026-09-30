import { Router } from 'express';
import {
	actualizarUsuario,
	crearUsuario,
	eliminarUsuario,
	listarUsuarios,
} from '../controllers/usuarios.controller.js';
import { verifyToken } from '../middlewares/auth.middlewares.js';
import { soloAdmin } from '../middlewares/roles.middlewares.js';

const router = Router();

router.get('/usuarios', verifyToken, soloAdmin, listarUsuarios);
router.post('/usuarios', verifyToken, soloAdmin, crearUsuario);
router.patch('/usuarios/:id', verifyToken, soloAdmin, actualizarUsuario);
router.delete('/usuarios/:id', verifyToken, soloAdmin, eliminarUsuario);

export default router;