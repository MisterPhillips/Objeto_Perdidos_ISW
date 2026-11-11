# Objetos Perdidos — Frontend

Cliente web de la aplicación de objetos perdidos del campus. Permite consultar objetos y puntos de retiro en un mapa, y ofrece vistas de administración y gestión de retiros según el rol del usuario.

Para obtener instrucciones de configuración del proyecto completo y del backend, consulta el [README de la raíz](../README.md).

## Tecnologías

- React 19 y Vite 8.
- React Router para navegación.
- Tailwind CSS 4 para estilos.
- Leaflet y React Leaflet para mapas.
- Lucide React para iconografía.

## Requisitos

- Node.js 20.19+ o 22.12+.
- npm.
- El backend y PostgreSQL configurados para utilizar las funciones que dependen de la API.

## Configuración y desarrollo

Desde esta carpeta (`frontend`):

```bash
npm install
```

Crea un archivo `.env` a partir de `.env.example` y configura la URL de la API:

```env
VITE_API_URL=http://localhost:3000/api
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre la dirección local que muestra Vite en la terminal (por defecto, `http://localhost:5173`). Para iniciar sesión, el backend debe estar disponible en la URL configurada.

## Funcionalidades y navegación

- **Acceso:** registro e inicio de sesión.
- **Usuarios autenticados:** página de inicio, listado de objetos y mapa interactivo con puntos de retiro.
- **Funcionarios:** gestión de objetos y registro e historial de retiros.
- **Administradores:** gestión de usuarios, categorías y puntos de retiro.

Las rutas protegidas redirigen al inicio de sesión cuando no existe una sesión activa y restringen las vistas administrativas o de funcionarios según el rol.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia Vite en modo desarrollo. |
| `npm run build` | Genera la compilación de producción en `dist/`. |
| `npm run preview` | Sirve localmente la compilación generada. |
| `npm run lint` | Ejecuta ESLint sobre el frontend. |

## Estructura

```text
src/
  components/  Componentes reutilizables y elementos del mapa
  config/      Configuración del cliente HTTP
  pages/       Vistas de la aplicación
  services/    Comunicación con la API y gestión de sesión
  utils/       Funciones auxiliares
```

## Compilación y comprobaciones

Antes de publicar cambios, ejecuta:

```bash
npm run lint
npm run build
```

Vite coloca los archivos compilados en `dist/`. En el despliegue, configura el servidor para servir esa carpeta y direccionar las solicitudes `/api` al backend.
