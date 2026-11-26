import { useEffect, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApiError, apiRequest } from '../config/apiClient.js'
import { clearSession } from '../services/sessionService.js'

const limite = 20
const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const etiquetasAccion = {
  CREAR: 'Creación',
  EDITAR: 'Edición',
  ACTIVAR: 'Activación',
  DESACTIVAR: 'Desactivación',
}

const etiquetasEntidad = {
  USUARIO: 'Usuario',
  CATEGORIA: 'Categoría',
}

function PaginaAuditoria() {
  const navigate = useNavigate()
  const [registros, setRegistros] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intentos, setIntentos] = useState(0)

  useEffect(() => {
    let vigente = true

    apiRequest(`/auditoria?pagina=${pagina}&limite=${limite}`)
      .then((respuesta) => {
        if (!vigente) return
        setRegistros(respuesta.registros)
        setTotal(respuesta.total)
      })
      .catch((requestError) => {
        if (!vigente) return
        if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
          clearSession()
          navigate('/login', { replace: true })
          return
        }
        setError(requestError.message || 'No se pudo cargar la bitácora de gestión.')
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [intentos, navigate, pagina])

  function reintentar() {
    setCargando(true)
    setError('')
    setIntentos((actuales) => actuales + 1)
  }

  function cambiarPagina(nuevaPagina) {
    setCargando(true)
    setError('')
    setPagina(nuevaPagina)
  }

  const totalPaginas = Math.max(1, Math.ceil(total / limite))
  const primerRegistro = total === 0 ? 0 : (pagina - 1) * limite + 1
  const ultimoRegistro = Math.min(pagina * limite, total)

  return (
    <section className="mt-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dbe4e8] pb-4">
        <p className="mb-0 text-xs font-semibold text-[#658090]">TRAZABILIDAD ADMINISTRATIVA</p>
        <p className="mb-0 text-sm">
          <span className="font-semibold">{total}</span>
          <span className="ml-1.5 text-[#687f8d]">operaciones registradas</span>
        </p>
      </div>

      <p className="mb-0 mt-4 text-sm text-[#687f8d]">
        Historial de acciones administrativas sobre usuarios y categorías. No se almacenan contraseñas.
      </p>

      {error && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">
          <span className="flex items-center gap-2"><AlertCircle size={17} />{error}</span>
          <button className="rounded border border-[#dba9a4] px-3 py-1.5 text-xs font-semibold hover:bg-white" onClick={reintentar} type="button">Reintentar</button>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-md border border-[#dbe4e8] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="bg-[#f5f8f9] text-[11px] uppercase text-[#607987]">
              <tr>
                <th className="px-5 py-3 font-semibold">Fecha y hora</th>
                <th className="px-5 py-3 font-semibold">Administrador</th>
                <th className="px-5 py-3 font-semibold">Acción</th>
                <th className="px-5 py-3 font-semibold">Registro afectado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7edef]">
              {cargando ? (
                <tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="4">Cargando bitácora...</td></tr>
              ) : registros.length === 0 ? (
                <tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="4">No hay operaciones registradas.</td></tr>
              ) : registros.map((registro) => (
                <tr className="hover:bg-[#fbfcfc]" key={registro.id}>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-[#687f8d]">{formatoFecha.format(new Date(registro.createdAt))}</td>
                  <td className="px-5 py-4">
                    <span className="block font-semibold">{registro.actor.nombre}</span>
                    <span className="mt-0.5 block text-xs text-[#718896]">{registro.actor.correo}</span>
                  </td>
                  <td className="px-5 py-4">{etiquetasAccion[registro.accion] || registro.accion}</td>
                  <td className="px-5 py-4">{etiquetasEntidad[registro.tipoEntidad] || registro.tipoEntidad} #{registro.entidadId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#687f8d]">
        <span>Mostrando {primerRegistro}-{ultimoRegistro} de {total} operaciones</span>
        <div className="flex items-center gap-2">
          <button
            aria-label="Página anterior"
            className="grid size-9 place-items-center rounded border border-[#d5e0e5] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagina <= 1 || cargando}
            onClick={() => cambiarPagina(pagina - 1)}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button
            aria-label="Página siguiente"
            className="grid size-9 place-items-center rounded border border-[#d5e0e5] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagina >= totalPaginas || cargando}
            onClick={() => cambiarPagina(pagina + 1)}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PaginaAuditoria
