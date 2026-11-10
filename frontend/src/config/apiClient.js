import { getSessionToken } from '../services/sessionService.js'

const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, options = {}) {
  let response
  const bodyEsFormulario = typeof FormData !== 'undefined' && options.body instanceof FormData

  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body && !bodyEsFormulario ? { 'Content-Type': 'application/json' } : {}),
        ...(getSessionToken() ? { Authorization: `Bearer ${getSessionToken()}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inténtalo nuevamente más tarde.')
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      payload?.message || payload?.error || 'No fue posible completar la solicitud.',
      response.status,
    )
  }

  return payload
}

export async function apiRequestBlob(path) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
      headers: {
        Accept: 'image/jpeg',
        ...(getSessionToken() ? { Authorization: `Bearer ${getSessionToken()}` } : {}),
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inténtalo nuevamente más tarde.')
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new ApiError(
      payload?.message || payload?.error || 'No fue posible cargar la imagen.',
      response.status,
    )
  }

  return response.blob()
}