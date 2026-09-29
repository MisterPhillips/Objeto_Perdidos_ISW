// routes/objetos.routes.js
import { Router } from "express";
import { crearObjeto, listarObjetos, actualizarEstadoObjeto } from "../controllers/objetos.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import { soloFuncionario } from "../middlewares/roles.middlewares.js";

const router = Router();

router.post("/objeto", verifyToken, soloFuncionario, crearObjeto);
router.get("/objeto", listarObjetos);
router.patch("/objeto:id/estado", verifyToken, soloFuncionario, actualizarEstadoObjeto);

export default router;