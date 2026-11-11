import { apiRequest } from '../config/apiClient.js'

export function obtenerPuntosRetiro() {
	return apiRequest('/puntos-retiro')
}

export function crearPuntoRetiro(datos) {
	return apiRequest('/puntos-retiro', {
		method: 'POST',
		body: JSON.stringify(datos),
	})
}

export function actualizarPuntoRetiro(id, datos) {
	return apiRequest(`/puntos-retiro/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(datos),
	})
}

export function deshabilitarPuntoRetiro(id) {
	return apiRequest(`/puntos-retiro/${id}`, { method: 'DELETE' })
}
