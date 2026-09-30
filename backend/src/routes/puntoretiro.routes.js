import { Router } from 'express';
import {
	actualizarPuntoRetiro,
	crearPuntoRetiro,
	eliminarPuntoRetiro,
	listarPuntosRetiro,
	listarPuntosRetiroConCantidadObjetos,
	listarPuntosRetiroParaMapa,
	obtenerPuntoRetiro,
	obtenerPuntoRetiroConObjetos,
} from '../controllers/puntoretiro.controller.js';
import { verifyToken } from '../middlewares/auth.middlewares.js';
import { soloAdmin } from '../middlewares/roles.middlewares.js';

const router = Router();

router.get('/puntos-retiro', listarPuntosRetiro);
router.get('/puntos-retiro/resumen', listarPuntosRetiroConCantidadObjetos);
router.get('/puntos-retiro/mapa', listarPuntosRetiroParaMapa);
router.get('/puntos-retiro/:id/objetos', obtenerPuntoRetiroConObjetos);
router.get('/puntos-retiro/:id', obtenerPuntoRetiro);
router.post('/puntos-retiro', verifyToken, soloAdmin, crearPuntoRetiro);
router.patch('/puntos-retiro/:id', verifyToken, soloAdmin, actualizarPuntoRetiro);
router.delete('/puntos-retiro/:id', verifyToken, soloAdmin, eliminarPuntoRetiro);

export default router;