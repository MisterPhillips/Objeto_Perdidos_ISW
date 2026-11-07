export function formatearRut(valor) {
  const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9)

  if (limpio.length < 8) return limpio

  const cuerpo = limpio.slice(0, -1)
  const digitoVerificador = limpio.slice(-1)
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpoConPuntos}-${digitoVerificador}`
}