import { Router } from 'express';
import { listarAuditoria } from '../controllers/auditoria.controller.js';
import { verifyToken } from '../middlewares/auth.middlewares.js';
import { soloAdmin } from '../middlewares/roles.middlewares.js';

const router = Router();

router.get('/auditoria', verifyToken, soloAdmin, listarAuditoria);

export default router;
