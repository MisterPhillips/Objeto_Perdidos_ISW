import { Router } from 'express';
import { buscarRetirante, listarRetiros, registrarRetiro } from '../controllers/retiros.controller.js';
import { verifyToken } from '../middlewares/auth.middlewares.js';
import { soloFuncionario } from '../middlewares/roles.middlewares.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registrarRetiroSchema } from '../schemas/retiros.schema.js';

const router = Router();

router.post('/retiros', verifyToken, soloFuncionario, validate(registrarRetiroSchema), registrarRetiro);
router.get('/retiros/retirante', verifyToken, soloFuncionario, buscarRetirante);
router.get('/retiros', verifyToken, soloFuncionario, listarRetiros);

export default router;