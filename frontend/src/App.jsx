import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
import PaginaPuntosRetiro from './pages/PaginaPuntosRetiro.jsx'
import {
  clearSession,
  getSessionExpiration,
  getSessionToken,
  getSessionUser,
} from './services/sessionService.js'

function SessionExpirationGuard() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!getSessionToken()) return undefined

    const expiresAt = getSessionExpiration()
    const expireSession = () => {
      clearSession()
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
    }

    if (!expiresAt || expiresAt <= Date.now()) {
      expireSession()
      return undefined
    }

    const timeoutId = window.setTimeout(expireSession, expiresAt - Date.now())
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, navigate])

  return null
}

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
      <SessionExpirationGuard />
      <Routes>
        <Route element={<RutaInicial />} path="/" />
        <Route element={<PaginaInicioSesion />} path="/login" />
        <Route element={<PaginaRegistro />} path="/registro" />
        <Route element={<RutaAdministrador><PaginaPrincipal><PaginaCategorias /></PaginaPrincipal></RutaAdministrador>} path="/admin/categorias" />
        <Route element={<RutaAdministrador><PaginaUsuarios /></RutaAdministrador>} path="/admin/usuarios" />
        <Route element={<RutaAdministrador><PaginaPrincipal><PaginaPuntosRetiro /></PaginaPrincipal></RutaAdministrador>} path="/admin/puntos-retiro" />
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
