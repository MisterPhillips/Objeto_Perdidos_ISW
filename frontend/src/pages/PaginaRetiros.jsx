import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ClipboardCheck, History, PackageOpen } from 'lucide-react'
import { apiRequest } from '../config/apiClient.js'

const campoClase = 'h-10 w-full rounded border border-[#cbd8df] bg-white px-3 text-sm outline-none focus:border-[#1781a8]'
const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
const formularioInicial = {
  objetoId: '',
  nombreRetirante: '',
  rutRetirante: '',
  correoRetirante: '',
  identidadVerificada: false,
}

function PaginaRetiros() {
  const [objetos, setObjetos] = useState([])
  const [retiros, setRetiros] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  async function cargarDatos() {
    setCargando(true)
    setError('')
    try {
      const [catalogo, historial] = await Promise.all([
        apiRequest('/objeto'),
        apiRequest('/retiros'),
      ])
      setObjetos(catalogo.objetos)
      setRetiros(historial.retiros)
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
        const [catalogo, historial] = await Promise.all([
          apiRequest('/objeto'),
          apiRequest('/retiros'),
        ])
        if (!vigente) return
        setObjetos(catalogo.objetos)
        setRetiros(historial.retiros)
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
      setAviso('Entrega registrada correctamente y agregada a la bitácora.')
      await cargarDatos()
    } catch (requestError) {
      setError(requestError.message || 'No se pudo registrar la entrega.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section aria-label="Registro de entregas" className="mt-7 grid gap-7">
      <div className="grid gap-7 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
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
            <label className="grid gap-1.5 text-xs font-semibold text-[#31566a]">
              Objeto
              <select className={campoClase} name="objetoId" onChange={actualizarCampo} required value={formulario.objetoId}>
                <option value="">Selecciona un objeto disponible</option>
                {objetos.map((objeto) => <option key={objeto.id} value={objeto.id}>{objeto.descripcion} · {objeto.puntoRetiro?.nombre}</option>)}
              </select>
            </label>
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

        <section className="rounded-md border border-[#dbe4e8] bg-white p-5">
          <div className="mb-5 flex items-start gap-3 border-b border-[#e7edef] pb-4">
            <span className="grid size-9 place-items-center rounded-md bg-[#e9f4f8] text-[#16769c]"><History size={18} /></span>
            <div>
              <h2 className="m-0 text-base font-semibold text-[#193449]">Bitácora de retiros</h2>
              <p className="m-0 mt-1 text-xs text-[#687f8d]">Historial privado de entregas realizadas.</p>
            </div>
          </div>
          {cargando ? <p className="text-sm text-[#687f8d]">Cargando historial...</p> : retiros.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#687f8d]"><PackageOpen className="mx-auto mb-2 text-[#7b929f]" size={24} />Aún no hay entregas registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                <thead><tr className="border-b border-[#dbe4e8] text-[#658090]"><th className="px-3 py-2 font-semibold">Objeto</th><th className="px-3 py-2 font-semibold">Retirante</th><th className="px-3 py-2 font-semibold">Contacto</th><th className="px-3 py-2 font-semibold">Fecha</th></tr></thead>
                <tbody>{retiros.map((retiro) => <tr className="border-b border-[#edf2f4] text-[#31566a]" key={retiro.id}><td className="px-3 py-3 font-semibold">{retiro.objeto?.descripcion}</td><td className="px-3 py-3">{retiro.nombreRetirante}<br /><span className="text-[#81929f]">{retiro.rutRetirante}</span></td><td className="px-3 py-3">{retiro.correoRetirante}</td><td className="px-3 py-3 whitespace-nowrap">{formatoFecha.format(new Date(retiro.fechaRetiro))}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default PaginaRetiros
