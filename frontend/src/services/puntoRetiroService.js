import { apiRequest } from '../config/apiClient.js'

export function crearPuntoRetiro(datos) {
	return apiRequest('/puntos-retiro', {
		method: 'POST',
		body: JSON.stringify(datos),
	})
}
