import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom' 
import PaginaInicioSesion from './pages/PaginaInicioSesion.jsx'
import PaginaRegistro from './pages/PaginaRegistro.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navigate replace to="/login" />} path="/" />
        <Route element={<PaginaInicioSesion />} path="/login" />
        <Route element={<PaginaRegistro />} path="/registro" />
        <Route element={<Navigate replace to="/login" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
