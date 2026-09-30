import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom' 
import PaginaInicioSesion from './pages/PaginaInicioSesion.jsx'
import PaginaRegistro from './pages/PaginaRegistro.jsx'
import PaginaUsuarios from './pages/PaginaUsuarios.jsx'
import { getSessionToken, getSessionUser } from './services/sessionService.js'

function RutaAdministrador({ children }) {
  const usuario = getSessionUser()
  return getSessionToken() && usuario?.rol === 'ADMIN'
    ? children
    : <Navigate replace to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/login" />} path="/" />
        <Route element={<PaginaInicioSesion />} path="/login" />
        <Route element={<PaginaRegistro />} path="/registro" />
        <Route element={<RutaAdministrador><PaginaUsuarios /></RutaAdministrador>} path="/admin/usuarios" />
        <Route element={<Navigate replace to="/login" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
