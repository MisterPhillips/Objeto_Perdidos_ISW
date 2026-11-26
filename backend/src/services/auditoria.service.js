import prisma from '../config/prisma.js';

export const registrarAuditoria = (transaccion, datos) =>
  transaccion.registroAuditoria.create({ data: datos });

export const listarAuditoria = async ({ pagina, limite }) => {
  const [registros, total] = await prisma.$transaction([
    prisma.registroAuditoria.findMany({
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        tipoEntidad: true,
        entidadId: true,
        accion: true,
        createdAt: true,
        actor: {
          select: { id: true, nombre: true, correo: true },
        },
      },
    }),
    prisma.registroAuditoria.count(),
  ]);

  return { registros, total, pagina, limite };
};
