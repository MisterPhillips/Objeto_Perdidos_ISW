// routes/objetos.routes.js
import { Router } from "express";
import { crearObjeto, listarObjetos, actualizarEstadoObjeto } from "../controllers/objetos.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import { soloFuncionario } from "../middlewares/roles.middlewares.js";

const router = Router();

router.post("/", verifyToken, soloFuncionario, crearObjeto);
router.get("/", listarObjetos);
router.patch("/:id/estado", verifyToken, soloFuncionario, actualizarEstadoObjeto);

export default router;