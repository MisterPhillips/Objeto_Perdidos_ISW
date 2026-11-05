import { apiRequest } from '../config/apiClient.js'

export function obtenerPuntosRetiroMapa() {
	return apiRequest('/puntos-retiro/mapa')
}

export function obtenerObjetosPuntoRetiro(puntoRetiroId) {
	return apiRequest(`/puntos-retiro/${puntoRetiroId}/objetos`)
}
