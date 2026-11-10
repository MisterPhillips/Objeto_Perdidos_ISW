import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Filter, Search, UserCheck } from 'lucide-react'
import { apiRequest } from '../config/apiClient.js'
import { formatearRut } from '../utils/rut.js'

const campoClase = 'h-10 w-full rounded border border-[#cbd8df] bg-white px-3 text-sm outline-none transition focus:border-[#1781a8] focus:ring-2 focus:ring-[#1781a8]/10'
const formatoFecha = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' })

function PaginaRetiros() {
  const [busqueda, setBusqueda] = useState('')
  const [categorias, setCategorias] = useState([])
  const [puntosRetiro, setPuntosRetiro] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [puntoRetiroSeleccionado, setPuntoRetiroSeleccionado] = useState('')
  const [antiguedadSeleccionada, setAntiguedadSeleccionada] = useState('')
  const [objetos, setObjetos] = useState([])
  const [objetoSeleccionado, setObjetoSeleccionado] = useState(null)
  const [rutRetirante, setRutRetirante] = useState('')
  const [retirante, setRetirante] = useState(null)
  const [identidadVerificada, setIdentidadVerificada] = useState(false)
  const [buscandoObjetos, setBuscandoObjetos] = useState(false)
  const [buscandoRetirante, setBuscandoRetirante] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const campoBusquedaRef = useRef(null)

  useEffect(() => {
    let vigente = true
    Promise.all([
      apiRequest('/categorias'),
      apiRequest('/puntos-retiro?habilitado=true'),
    ]).then(([categoriasRespuesta, puntosRespuesta]) => {
      if (!vigente) return
      setCategorias(categoriasRespuesta.categorias)
      setPuntosRetiro(puntosRespuesta.puntosRetiro)
    }).catch((requestError) => {
      if (vigente) setError(requestError.message || 'No se pudieron cargar los filtros.')
    })

    return () => {
      vigente = false
    }
  }, [])

  useEffect(() => {
    const termino = busqueda.trim()
    if (termino.length < 2) {
      return undefined
    }

    let vigente = true
    const temporizador = setTimeout(async () => {
      setBuscandoObjetos(true)
      try {
        const parametros = new URLSearchParams({
          busqueda: termino,
          limite: '12',
        })
        if (categoriaSeleccionada) parametros.set('categoriaId', categoriaSeleccionada)
        if (puntoRetiroSeleccionado) parametros.set('puntoRetiroId', puntoRetiroSeleccionado)
        if (antiguedadSeleccionada) parametros.set('diasDesde', antiguedadSeleccionada)
        const catalogo = await apiRequest(`/objeto?${parametros.toString()}`)
        if (vigente) setObjetos(catalogo.objetos)
      } catch (requestError) {
        if (vigente) {
          setObjetos([])
          setError(requestError.message || 'No se pudieron buscar objetos.')
        }
      } finally {
        if (vigente) setBuscandoObjetos(false)
      }
    }, 350)

    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
  }, [antiguedadSeleccionada, busqueda, categoriaSeleccionada, puntoRetiroSeleccionado])

  async function verificarRetirante(event) {
    event.preventDefault()
    setBuscandoRetirante(true)
    setError('')
    setRetirante(null)
    try {
      const parametros = new URLSearchParams({ rutRetirante })
      const respuesta = await apiRequest(`/retiros/retirante?${parametros.toString()}`)
      setRetirante(respuesta.usuario)
    } catch (requestError) {
      setError(requestError.message || 'No se encontró un usuario activo con ese RUT.')
    } finally {
      setBuscandoRetirante(false)
    }
  }

  async function confirmarEntrega(event) {
    event.preventDefault()
    setGuardando(true)
    setError('')
    setAviso('')
    try {
      await apiRequest('/retiros', {
        method: 'POST',
        body: JSON.stringify({
          objetoId: objetoSeleccionado.id,
          rutRetirante,
        }),
      })
      setObjetos((actuales) => actuales.filter((objeto) => objeto.id !== objetoSeleccionado.id))
      setObjetoSeleccionado(null)
      setRutRetirante('')
      setRetirante(null)
      setIdentidadVerificada(false)
      setAviso('Entrega registrada correctamente. El objeto quedó marcado como entregado.')
    } catch (requestError) {
      setError(requestError.message || 'No se pudo registrar la entrega.')
    } finally {
      setGuardando(false)
    }
  }

  function cambiarObjeto() {
    setObjetoSeleccionado(null)
    setRetirante(null)
    setIdentidadVerificada(false)
    setError('')
    campoBusquedaRef.current?.focus()
  }

  const puedeConfirmar = Boolean(objetoSeleccionado && retirante && identidadVerificada && !guardando)

  return (
    <section aria-label="Registro de entregas" className="mt-7">
      {error && <p className="mb-4 flex items-start gap-2 rounded-md border border-[#eccaca] bg-[#fff5f4] px-3 py-2.5 text-sm text-[#963d38]" role="alert"><AlertCircle className="mt-0.5 shrink-0" size={16} />{error}</p>}
      {aviso && <p className="mb-4 flex items-start gap-2 rounded-md border border-[#c7e4d3] bg-[#f1faf4] px-3 py-2.5 text-sm text-[#24744e]" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={16} />{aviso}</p>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,.8fr)]">
        <div className="grid gap-5">
          <section className="rounded-md border border-[#dbe4e8] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-[#0b4263] text-xs font-bold text-white">1</span>
              <h2 className="m-0 text-sm font-semibold text-[#193449]">Buscar el objeto</h2>
            </div>
            <label className="mb-1.5 block text-xs font-semibold text-[#31566a]" htmlFor="busquedaObjeto">Descripción, categoría o punto de retiro</label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-[#6e8998]" size={16} />
              <input ref={campoBusquedaRef} autoComplete="off" className={`${campoClase} pl-9`} id="busquedaObjeto" placeholder="Comienza a escribir para buscar..." value={busqueda} onChange={(event) => { const valor = event.target.value; setBusqueda(valor); setError(''); if (valor.trim().length < 2) setObjetos([]) }} />
            </div>
            <p className="m-0 mt-2 text-xs text-[#81929f]">La búsqueda se actualiza automáticamente y muestra hasta 12 resultados.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Filter aria-hidden="true" className="text-[#6e8998]" size={15} />
              <select aria-label="Filtrar por categoría" className="h-8 rounded border border-[#cbd8df] bg-white px-2 text-xs text-[#31566a]" value={categoriaSeleccionada} onChange={(event) => setCategoriaSeleccionada(event.target.value)}>
                <option value="">Categoría: Todas</option>
                {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
              </select>
              <select aria-label="Filtrar por lugar de retiro" className="h-8 rounded border border-[#cbd8df] bg-white px-2 text-xs text-[#31566a]" value={puntoRetiroSeleccionado} onChange={(event) => setPuntoRetiroSeleccionado(event.target.value)}>
                <option value="">Lugar: Todos</option>
                {puntosRetiro.map((punto) => <option key={punto.id} value={punto.id}>{punto.nombre}</option>)}
              </select>
              <select aria-label="Filtrar por antigüedad" className="h-8 rounded border border-[#cbd8df] bg-white px-2 text-xs text-[#31566a]" value={antiguedadSeleccionada} onChange={(event) => setAntiguedadSeleccionada(event.target.value)}>
                <option value="">Fecha: Cualquier fecha</option>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
              </select>
            </div>

            {buscandoObjetos && <p className="mt-5 text-sm text-[#687f8d]" role="status">Buscando objetos disponibles...</p>}
            {!buscandoObjetos && busqueda.trim().length >= 2 && objetos.length === 0 && <p className="mt-5 rounded border border-[#eadcb8] bg-[#fffaf0] px-3 py-2.5 text-sm text-[#805d23]" role="status">No encontramos objetos disponibles. Prueba con otra palabra o ubicación.</p>}
            <div className="mt-4 grid gap-2">
              {objetos
                .filter((objeto) => !objetoSeleccionado || objeto.id === objetoSeleccionado.id)
                .map((objeto) => (
                <button className={`rounded-md border p-3 text-left transition ${objetoSeleccionado?.id === objeto.id ? 'border-[#1781a8] bg-[#eaf6fb]' : 'border-[#dbe4e8] hover:border-[#8fc8da] hover:bg-[#f8fcfd]'}`} key={objeto.id} onClick={() => { setObjetoSeleccionado(objeto); setRetirante(null); setIdentidadVerificada(false); setError('') }} type="button">
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <strong className="block text-sm text-[#193449]">{objeto.descripcion}</strong>
                      <span className="mt-1 block text-xs text-[#536d7c]">{objeto.puntoRetiro?.nombre || 'Sin punto'} · {objeto.puntoRetiro?.facultad || 'Sin facultad'}</span>
                      <span className="mt-1 block text-xs text-[#81929f]">{objeto.categoria?.nombre || 'Sin categoría'} · Registrado {formatoFecha.format(new Date(objeto.createdAt))}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#dff5e7] px-2 py-1 text-[10px] font-semibold text-[#24744e]">Disponible</span>
                  </span>
                </button>
                ))}
            </div>
          </section>

          <section className={`rounded-md border bg-white p-5 ${objetoSeleccionado ? 'border-[#dbe4e8]' : 'border-dashed border-[#c9d9e0]'}`}>
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-[#0b4263] text-xs font-bold text-white">2</span>
              <h2 className="m-0 text-sm font-semibold text-[#193449]">Identificar a quien retira</h2>
            </div>
            {!objetoSeleccionado ? (
              <p className="m-0 text-sm text-[#81929f]">Selecciona un objeto para continuar.</p>
            ) : (
              <form className="grid gap-2" onSubmit={verificarRetirante}>
                <label className="text-xs font-semibold text-[#31566a]" htmlFor="rutRetirante">RUT</label>
                <div className="flex gap-2">
                  <input aria-describedby="rut-help" className={campoClase} id="rutRetirante" inputMode="numeric" maxLength="12" placeholder="12.345.678-5" required value={rutRetirante} onChange={(event) => { setRutRetirante(formatearRut(event.target.value)); setRetirante(null); setIdentidadVerificada(false); setError('') }} />
                  <button className="inline-flex min-w-24 items-center justify-center gap-1 rounded bg-[#0b4263] px-3 text-xs font-semibold text-white hover:bg-[#155779] disabled:opacity-50" disabled={buscandoRetirante || guardando} type="submit">
                    <UserCheck aria-hidden="true" size={14} /> Verificar
                  </button>
                </div>
                <span className="text-xs text-[#81929f]" id="rut-help">Se validará contra usuarios universitarios activos.</span>
              </form>
            )}
          </section>
        </div>

        <aside className="rounded-md border border-[#dbe4e8] bg-white p-5 xl:sticky xl:top-5">
          <h2 className="m-0 text-sm font-semibold text-[#193449]">Resumen de la entrega</h2>
          <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-[.12em] text-[#658090]">Objeto</p>
          {objetoSeleccionado ? (
            <div className="rounded-md border border-[#dbe4e8] bg-[#f8fcfd] p-3">
              <strong className="block text-sm text-[#193449]">{objetoSeleccionado.descripcion}</strong>
              <span className="mt-1 block text-xs text-[#536d7c]">{objetoSeleccionado.id} · {objetoSeleccionado.puntoRetiro?.nombre}</span>
              <button className="mt-3 text-xs font-semibold text-[#1781a8] underline-offset-2 hover:underline" onClick={cambiarObjeto} type="button">
                Cambiar objeto
              </button>
            </div>
          ) : <p className="m-0 rounded-md bg-[#f5f9fa] p-3 text-xs text-[#81929f]">Aún no seleccionas un objeto.</p>}

          <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-[.12em] text-[#658090]">Persona encontrada</p>
          {retirante ? (
            <div className="rounded-md border border-[#b8dec5] bg-[#f3fbf5] p-3">
              <strong className="block text-sm text-[#193449]">{retirante.nombre}</strong>
              <span className="mt-1 block text-xs text-[#536d7c]">{retirante.rut} · {retirante.correo}</span>
            </div>
          ) : <p className="m-0 rounded-md bg-[#f5f9fa] p-3 text-xs text-[#81929f]">Verifica el RUT para identificar al retirante.</p>}

          <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#536d7c]">
            <input className="mt-1 accent-[#1781a8]" checked={identidadVerificada} disabled={!retirante} onChange={(event) => setIdentidadVerificada(event.target.checked)} type="checkbox" />
            Los datos coinciden con la persona que está frente a mí.
          </label>
          <button className="mt-4 min-h-10 w-full rounded-md bg-[#0b4263] px-4 text-sm font-semibold text-white hover:bg-[#155779] disabled:cursor-not-allowed disabled:opacity-60" disabled={!puedeConfirmar} onClick={confirmarEntrega} type="button">
            {guardando ? 'Registrando...' : 'Registrar entrega'}
          </button>
        </aside>
      </div>
    </section>
  )
}

export default PaginaRetiros
