import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middlewares/auth.middlewares.js';

const router = Router();

router.post('/register', validateRegister, registerUser);

//////////////////// LOGIN ////////////////////

router.post('/login', validateLogin, loginUser);
// Export the router

export default router;