import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom' 
import PaginaInicioSesion from './pages/PaginaInicioSesion.jsx'
import MapaInteractivo from './pages/MapaInteractivo.jsx'
import PaginaPrincipal from './pages/PaginaPrincipal.jsx'
import PaginaRegistro from './pages/PaginaRegistro.jsx'
import PaginaUsuarios from './pages/PaginaUsuarios.jsx'
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
        <Route element={<RutaAdministrador><PaginaUsuarios /></RutaAdministrador>} path="/admin/usuarios" />
        <Route element={<RutaAutenticada><PaginaPrincipal /></RutaAutenticada>} path="/inicio" />
        <Route element={<RutaAutenticada><PaginaPrincipal><MapaInteractivo /></PaginaPrincipal></RutaAutenticada>} path="/app/mapa" />
        <Route element={<RutaAutenticada><PaginaPrincipal /></RutaAutenticada>} path="/app/:seccion" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
