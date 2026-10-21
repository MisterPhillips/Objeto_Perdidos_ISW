// routes/objetos.routes.js
import { Router } from "express";
import { actualizarObjeto, crearObjeto, eliminarObjeto, entregarObjeto, listarObjetos, listarObjetosGestion } from "../controllers/objetos.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import { soloFuncionario } from "../middlewares/roles.middlewares.js";

const router = Router();

router.post("/objeto", verifyToken, soloFuncionario, crearObjeto);
router.get("/objeto/gestion", verifyToken, soloFuncionario, listarObjetosGestion);
router.get("/objeto", listarObjetos);
router.patch("/objeto/:id", verifyToken, soloFuncionario, actualizarObjeto);
router.delete("/objeto/:id", verifyToken, soloFuncionario, eliminarObjeto);
router.post("/objeto/:id/entrega", verifyToken, soloFuncionario, entregarObjeto);

export default router;