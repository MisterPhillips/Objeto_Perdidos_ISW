// routes/objetos.routes.js
import { Router } from "express";
import { actualizarEstadoObjeto, actualizarObjeto, crearObjeto, eliminarObjeto, entregarObjeto, listarObjetos, listarObjetosGestion } from "../controllers/objetos.controller.js";
import { crearSolicitudReclamo, listarMisSolicitudes, listarSolicitudes, actualizarSolicitudReclamo } from "../controllers/reclamos.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import { soloEstudiante, soloFuncionario } from "../middlewares/roles.middlewares.js";

const router = Router();

router.post("/objeto", verifyToken, soloFuncionario, crearObjeto);
router.get("/objeto/gestion", verifyToken, soloFuncionario, listarObjetosGestion);
router.get("/objeto", listarObjetos);
router.patch("/objeto/:id", verifyToken, soloFuncionario, actualizarObjeto);
router.delete("/objeto/:id", verifyToken, soloFuncionario, eliminarObjeto);
router.post("/objeto/:id/entrega", verifyToken, soloFuncionario, entregarObjeto);
router.patch("/objeto/:id/estado", verifyToken, soloFuncionario, actualizarEstadoObjeto);
router.post("/objeto/:id/reclamos", verifyToken, soloEstudiante, crearSolicitudReclamo);//se agrgfa la ruta para crear una solicitud de reclamo para un objeto específico, solo accesible para estudiantes autenticados
router.get("/reclamos/mis-solicitudes", verifyToken, soloEstudiante, listarMisSolicitudes);
router.get("/reclamos", verifyToken, soloFuncionario, listarSolicitudes);
router.patch("/reclamos/:id", verifyToken, soloFuncionario, actualizarSolicitudReclamo);

export default router;