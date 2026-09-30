import { Router } from 'express';
import { listarRetiros, registrarRetiro } from '../controllers/retiros.controller.js';
import { verifyToken } from '../middlewares/auth.middlewares.js';
import { soloFuncionario } from '../middlewares/roles.middlewares.js';

const router = Router();

router.post('/retiros', verifyToken, soloFuncionario, registrarRetiro);
router.get('/retiros', verifyToken, soloFuncionario, listarRetiros);

export default router;