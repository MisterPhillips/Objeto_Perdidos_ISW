-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('FUNCIONARIO', 'ESTUDIANTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoObjeto" AS ENUM ('EN_REVISION', 'DISPONIBLE', 'ENTREGADO');

-- CreateEnum
CREATE TYPE "EstadoSolicitudReclamo" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ESTUDIANTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_retiro" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "facultad" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntos_retiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objetos" (
    "id" SERIAL NOT NULL,
    "descripcion" VARCHAR(150) NOT NULL,
    "estado" "EstadoObjeto" NOT NULL DEFAULT 'EN_REVISION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objetoPrivado" BOOLEAN NOT NULL DEFAULT false,
    "categoriaId" INTEGER NOT NULL,
    "puntoRetiroId" INTEGER NOT NULL,
    "registradoPorId" INTEGER NOT NULL,

    CONSTRAINT "objetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "retiros" (
    "id" SERIAL NOT NULL,
    "nombreRetirante" VARCHAR(100) NOT NULL,
    "rutRetirante" VARCHAR(20) NOT NULL,
    "correoRetirante" VARCHAR(150) NOT NULL,
    "fechaRetiro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objetoId" INTEGER NOT NULL,
    "funcionarioId" INTEGER NOT NULL,

    CONSTRAINT "retiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "puntos_retiro_nombre_key" ON "puntos_retiro"("nombre");

-- CreateIndex
CREATE INDEX "puntos_retiro_facultad_idx" ON "puntos_retiro"("facultad");

-- CreateIndex
CREATE INDEX "objetos_puntoRetiroId_idx" ON "objetos"("puntoRetiroId");

-- CreateIndex
CREATE INDEX "objetos_categoriaId_idx" ON "objetos"("categoriaId");

-- CreateIndex
CREATE INDEX "objetos_estado_idx" ON "objetos"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_reclamo_usuarioId_estado_idx" ON "solicitudes_reclamo"("usuarioId", "estado");

-- CreateIndex
CREATE INDEX "solicitudes_reclamo_objetoId_estado_idx" ON "solicitudes_reclamo"("objetoId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "retiros_objetoId_key" ON "retiros"("objetoId");

-- CreateIndex
CREATE INDEX "retiros_fechaRetiro_idx" ON "retiros"("fechaRetiro");

-- CreateIndex
CREATE INDEX "retiros_rutRetirante_idx" ON "retiros"("rutRetirante");

-- AddForeignKey
ALTER TABLE "objetos" ADD CONSTRAINT "objetos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetos" ADD CONSTRAINT "objetos_puntoRetiroId_fkey" FOREIGN KEY ("puntoRetiroId") REFERENCES "puntos_retiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetos" ADD CONSTRAINT "objetos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_reclamo" ADD CONSTRAINT "solicitudes_reclamo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_reclamo" ADD CONSTRAINT "solicitudes_reclamo_objetoId_fkey" FOREIGN KEY ("objetoId") REFERENCES "objetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros" ADD CONSTRAINT "retiros_objetoId_fkey" FOREIGN KEY ("objetoId") REFERENCES "objetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros" ADD CONSTRAINT "retiros_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
