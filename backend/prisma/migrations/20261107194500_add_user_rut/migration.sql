ALTER TABLE "usuarios"
ADD COLUMN "rut" VARCHAR(12);

CREATE UNIQUE INDEX "usuarios_rut_key" ON "usuarios"("rut");
