CREATE TYPE "TipoEntidadAuditoria" AS ENUM ('USUARIO', 'CATEGORIA');
CREATE TYPE "AccionAuditoria" AS ENUM ('CREAR', 'EDITAR', 'ACTIVAR', 'DESACTIVAR');

CREATE TABLE "registros_auditoria" (
    "id" SERIAL NOT NULL,
    "tipoEntidad" "TipoEntidadAuditoria" NOT NULL,
    "entidadId" INTEGER NOT NULL,
    "accion" "AccionAuditoria" NOT NULL,
    "actorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_auditoria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "registros_auditoria_createdAt_idx" ON "registros_auditoria"("createdAt");
CREATE INDEX "registros_auditoria_tipoEntidad_entidadId_idx" ON "registros_auditoria"("tipoEntidad", "entidadId");

ALTER TABLE "registros_auditoria"
ADD CONSTRAINT "registros_auditoria_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "usuarios"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
