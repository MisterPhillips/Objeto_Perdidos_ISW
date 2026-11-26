import { listarAuditoria as listarAuditoriaService } from '../services/auditoria.service.js';
import { listarAuditoriaSchema } from '../schemas/auditoria.schema.js';

export const listarAuditoria = async (req, res) => {
  const resultado = listarAuditoriaSchema.safeParse(req.query);
  if (!resultado.success) {
    return res.status(400).json({ error: resultado.error.issues[0].message });
  }

  try {
    const auditoria = await listarAuditoriaService(resultado.data);
    return res.status(200).json(auditoria);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'No se pudo cargar la bitácora de gestión.',
    });
  }
};
