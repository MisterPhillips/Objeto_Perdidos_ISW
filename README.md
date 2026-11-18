# Objetos Perdidos

Aplicación web para registrar, buscar y gestionar objetos perdidos en un campus universitario. Permite consultar objetos y puntos de retiro en un mapa, y ofrece herramientas de administración y registro de entregas según el rol del usuario.

## Funcionalidades

- Registro e inicio de sesión con roles de estudiante, funcionario y administrador.
- Consulta de objetos disponibles y sus puntos de retiro.
- Mapa interactivo para explorar ubicaciones.
- Gestión de objetos, imágenes y documentos por funcionarios.
- Registro e historial de retiros.
- Administración de usuarios, categorías y puntos de retiro.

## Tecnologías

- **Frontend:** React, Vite, React Router, Tailwind CSS y Leaflet.
- **Backend:** Node.js, Express y Prisma ORM.
- **Base de datos:** PostgreSQL.

## Requisitos

- Node.js compatible con Vite 8 (20.19+ o 22.12+).
- npm.
- Una instancia de PostgreSQL.

## Configuración local

### 1. Configurar el backend

Desde la raíz del repositorio:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edita `backend/.env` y configura la conexión a PostgreSQL. Por ejemplo:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/objetos_perdidos?schema=public"
PORT=3000
```

Completa las variables `SMTP_*` del archivo si necesitas habilitar el envío de correos.

Genera el cliente de Prisma, aplica las migraciones y, opcionalmente, carga los datos de prueba:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

Inicia la API en modo desarrollo:

```powershell
npm run dev
```

La API estará disponible en `http://localhost:3000/api`. El endpoint `GET /api/health` permite comprobar la conexión con la base de datos. El backend también intenta servir el frontend compilado desde `frontend/dist` en el puerto indicado por `WEB_PORT` (443 por defecto); para el desarrollo habitual, utiliza Vite como se indica a continuación.

### 2. Configurar el frontend

En otra terminal, desde la raíz del repositorio:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

El frontend estará disponible en la dirección local que indique Vite (normalmente `http://localhost:5173`). La variable `VITE_API_URL` de `frontend/.env` debe apuntar a la API; su valor de ejemplo es `http://localhost:3000/api`.

## Cuentas de prueba

`npm run db:seed` crea cuentas locales para probar los distintos roles:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@admin.cl` | `admin123` |
| Funcionario | `funcionario@funcionario.cl` | `funcionario123` |
| Estudiante | `estudiante@estudiante.cl` | `estudiante123` |

Estas credenciales son únicamente para desarrollo local. No las uses en un entorno compartido o de producción.

## Comandos útiles

Ejecuta estos comandos desde la carpeta indicada:

| Carpeta | Comando | Descripción |
|---|---|---|
| `backend` | `npm run dev` | Inicia el backend con recarga automática. |
| `backend` | `npm start` | Inicia el backend sin recarga automática. |
| `backend` | `npm run db:generate` | Genera el cliente de Prisma. |
| `backend` | `npm run db:migrate` | Crea o aplica migraciones de desarrollo. |
| `backend` | `npm run db:seed` | Carga datos de prueba en la base de datos. |
| `backend` | `npm run db:studio` | Abre Prisma Studio. |
| `frontend` | `npm run dev` | Inicia Vite para desarrollo. |
| `frontend` | `npm run build` | Genera la compilación de producción en `frontend/dist`. |
| `frontend` | `npm run preview` | Sirve localmente la compilación de producción. |
| `frontend` | `npm run lint` | Ejecuta ESLint. |

Para preparar la versión web que sirve el backend, ejecuta `npm run build` en `frontend`. Si el puerto web predeterminado está ocupado, configura `WEB_PORT` en `backend/.env`.

## API

Las rutas de la API usan el prefijo `/api`. Los grupos principales son:

- `/register`, `/login`: registro e inicio de sesión.
- `/objeto`: consulta y gestión de objetos.
- `/categorias`: consulta y administración de categorías.
- `/puntos-retiro`: consulta y administración de puntos de retiro.
- `/retiros`: registro e historial de entregas.
- `/usuarios`: administración de usuarios.

Las operaciones de gestión requieren autenticación y, según el recurso, permisos de funcionario o administrador.

## Estructura del proyecto

```text
backend/
  prisma/       Esquema, migraciones y datos iniciales
  src/          Rutas, controladores, servicios y middlewares
frontend/
  src/          Páginas, componentes y servicios del cliente web
```
