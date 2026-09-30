CREATE TYPE "EstadoSolicitudReclamo" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

CREATE TABLE "solicitudes_reclamo" (
    "id" SERIAL NOT NULL,
    "detalle" VARCHAR(500) NOT NULL,
    "estado" "EstadoSolicitudReclamo" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "objetoId" INTEGER NOT NULL,

    CONSTRAINT "solicitudes_reclamo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "solicitudes_reclamo_usuarioId_estado_idx" ON "solicitudes_reclamo"("usuarioId", "estado");
CREATE INDEX "solicitudes_reclamo_objetoId_estado_idx" ON "solicitudes_reclamo"("objetoId", "estado");

ALTER TABLE "solicitudes_reclamo"
ADD CONSTRAINT "solicitudes_reclamo_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "solicitudes_reclamo"
ADD CONSTRAINT "solicitudes_reclamo_objetoId_fkey"
FOREIGN KEY ("objetoId") REFERENCES "objetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;