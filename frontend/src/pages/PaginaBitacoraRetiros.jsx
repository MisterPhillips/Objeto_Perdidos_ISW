import { useEffect, useState } from 'react'
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { apiRequestBlob } from '../config/apiClient.js'
import { listarFuncionariosConRetiros, listarRetiros } from '../services/retirosService.js'

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function ImagenRetiro({ retiro }) {
  const [imagen, setImagen] = useState({ clave: '', url: '' })
  const clave = `${retiro.objeto.id}:${retiro.objeto.imagen || ''}`

  useEffect(() => {
    if (!retiro.objeto.imagen) return undefined

    let vigente = true
    let urlTemporal = ''
    apiRequestBlob(`/objeto/${retiro.objeto.id}/imagen`).then((blob) => {
      if (!vigente) return
      urlTemporal = URL.createObjectURL(blob)
      setImagen({ clave, url: urlTemporal })
    }).catch(() => undefined)

    return () => {
      vigente = false
      if (urlTemporal) URL.revokeObjectURL(urlTemporal)
    }
  }, [clave, retiro.objeto.id, retiro.objeto.imagen])

  if (!retiro.objeto.imagen || imagen.clave !== clave || !imagen.url) return null

  return <img alt={`Fotografía de ${retiro.objeto.descripcion}`} className="size-10 rounded bg-[#e8eef1] object-contain" src={imagen.url} />
}

function PaginaBitacoraRetiros() {
  const [retiros, setRetiros] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [retiroSeleccionado, setRetiroSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [diasDesde, setDiasDesde] = useState('30')
  const [funcionarioId, setFuncionarioId] = useState('')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarFuncionariosConRetiros()
      .then((respuesta) => setFuncionarios(respuesta.funcionarios))
      .catch(() => setFuncionarios([]))
  }, [])

  useEffect(() => {
    let vigente = true
    const temporizador = setTimeout(() => {
      setCargando(true)
      listarRetiros({
        busqueda: busqueda.trim(),
        diasDesde,
        funcionarioId,
        pagina,
        limite: 6,
      }).then((respuesta) => {
        if (!vigente) return
        setRetiros(respuesta.retiros)
        setTotal(respuesta.total)
        setTotalPaginas(respuesta.totalPaginas)
        setRetiroSeleccionado((actual) => respuesta.retiros.find(({ id }) => id === actual?.id) || respuesta.retiros[0] || null)
        setError('')
      }).catch((requestError) => {
        if (vigente) {
          setRetiros([])
          setTotal(0)
          setTotalPaginas(0)
          setRetiroSeleccionado(null)
          setError(requestError.message || 'No se pudo cargar la bitácora de entregas.')
        }
      }).finally(() => {
        if (vigente) setCargando(false)
      })
    }, 300)

    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
  }, [busqueda, diasDesde, funcionarioId, pagina])

  function cambiarFiltro(setter, valor) {
    setter(valor)
    setPagina(1)
  }

  return (
    <section aria-label="Bitácora de entregas" className="mt-7">
      {error && <p className="mb-4 flex items-start gap-2 rounded-md border border-[#eccaca] bg-[#fff5f4] px-3 py-2.5 text-sm text-[#963d38]" role="alert"><AlertCircle className="mt-0.5 shrink-0" size={16} />{error}</p>}

      <div className="mb-5">
        <p className="m-0 text-sm text-[#687f8d]">Historial de todos los objetos entregados, con quién los retiró y quién los entregó.</p>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,.8fr)]">
        <section className="overflow-hidden rounded-md border border-[#dbe4e8] bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#dbe4e8] p-4">
            <div className="relative min-w-56 flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 text-[#6e8998]" size={15} />
              <input aria-label="Buscar en la bitácora" className="h-9 w-full rounded border border-[#cbd8df] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#1781a8] focus:ring-2 focus:ring-[#1781a8]/10" placeholder="Buscar por objeto, código, nombre o RUT" value={busqueda} onChange={(event) => cambiarFiltro(setBusqueda, event.target.value)} />
            </div>
            <select aria-label="Filtrar por fecha" className="h-9 rounded border border-[#cbd8df] bg-white px-2 text-xs text-[#31566a]" value={diasDesde} onChange={(event) => cambiarFiltro(setDiasDesde, event.target.value)}>
              <option value="">Fecha: Todas</option>
              <option value="7">Fecha: Últimos 7 días</option>
              <option value="30">Fecha: Últimos 30 días</option>
              <option value="90">Fecha: Últimos 90 días</option>
            </select>
            <select aria-label="Filtrar por funcionario" className="h-9 max-w-48 rounded border border-[#cbd8df] bg-white px-2 text-xs text-[#31566a]" value={funcionarioId} onChange={(event) => cambiarFiltro(setFuncionarioId, event.target.value)}>
              <option value="">Funcionario: Todos</option>
              {funcionarios.map((funcionario) => <option key={funcionario.id} value={funcionario.id}>{funcionario.nombre}</option>)}
            </select>
            <select aria-label="Filtrar por estado" className="h-9 rounded border border-[#cbd8df] bg-white px-2 text-xs text-[#31566a]" defaultValue="ENTREGADA">
              <option value="ENTREGADA">Estado: Entregadas</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left text-xs">
              <thead className="bg-[#f5f9fa] text-[10px] uppercase tracking-[.08em] text-[#658090]">
                <tr>
                  <th className="px-4 py-3 font-bold">Fecha y hora</th>
                  <th className="px-4 py-3 font-bold">Objeto</th>
                  <th className="px-4 py-3 font-bold">Retirado por</th>
                  <th className="px-4 py-3 font-bold">Entregado por</th>
                  <th className="px-4 py-3 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando && <tr><td className="px-4 py-8 text-center text-[#81929f]" colSpan="5">Cargando bitácora...</td></tr>}
                {!cargando && retiros.length === 0 && <tr><td className="px-4 py-8 text-center text-[#81929f]" colSpan="5">No hay entregas que coincidan con los filtros.</td></tr>}
                {!cargando && retiros.map((retiro) => (
                  <tr className={`cursor-pointer border-t border-[#edf1f3] transition hover:bg-[#f8fcfd] ${retiroSeleccionado?.id === retiro.id ? 'bg-[#eaf6fb]' : ''}`} key={retiro.id} onClick={() => setRetiroSeleccionado(retiro)}>
                    <td className="px-4 py-3 text-[#536d7c]">{formatoFecha.format(new Date(retiro.fechaRetiro))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ImagenRetiro retiro={retiro} />
                        <div>
                          <strong className="block text-[#193449]">{retiro.objeto.descripcion}</strong>
                          <span className="text-[11px] text-[#81929f]">ID: {retiro.objetoId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#536d7c]"><strong className="block text-[#31566a]">{retiro.nombreRetirante}</strong><span>{retiro.rutRetirante}</span></td>
                    <td className="px-4 py-3 text-[#536d7c]">{retiro.funcionario.nombre}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[#dff5e7] px-2 py-1 text-[10px] font-semibold text-[#24744e]">Entregada</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#dbe4e8] px-4 py-3 text-xs text-[#687f8d]">
            <span>Mostrando {retiros.length} de {total} entregas</span>
            <div className="flex items-center gap-1">
              <button aria-label="Página anterior" className="grid size-8 place-items-center rounded border border-[#cbd8df] disabled:opacity-40" disabled={pagina <= 1 || cargando} onClick={() => setPagina((actual) => actual - 1)} type="button"><ChevronLeft size={15} /></button>
              <span className="px-2">{pagina} / {Math.max(totalPaginas, 1)}</span>
              <button aria-label="Página siguiente" className="grid size-8 place-items-center rounded border border-[#cbd8df] disabled:opacity-40" disabled={pagina >= totalPaginas || cargando} onClick={() => setPagina((actual) => actual + 1)} type="button"><ChevronRight size={15} /></button>
            </div>
          </div>
        </section>

        <aside className="rounded-md border border-[#dbe4e8] bg-white p-5 xl:sticky xl:top-5">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-sm font-semibold text-[#193449]">Detalle de la entrega</h2>
            <span className="rounded-full bg-[#dff5e7] px-2 py-1 text-[10px] font-semibold text-[#24744e]">Entregada</span>
          </div>
          {retiroSeleccionado ? (
            <>
              <div className="mt-4 flex items-center gap-3 rounded-md border border-[#dbe4e8] bg-[#f8fcfd] p-3">
                <ImagenRetiro retiro={retiroSeleccionado} />
                <div>
                  <strong className="block text-sm text-[#193449]">{retiroSeleccionado.objeto.descripcion}</strong>
                  <span className="text-xs text-[#536d7c]">ID: {retiroSeleccionado.objetoId} · {retiroSeleccionado.objeto.puntoRetiro.nombre}</span>
                </div>
              </div>
              <p className="mb-1 mt-5 text-[10px] font-bold uppercase tracking-[.12em] text-[#658090]">Retirado por</p>
              <p className="m-0 text-sm font-semibold text-[#193449]">{retiroSeleccionado.nombreRetirante}</p>
              <p className="m-0 mt-1 text-xs text-[#536d7c]">{retiroSeleccionado.rutRetirante}</p>
              <p className="m-0 text-xs text-[#536d7c]">{retiroSeleccionado.correoRetirante}</p>
              <p className="mb-1 mt-5 text-[10px] font-bold uppercase tracking-[.12em] text-[#658090]">Registro</p>
              <p className="m-0 text-xs text-[#536d7c]">{formatoFecha.format(new Date(retiroSeleccionado.fechaRetiro))}</p>
              <p className="m-0 mt-1 text-xs text-[#536d7c]">Entregado por {retiroSeleccionado.funcionario.nombre}</p>
              <p className="mt-4 flex items-center gap-2 border-t border-[#edf1f3] pt-3 text-xs text-[#24744e]"><CalendarDays size={14} /> Registro histórico permanente</p>
            </>
          ) : <p className="mt-5 text-sm text-[#81929f]">Selecciona una entrega para ver su detalle.</p>}
        </aside>
      </div>
    </section>
  )
}

export default PaginaBitacoraRetiros
