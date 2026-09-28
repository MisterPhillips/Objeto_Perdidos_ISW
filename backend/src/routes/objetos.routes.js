// routes/objetos.routes.js
import { Router } from "express";
import { crearObjeto, listarObjetos, actualizarEstadoObjeto, editarObjeto, borrarObjeto } from "../controllers/objetos.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import { soloFuncionario } from "../middlewares/roles.middlewares.js";

const router = Router();

router.post("/", verifyToken, soloFuncionario, crearObjeto);
router.get("/", listarObjetos);
router.patch("/:id", verifyToken, soloFuncionario, editarObjeto);
router.patch("/:id/estado", verifyToken, soloFuncionario, actualizarEstadoObjeto);
router.delete("/:id", verifyToken, soloFuncionario, borrarObjeto);

export default router;