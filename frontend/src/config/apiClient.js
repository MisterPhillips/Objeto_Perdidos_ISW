import { clearSession, getSessionToken } from '../services/sessionService.js'

const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function handleUnauthorized(status, token) {
  if (status !== 401 || !token) return

  clearSession()
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

export async function apiRequest(path, options = {}) {
  let response
  const bodyEsFormulario = typeof FormData !== 'undefined' && options.body instanceof FormData
  const token = getSessionToken()

  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body && !bodyEsFormulario ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inténtalo nuevamente más tarde.')
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    handleUnauthorized(response.status, token)
    throw new ApiError(
      payload?.message || payload?.error || 'No fue posible completar la solicitud.',
      response.status,
    )
  }

  return payload
}

export async function apiRequestBlob(path) {
  let response
  const token = getSessionToken()

  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
      headers: {
        Accept: 'image/jpeg',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inténtalo nuevamente más tarde.')
  }

  if (!response.ok) {
    handleUnauthorized(response.status, token)
    const payload = await response.json().catch(() => null)
    throw new ApiError(
      payload?.message || payload?.error || 'No fue posible cargar la imagen.',
      response.status,
    )
  }

  return response.blob()
}