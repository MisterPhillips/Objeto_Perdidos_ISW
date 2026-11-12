import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom' 
import PaginaInicioSesion from './pages/PaginaInicioSesion.jsx'
import MapaInteractivo from './pages/MapaInteractivo.jsx'
import PaginaObjetos from './pages/PaginaObjetos.jsx'
import PaginaInicio from './pages/PaginaInicio.jsx'
import PaginaPrincipal from './pages/PaginaPrincipal.jsx'
import PaginaRegistro from './pages/PaginaRegistro.jsx'
import PaginaRetiros from './pages/PaginaRetiros.jsx'
import PaginaBitacoraRetiros from './pages/PaginaBitacoraRetiros.jsx'
import PaginaCategorias from './pages/PaginaCategorias.jsx'
import PaginaUsuarios from './pages/PaginaUsuarios.jsx'
import PaginaCrearPuntoRetiro from './pages/PaginaCrearPuntoRetiro.jsx'
import { getSessionToken, getSessionUser } from './services/sessionService.js'

function RutaAdministrador({ children }) {
  const usuario = getSessionUser()
  return getSessionToken() && usuario?.rol === 'ADMIN'
    ? children
    : <Navigate replace to="/login" />
}

function RutaAutenticada({ children }) {
  return getSessionToken()
    ? children
    : <Navigate replace to="/login" />
}

function RutaFuncionario({ children }) {
  const usuario = getSessionUser()
  return getSessionToken() && usuario?.rol === 'FUNCIONARIO'
    ? children
    : <Navigate replace to="/inicio" />
}

function RutaInicial() {
  return <Navigate replace to={getSessionToken() ? '/inicio' : '/login'} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RutaInicial />} path="/" />
        <Route element={<PaginaInicioSesion />} path="/login" />
        <Route element={<PaginaRegistro />} path="/registro" />
        <Route element={<RutaAdministrador><PaginaPrincipal><PaginaCategorias /></PaginaPrincipal></RutaAdministrador>} path="/admin/categorias" />
        <Route element={<RutaAdministrador><PaginaPrincipal><PaginaUsuarios /></PaginaPrincipal></RutaAdministrador>} path="/admin/usuarios" />
        <Route element={<RutaAdministrador><PaginaPrincipal><PaginaCrearPuntoRetiro /></PaginaPrincipal></RutaAdministrador>} path="/admin/puntos-retiro/nuevo" />
        <Route element={<RutaFuncionario><PaginaPrincipal><PaginaRetiros /></PaginaPrincipal></RutaFuncionario>} path="/funcionario/retiros" />
        <Route element={<RutaFuncionario><PaginaPrincipal><PaginaBitacoraRetiros /></PaginaPrincipal></RutaFuncionario>} path="/funcionario/bitacora-retiros" />
        <Route element={<RutaAutenticada><PaginaPrincipal><PaginaInicio /></PaginaPrincipal></RutaAutenticada>} path="/inicio" />
        <Route element={<RutaAutenticada><PaginaPrincipal><MapaInteractivo /></PaginaPrincipal></RutaAutenticada>} path="/app/mapa" />
        <Route element={<RutaAutenticada><Navigate replace to="/app/mapa" /></RutaAutenticada>} path="/app/puntos-retiro" />
        <Route element={<RutaAutenticada><PaginaPrincipal><PaginaObjetos /></PaginaPrincipal></RutaAutenticada>} path="/app/objetos" />
        <Route element={<RutaAutenticada><PaginaPrincipal /></RutaAutenticada>} path="/app/:seccion" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
