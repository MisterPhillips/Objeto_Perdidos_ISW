import { Navigate } from 'react-router-dom'
import { getSessionToken, getSessionUser } from '../services/sessionService.js'

// Si no hay sesión iniciada, devuelve al usuario al login.
function RutaProtegida({ children }) {
  return getSessionToken() && getSessionUser()
    ? children
    : <Navigate replace to="/login" />
}

export default RutaProtegida
