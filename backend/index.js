"use strict";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import prisma from "./src/config/prisma.js";

// 1. Tus rutas originales
import authRoutes from './src/routes/auth.routes.js';
import objetosRoutes from './src/routes/objetos.routes.js';
import categoriasRoutes from './src/routes/categorias.routes.js';
import puntosRetiroRoutes from './src/routes/puntoretiro.routes.js';
import usuariosRoutes from './src/routes/usuarios.routes.js';
import retirosRoutes from './src/routes/retiros.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 80; 
const WEB_PORT = process.env.WEB_PORT || 443;

function setupAPI() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ credentials: true, origin: true }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get('/api/health', async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      response.status(503).json({ status: 'error', database: 'unavailable' });
    }
  });

  // 2. Aqu   estaban los errores. Usamos tus rutas, NO "router"
  app.use('/api', authRoutes);
  app.use('/api', objetosRoutes);
  app.use('/api', categoriasRoutes);
  app.use('/api', puntosRetiroRoutes);
  app.use('/api', usuariosRoutes);
  app.use('/api', retirosRoutes);

  app.listen(PORT, () => {
    console.log(`API corriendo en puerto ${PORT}`);
  });
}

function setupWeb() {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  const web = express();
  web.disable("x-powered-by");
  web.use(express.json());
  web.use(morgan("dev"));
  
  // Montamos las mismas rutas para el frontend
  web.use('/api', authRoutes);
  web.use('/api', objetosRoutes);
  web.use('/api', categoriasRoutes);
  web.use('/api', puntosRetiroRoutes);
  web.use('/api', usuariosRoutes);
  web.use('/api', retirosRoutes);

  web.use(express.static(frontendPath));
  web.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

  web.listen(WEB_PORT, () => {
    console.log(`Frontend servido en puerto ${WEB_PORT}`);
  });
}

async function main() {
  try {
    await prisma.$connect();
    console.log("=> Conexi  n a PostgreSQL establecida");
    setupAPI();
    setupWeb();
    console.log("=> Servidores iniciados");
  } catch (error) {
    console.error("Error en index.js -> main(): ", error);
    process.exit(1);
  }
}

main();