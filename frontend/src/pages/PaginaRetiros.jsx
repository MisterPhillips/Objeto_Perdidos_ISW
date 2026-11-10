import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ClipboardCheck, RefreshCw } from 'lucide-react'
import { apiRequest } from '../config/apiClient.js'
import { formatearRut } from '../utils/rut.js'

const campoClase = 'h-10 w-full rounded border border-[#cbd8df] bg-white px-3 text-sm outline-none focus:border-[#1781a8]'
const formularioInicial = {
  objetoId: '',
  nombreRetirante: '',
  rutRetirante: '',
  correoRetirante: '',
  identidadVerificada: false,
}

function PaginaRetiros() {
  const [objetos, setObjetos] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  async function cargarDatos() {
    setCargando(true)
    setError('')
    try {
      const catalogo = await apiRequest('/objeto')
      setObjetos(catalogo.objetos)
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cargar la información de entregas.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let vigente = true

    async function cargarDatosIniciales() {
      try {
        const catalogo = await apiRequest('/objeto')
        if (!vigente) return
        setObjetos(catalogo.objetos)
      } catch (requestError) {
        if (vigente) setError(requestError.message || 'No se pudo cargar la información de entregas.')
      } finally {
        if (vigente) setCargando(false)
      }
    }

    void cargarDatosIniciales()
    return () => {
      vigente = false
    }
  }, [])

  function actualizarCampo(event) {
    const { name, value, checked, type } = event.target
    const valor = name === 'rutRetirante'
      ? formatearRut(value)
      : value
    setFormulario((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : valor }))
  }

  async function registrarEntrega(event) {
    event.preventDefault()
    setGuardando(true)
    setError('')
    setAviso('')

    try {
      await apiRequest('/retiros', {
        method: 'POST',
        body: JSON.stringify({
          objetoId: formulario.objetoId,
          nombreRetirante: formulario.nombreRetirante,
          rutRetirante: formulario.rutRetirante,
          correoRetirante: formulario.correoRetirante,
        }),
      })
      setFormulario(formularioInicial)
      setAviso('Entrega registrada correctamente.')
      await cargarDatos()
    } catch (requestError) {
      setError(requestError.message || 'No se pudo registrar la entrega.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section aria-label="Registro de entregas" className="mt-7">
      <form className="rounded-md border border-[#dbe4e8] bg-white p-5" onSubmit={registrarEntrega}>
          <div className="mb-5 flex items-start gap-3 border-b border-[#e7edef] pb-4">
            <span className="grid size-9 place-items-center rounded-md bg-[#e9f4f8] text-[#16769c]"><ClipboardCheck size={18} /></span>
            <div>
              <h2 className="m-0 text-base font-semibold text-[#193449]">Registrar entrega</h2>
              <p className="m-0 mt-1 text-xs text-[#687f8d]">Guarda la entrega efectiva de un objeto disponible.</p>
            </div>
          </div>

          {error && <p className="mb-4 flex items-start gap-2 rounded-md border border-[#eccaca] bg-[#fff5f4] px-3 py-2.5 text-sm text-[#963d38]" role="alert"><AlertCircle className="mt-0.5 shrink-0" size={16} />{error}</p>}
          {aviso && <p className="mb-4 flex items-start gap-2 rounded-md border border-[#c7e4d3] bg-[#f1faf4] px-3 py-2.5 text-sm text-[#24744e]" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={16} />{aviso}</p>}

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-[#31566a]" htmlFor="objetoId">Objeto</label>
                <button aria-label="Actualizar objetos disponibles" className="inline-flex items-center gap-1 text-xs font-semibold text-[#16769c] hover:text-[#0b4263] disabled:cursor-wait disabled:opacity-50" disabled={cargando || guardando} onClick={() => void cargarDatos()} title="Actualizar objetos" type="button">
                  <RefreshCw aria-hidden="true" size={14} /> Actualizar
                </button>
              </div>
              <select className={campoClase} id="objetoId" name="objetoId" onChange={actualizarCampo} required value={formulario.objetoId}>
                <option value="">Selecciona un objeto disponible</option>
                {objetos.map((objeto) => <option key={objeto.id} value={objeto.id}>{objeto.descripcion} · {objeto.puntoRetiro?.nombre}</option>)}
              </select>
              {!cargando && objetos.length === 0 && <p className="m-0 text-xs text-[#805d23]" role="status">No hay objetos disponibles. Registra uno primero o actualiza la lista.</p>}
            </div>
            <label className="grid gap-1.5 text-xs font-semibold text-[#31566a]">
              Nombre de quien retira
              <input className={campoClase} maxLength="100" name="nombreRetirante" onChange={actualizarCampo} required value={formulario.nombreRetirante} />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#31566a]">
              RUT
              <input
                aria-describedby="rut-help"
                className={campoClase}
                inputMode="numeric"
                maxLength="12"
                name="rutRetirante"
                onChange={actualizarCampo}
                pattern="[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9Kk]"
                placeholder="12.345.678-5"
                required
                value={formulario.rutRetirante}
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-[#31566a]">
              Correo
              <input className={campoClase} maxLength="150" name="correoRetirante" onChange={actualizarCampo} placeholder="correo@universidad.cl" required type="email" value={formulario.correoRetirante} />
              <span className="font-normal text-[#81929f]">Debe pertenecer a un usuario universitario registrado y activo.</span>
            </label>
            <label className="flex items-start gap-2 text-xs leading-5 text-[#536d7c]">
              <input className="mt-1 accent-[#1781a8]" name="identidadVerificada" onChange={actualizarCampo} required type="checkbox" checked={formulario.identidadVerificada} />
              Confirmo que verifiqué manualmente la identidad de la persona que retira el objeto.
            </label>
            <button className="min-h-10 rounded-md bg-[#0b4263] px-4 text-sm font-semibold text-white hover:bg-[#155779] disabled:cursor-not-allowed disabled:opacity-60" disabled={guardando || objetos.length === 0} type="submit">
              {guardando ? 'Registrando...' : 'Registrar entrega'}
            </button>
          </div>
      </form>
    </section>
  )
}

export default PaginaRetiros
