import { apiRequest } from '../config/apiClient.js'

export const listarRetiros = (filtros) => {
  const parametros = new URLSearchParams()
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== undefined && valor !== null) {
      parametros.set(clave, String(valor))
    }
  })

  return apiRequest(`/retiros?${parametros.toString()}`)
}

export const listarFuncionariosConRetiros = () => apiRequest('/retiros/funcionarios')
