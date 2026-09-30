import { ApiError, apiRequest } from '../config/apiClient.js'

export async function login({ correo, contrasena }) {
  try {
    return await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error('El servicio de inicio de sesión todavía no está disponible.', { cause: error })
    }

    throw error
  }
}

export async function register({ nombre, correo, contrasena }) {
  try {
    return await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, contrasena }),
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error('El servicio de registro todavía no está disponible.', { cause: error })
    }

    throw error
  }
}