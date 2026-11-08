// routes/objetos.routes.js
import { Router } from "express";
import { actualizarDocumento, actualizarObjeto, crearObjeto, crearDocumento, eliminarObjeto, entregarObjeto, listarObjetos, listarObjetosGestion, obtenerImagenObjeto } from "../controllers/objetos.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import { soloFuncionario } from "../middlewares/roles.middlewares.js";
import { cargarImagenObjeto } from "../middlewares/imagenes.middleware.js";

const router = Router();

router.post("/objeto", verifyToken, soloFuncionario, cargarImagenObjeto, crearObjeto);
router.post("/objeto/documento", verifyToken, soloFuncionario, crearDocumento);
router.patch("/objeto/:id/documento", verifyToken, soloFuncionario, actualizarDocumento);
router.get("/objeto/gestion", verifyToken, soloFuncionario, listarObjetosGestion);
router.get("/objeto", verifyToken, listarObjetos);
router.get("/objeto/:id/imagen", verifyToken, obtenerImagenObjeto);
router.patch("/objeto/:id", verifyToken, soloFuncionario, cargarImagenObjeto, actualizarObjeto);
router.delete("/objeto/:id", verifyToken, soloFuncionario, eliminarObjeto);
router.post("/objeto/:id/entrega", verifyToken, soloFuncionario, entregarObjeto);
export default router;