import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import prisma from './src/config/prisma.js'
import authRoutes from './src/routes/auth.routes.js'
import objetosRoutes from './src/routes/objetos.routes.js'
import categoriasRoutes from './src/routes/categorias.routes.js'
import puntosRetiroRoutes from './src/routes/puntoretiro.routes.js'
import usuariosRoutes from './src/routes/usuarios.routes.js'
import retirosRoutes from './src/routes/retiros.routes.js'

const app = express()
const port = Number(process.env.PORT) || 3000
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const frontendPath = path.resolve(dirname, '../frontend/dist')

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Ruta de salud de la base de datos
app.get('/api/health', async (_request, response) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        response.json({ status: 'ok', database: 'connected' })
    } catch (error) {
        response.status(503).json({ status: 'error', database: 'unavailable' })
    }
})

// 2. Monta las rutas de autenticación con el prefijo /api/auth[cite: 1]
app.use('/api', authRoutes)
app.use('/api', objetosRoutes)
app.use('/api', categoriasRoutes)
app.use('/api', puntosRetiroRoutes)
app.use('/api', usuariosRoutes)
app.use('/api', retirosRoutes)

app.use(express.static(frontendPath))

app.use((request, response, next) => {
  if (request.path.startsWith('/api')) return next()
  return response.sendFile(path.join(frontendPath, 'index.html'), (error) => {
    if (error) next(error)
  })
})

app.use((request, response) => {
  response.status(404).json({ error: `Ruta no encontrada: ${request.method} ${request.path}` })
})

app.use((error, _request, response, _next) => {
  console.error('Error no controlado:', error)
  response.status(error.status || 500).json({
    error: 'Error interno del servidor.',
  })
})

async function bootstrap() {
  try {
    await prisma.$connect()
    console.log('=> Conexión a PostgreSQL establecida')

    app.listen(port, () => {
      console.log(`Servidor corriendo en puerto ${port}`)
    })
  } catch (error) {
    console.error('=> Error al iniciar el servidor o conectar a PostgreSQL:', error)
    await prisma.$disconnect().catch(() => {})
    process.exit(1)
  }
}

bootstrap()