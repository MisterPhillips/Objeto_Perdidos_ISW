import { getSessionToken } from '../services/sessionService.js'

const configuredApiUrl = import.meta.env.VITE_API_URL || '/api'
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

  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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