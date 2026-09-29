import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import prisma from './src/config/prisma.js'
import authRoutes from './src/routes/auth.routes.js' 
import objetosRoutes from './src/routes/objetos.routes.js'
import categoriasRoutes from './src/routes/categorias.routes.js'
import puntosRetiroRoutes from './src/routes/puntoretiro.routes.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

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

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})