export const normalizarRutChileno = (rut) =>
  rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase()

export const rutChilenoValido = (rut) => {
  const valor = normalizarRutChileno(rut)
  const coincidencia = /^(\d{7,8})-([0-9K])$/.exec(valor)

  if (!coincidencia) return false

  const cuerpo = coincidencia[1]
  const digitoEsperado = coincidencia[2]
  let suma = 0
  let multiplicador = 2

  for (let indice = cuerpo.length - 1; indice >= 0; indice -= 1) {
    suma += Number(cuerpo[indice]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = 11 - (suma % 11)
  const digitoCalculado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)

  return digitoCalculado === digitoEsperado
}