import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ImagePlus, MapPin, PackageCheck, PackageOpen, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, apiRequestBlob } from '../config/apiClient.js'
import { getSessionUser } from '../services/sessionService.js'

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' })
const campoClase = 'h-10 rounded border border-[#cbd8df] bg-white px-3 text-sm font-normal outline-none focus:border-[#1781a8]'
const obtenerIdObjeto = (id) => {
  const valor = Number(id)
  return Number.isSafeInteger(valor) && valor > 0 ? valor : null
}

function MarcoImagen({ src, alt, clase = '' }) {
  return (
    <div className={`relative aspect-[16/9] overflow-hidden rounded bg-[#e8eef1] ${clase}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-50 blur-md"
        style={{ backgroundImage: `url("${src}")` }}
      />
      <img alt={alt} className="relative z-10 size-full object-contain" src={src} />
    </div>
  )
}

function ImagenObjeto({ objeto, clase = '' }) {
  const [imagenCargada, setImagenCargada] = useState({ clave: '', url: '', error: '' })
  const esFuncionario = getSessionUser()?.rol === 'FUNCIONARIO'
  const clave = `${objeto?.id}:${objeto?.imagen}:${objeto?.objetoPrivado}:${esFuncionario}`

  useEffect(() => {
    if (!objeto?.imagen || (objeto.objetoPrivado && !esFuncionario)) return undefined

    let vigente = true
    let urlTemporal = ''
    apiRequestBlob(`/objeto/${objeto.id}/imagen`)
      .then((blob) => {
        if (!vigente) return
        urlTemporal = URL.createObjectURL(blob)
        setImagenCargada({ clave, url: urlTemporal, error: '' })
      })
      .catch((requestError) => {
        if (vigente) {
          setImagenCargada({ clave, url: '', error: requestError.message || 'No se pudo cargar la imagen.' })
        }
      })

    return () => {
      vigente = false
      if (urlTemporal) URL.revokeObjectURL(urlTemporal)
    }
  }, [objeto?.id, objeto?.imagen, objeto?.objetoPrivado, esFuncionario, clave])

  if (!objeto?.imagen || (objeto.objetoPrivado && !esFuncionario)) return null
  if (imagenCargada.clave !== clave) return null
  if (imagenCargada.error) return <p className="m-0 rounded bg-[#fff5f4] p-3 text-xs text-[#963d38]" role="alert">{imagenCargada.error}</p>
  if (!imagenCargada.url) return null
  return <MarcoImagen alt={`Fotografía del objeto: ${objeto.descripcion || 'objeto encontrado'}`} clase={clase} src={imagenCargada.url} />
}

function PaginaObjetos() {
  const navigate = useNavigate()
  const [objetos, setObjetos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [puntosRetiro, setPuntosRetiro] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [objetoEditando, setObjetoEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [imagenArchivo, setImagenArchivo] = useState(null)
  const [imagenPreview, setImagenPreview] = useState('')
  const imagenPreviewRef = useRef('')
  const [intentos, setIntentos] = useState(0)
  const [formulario, setFormulario] = useState({ descripcion: '', categoriaId: '', puntoRetiroId: '', objetoPrivado: false })
  const esFuncionario = getSessionUser()?.rol === 'FUNCIONARIO'
  const [documentoModalAbierto, setDocumentoModalAbierto] = useState(false)
  const [documentoEditando, setDocumentoEditando] = useState(null)
  const [formularioDocumento, setFormularioDocumento] = useState({ nombrePropietario: '', rutPropietario: '', descripcion: '', puntoRetiroId: '' })
  const [guardandoDocumento, setGuardandoDocumento] = useState(false)
  const [errorDocumento, setErrorDocumento] = useState('')

  useEffect(() => () => {
    if (imagenPreviewRef.current) URL.revokeObjectURL(imagenPreviewRef.current)
  }, [])

  function limpiarImagenSeleccionada() {
    if (imagenPreviewRef.current) URL.revokeObjectURL(imagenPreviewRef.current)
    imagenPreviewRef.current = ''
    setImagenPreview('')
    setImagenArchivo(null)
  }

  function cerrarFormulario() {
    if (guardando) return
    setModalAbierto(false)
    limpiarImagenSeleccionada()
  }

  function cerrarFormularioDocumento() {
    if (guardandoDocumento) return
    setDocumentoModalAbierto(false)
    setDocumentoEditando(null)
    setFormularioDocumento({ nombrePropietario: '', rutPropietario: '', descripcion: '', puntoRetiroId: '' })
    setErrorDocumento('')
  }

  useEffect(() => {
    let vigente = true

    Promise.all([
      apiRequest('/objeto'),
      apiRequest('/categorias'),
      apiRequest('/puntos-retiro?habilitado=true'),
    ])
      .then(([catalogo, listaCategorias, listaPuntos]) => {
        if (!vigente) return
        setObjetos(catalogo.objetos)
        setCategorias(listaCategorias.categorias)
        setPuntosRetiro(listaPuntos.puntosRetiro)
      })
      .catch((requestError) => {
        if (vigente) setError(requestError.message || 'No se pudo cargar la información de objetos.')
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [intentos])

  function reintentar() {
    setError('')
    setCargando(true)
    setIntentos((actuales) => actuales + 1)
  }

  function abrirFormulario(objeto = null) {
    setErrorFormulario('')
    limpiarImagenSeleccionada()
    if (objeto && !obtenerIdObjeto(objeto.id)) {
      setErrorAccion('No se puede editar este objeto porque no tiene un identificador válido.')
      return
    }
    setObjetoEditando(objeto)
    setFormulario(objeto ? {
      descripcion: objeto.descripcion,
      categoriaId: String(objeto.categoriaId),
      puntoRetiroId: String(objeto.puntoRetiroId),
      objetoPrivado: objeto.objetoPrivado,
    } : { descripcion: '', categoriaId: '', puntoRetiroId: '', objetoPrivado: false })
    setModalAbierto(true)
  }

  function abrirFormularioDocumento(objeto = null) {
    setErrorDocumento('')
    if (objeto && !obtenerIdObjeto(objeto.id)) {
      setErrorAccion('No se puede editar este documento porque no tiene un identificador válido.')
      return
    }

    setDocumentoEditando(objeto)
    setFormularioDocumento(objeto ? {
      nombrePropietario: objeto.nombrePropietario || '',
      rutPropietario: objeto.rutPropietario || '',
      descripcion: objeto.descripcion || '',
      puntoRetiroId: String(objeto.puntoRetiroId),
    } : {
      nombrePropietario: '',
      rutPropietario: '',
      descripcion: '',
      puntoRetiroId: '',
    })
    setDocumentoModalAbierto(true)
  }

  function abrirEdicion(objeto) {
    if (objeto.categoria?.nombre === 'Documento personal') {
      abrirFormularioDocumento(objeto)
      return
    }

    abrirFormulario(objeto)
  }

  async function guardarObjeto(event) {
    event.preventDefault()
    const objetoId = objetoEditando ? obtenerIdObjeto(objetoEditando.id) : null
    if (objetoEditando && !objetoId) {
      setErrorFormulario('El objeto seleccionado no tiene un identificador válido. Cierra la edición y usa “Nuevo objeto perdido” para registrar uno nuevo.')
      return
    }

    setGuardando(true)
    setErrorFormulario('')

    try {
      const datos = new FormData()
      datos.append('descripcion', formulario.descripcion.trim())
      datos.append('categoriaId', String(Number(formulario.categoriaId)))
      datos.append('puntoRetiroId', String(Number(formulario.puntoRetiroId)))
      datos.append('objetoPrivado', String(formulario.objetoPrivado))
      if (imagenArchivo) datos.append('imagen', imagenArchivo)

      const respuesta = await apiRequest(objetoId ? `/objeto/${objetoId}` : '/objeto', {
        method: objetoId ? 'PATCH' : 'POST',
        body: datos,
      })
      setModalAbierto(false)
      setObjetoEditando(null)
      limpiarImagenSeleccionada()
      setFormulario({ descripcion: '', categoriaId: '', puntoRetiroId: '', objetoPrivado: false })
      if (objetoId) {
        setObjetos((actuales) => actuales.map((objeto) => objeto.id === respuesta.objeto.id ? respuesta.objeto : objeto).filter((objeto) => !objeto.objetoPrivado))
        setAviso('Objeto actualizado.')
      } else {
        setAviso('Objeto registrado y disponible en el catálogo.')
        setIntentos((actuales) => actuales + 1)
      }
    } catch (requestError) {
      setErrorFormulario(requestError.message || 'No se pudo registrar el objeto.')
    } finally {
      setGuardando(false)
    }
  }

  async function guardarDocumento(event) {
    event.preventDefault()
    setGuardandoDocumento(true)
    setErrorDocumento('')
    const esEdicion = documentoEditando !== null

    try {
      const respuesta = await apiRequest(
        esEdicion
          ? `/objeto/${documentoEditando.id}/documento`
          : '/objeto/documento',
        {
          method: esEdicion ? 'PATCH' : 'POST',
            body: JSON.stringify({
              nombrePropietario: formularioDocumento.nombrePropietario.trim(),
              rutPropietario: formularioDocumento.rutPropietario.trim(),
              descripcion: formularioDocumento.descripcion.trim(),
              puntoRetiroId: Number(formularioDocumento.puntoRetiroId),
            }),
        },
      )

      setDocumentoModalAbierto(false)
      setDocumentoEditando(null)
      setFormularioDocumento({ nombrePropietario: '', rutPropietario: '', descripcion: '', puntoRetiroId: '' })
      if (esEdicion) {
        setObjetos((actuales) => actuales.map((objeto) => (
          objeto.id === respuesta.objeto.id ? respuesta.objeto : objeto
        )))
        setAviso('Documento actualizado.')
      } else {
        setAviso('Documento registrado y disponible en el catálogo.')
        setIntentos((actuales) => actuales + 1)
      }
    } catch (requestError) {
      setErrorDocumento(requestError.message || 'No se pudo registrar el documento.')
    } finally {
      setGuardandoDocumento(false)
    }
  }

  async function eliminarObjeto(objeto) {
    if (!window.confirm(`¿Eliminar el objeto "${objeto.descripcion}"? Esta acción no se puede deshacer.`)) return
    setErrorAccion('')
    setGuardando(true)
    try {
      await apiRequest(`/objeto/${objeto.id}`, { method: 'DELETE' })
      setObjetos((actuales) => actuales.filter((actual) => actual.id !== objeto.id))
      setAviso('Objeto eliminado.')
    } catch (requestError) {
      setErrorAccion(requestError.message || 'No se pudo eliminar el objeto.')
    } finally {
      setGuardando(false)
    }
  }

  const puedeRegistrar = esFuncionario && categorias.length > 0 && puntosRetiro.length > 0

  return (
    <section aria-label="Objetos encontrados" className="mt-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#dbe4e8] pb-4">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#658090]">CATÁLOGO DISPONIBLE</p>
          <p className="m-0 text-sm text-[#687f8d]">Consulta los objetos encontrados y dónde retirarlos.</p>
        </div>
        {esFuncionario && (
          <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#0b4263] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#155779] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!puedeRegistrar}
            onClick={() => abrirFormulario()}
            type="button"
          >
            <Plus aria-hidden="true" size={17} /> Nuevo objeto perdido
          </button>

          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#0b4263] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#155779] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={puntosRetiro.length === 0}
            onClick={() => abrirFormularioDocumento()}
            type="button"
          >
            <Plus aria-hidden="true" size={17} /> Nuevo documento perdido
          </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">
          <span className="flex items-center gap-2"><AlertCircle aria-hidden="true" size={17} />{error}</span>
          <button className="rounded border border-[#dba9a4] px-3 py-1.5 text-xs font-semibold hover:bg-white" onClick={reintentar} type="button">Reintentar</button>
        </div>
      )}
      {aviso && <p className="rounded-md border border-[#c7e4d3] bg-[#f1faf4] px-4 py-3 text-sm text-[#24744e]" role="status">{aviso}</p>}
      {errorAccion && <p className="rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">{errorAccion}</p>}
      {esFuncionario && !cargando && !error && !puedeRegistrar && (
        <p className="rounded-md border border-[#e8d9b8] bg-[#fff9ec] px-4 py-3 text-sm text-[#805d23]" role="status">
          Para registrar objetos debe existir al menos una categoría activa y un punto de retiro habilitado.
        </p>
      )}

      {cargando ? (
        <div aria-label="Cargando objetos" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" role="status">
          {[1, 2, 3].map((item) => <div className="h-32 animate-pulse rounded-md border border-[#dbe4e8] bg-white" key={item} />)}
        </div>
      ) : !error && objetos.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#cbd8df] bg-white px-5 py-12 text-center">
          <PackageOpen aria-hidden="true" className="mx-auto text-[#7b929f]" size={24} />
          <p className="mb-0 mt-3 text-sm font-semibold text-[#31566a]">No hay objetos disponibles en el catálogo.</p>
        </div>
      ) : !error && (
        <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {objetos.map((objeto) => (
            <article className="rounded-md border border-[#dbe4e8] bg-white p-4" key={objeto.id}>
              <ImagenObjeto clase="mb-4 w-full" objeto={objeto} />
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e9f4f8] text-[#16769c]">
                  <PackageOpen aria-hidden="true" size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 wrap-break-word text-sm font-semibold text-[#193449]">{objeto.descripcion}</h2>
                  <p className="m-0 mt-1 text-xs text-[#687f8d]">{objeto.categoria?.nombre || 'Sin categoría'}</p>
                </div>
              </div>

            {esFuncionario && (objeto.nombrePropietario || objeto.rutPropietario) && (
              <p className="mb-0 mt-2 text-xs text-[#536d7c]">
                Propietario: {objeto.nombrePropietario}
                {objeto.rutPropietario && ` · RUT: ${objeto.rutPropietario}`}
              </p>
            )}

              <p className={`mb-0 mt-3 inline-flex rounded px-2 py-1 text-[11px] font-semibold ${objeto.estado === 'ENTREGADO' ? 'bg-[#edf0f2] text-[#687783]' : 'bg-[#e8f5ed] text-[#24744e]'}`}>
                {objeto.estado === 'ENTREGADO' ? 'Entregado' : 'Disponible'}
              </p>
              <p className="mb-0 mt-4 flex items-start gap-2 border-t border-[#e7edef] pt-3 text-xs text-[#536d7c]">
                <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[#1781a8]" size={14} />
                <span>{objeto.puntoRetiro?.nombre} · {objeto.puntoRetiro?.facultad}</span>
              </p>
              <p className="mb-0 mt-2 text-[11px] text-[#81929f]">Registrado el {formatoFecha.format(new Date(objeto.createdAt))}</p>
              {esFuncionario && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e7edef] pt-3">
                  <button aria-label={`Editar ${objeto.descripcion}`} className="inline-flex min-h-9 items-center gap-1.5 rounded border border-[#cbd8df] px-3 text-xs font-semibold text-[#31566a] hover:bg-[#f3f7f9] disabled:cursor-not-allowed disabled:opacity-50" disabled={guardando || guardandoDocumento} onClick={() => abrirEdicion(objeto)} type="button">
                    <Pencil aria-hidden="true" size={14} /> Editar
                  </button>
                  <button className="inline-flex min-h-9 items-center gap-1.5 rounded border border-[#b7d9c4] px-3 text-xs font-semibold text-[#24744e] hover:bg-[#f1faf4] disabled:cursor-not-allowed disabled:opacity-50" disabled={guardando} onClick={() => navigate('/funcionario/retiros')} type="button">
                    <PackageCheck aria-hidden="true" size={14} /> Entregar
                  </button>
                  <button aria-label={`Eliminar ${objeto.descripcion}`} className="inline-flex min-h-9 items-center gap-1.5 rounded border border-[#e6c5c2] px-3 text-xs font-semibold text-[#963d38] hover:bg-[#fff5f4] disabled:cursor-not-allowed disabled:opacity-50" disabled={guardando} onClick={() => eliminarObjeto(objeto)} type="button">
                    <Trash2 aria-hidden="true" size={14} /> Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[#132a38]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) cerrarFormulario() }}>
          <section aria-labelledby="object-form-title" aria-modal="true" className="my-auto w-full max-w-lg rounded-md border border-[#dbe4e8] bg-white p-6 shadow-xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[10px] font-bold uppercase text-[#1781a8]">OBJETOS ENCONTRADOS</p>
                <h2 className="mb-0 mt-1 text-xl font-semibold text-[#193449]" id="object-form-title">{objetoEditando ? 'Editar objeto encontrado' : 'Registrar objeto perdido'}</h2>
              </div>
              <button aria-label="Cerrar" className="grid size-8 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9] disabled:opacity-50" disabled={guardando} onClick={cerrarFormulario} type="button"><X size={16} /></button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={guardarObjeto}>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                Descripción
                <textarea className="min-h-24 resize-y rounded border border-[#cbd8df] px-3 py-2 text-sm font-normal outline-none focus:border-[#1781a8]" maxLength="150" onChange={(event) => setFormulario({ ...formulario, descripcion: event.target.value })} placeholder="Describe el objeto encontrado" required value={formulario.descripcion} />
              </label>
              <div className="grid gap-2">
                <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                  Fotografía (opcional)
                  <span className="flex min-h-11 cursor-pointer items-center gap-2 rounded border border-dashed border-[#9fb5c1] bg-[#f7f9fa] px-3 text-sm font-medium text-[#31566a] hover:bg-[#eef5f7]">
                    <ImagePlus aria-hidden="true" size={17} />
                    {imagenArchivo ? 'Cambiar fotografía' : objetoEditando?.imagen ? 'Reemplazar fotografía actual' : 'Seleccionar fotografía'}
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const archivo = event.target.files?.[0]
                        if (!archivo) return
                        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
                        if (!tiposPermitidos.includes(archivo.type)) {
                          limpiarImagenSeleccionada()
                          setErrorFormulario('La imagen debe estar en formato JPG, PNG o WebP.')
                          event.target.value = ''
                          return
                        }
                        if (archivo.size > 5 * 1024 * 1024) {
                          limpiarImagenSeleccionada()
                          setErrorFormulario('La imagen no puede superar los 5 MB.')
                          event.target.value = ''
                          return
                        }
                        setErrorFormulario('')
                        if (imagenPreviewRef.current) URL.revokeObjectURL(imagenPreviewRef.current)
                        imagenPreviewRef.current = URL.createObjectURL(archivo)
                        setImagenPreview(imagenPreviewRef.current)
                        setImagenArchivo(archivo)
                      }}
                      type="file"
                    />
                  </span>
                </label>
                <p className="m-0 text-xs font-normal text-[#718896]">JPG, PNG o WebP; máximo 5 MB. Se reduce y convierte a JPG al guardar.</p>
                {imagenPreview ? (
                  <MarcoImagen alt="Vista previa de la fotografía seleccionada" clase="w-full" src={imagenPreview} />
                ) : objetoEditando?.imagen ? (
                  <ImagenObjeto clase="w-full" objeto={objetoEditando} />
                ) : null}
              </div>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                Categoría
                <select className={campoClase} onChange={(event) => setFormulario({ ...formulario, categoriaId: event.target.value })} required value={formulario.categoriaId}>
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                Punto de retiro
                <select className={campoClase} onChange={(event) => setFormulario({ ...formulario, puntoRetiroId: event.target.value })} required value={formulario.puntoRetiroId}>
                  <option value="">Selecciona un punto habilitado</option>
                  {puntosRetiro.map((punto) => <option key={punto.id} value={punto.id}>{punto.nombre} · {punto.facultad}</option>)}
                </select>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded border border-[#dbe4e8] bg-[#f7f9fa] p-3">
                <input
                  checked={formulario.objetoPrivado}
                  className="mt-0.5 size-4 accent-[#0b4263]"
                  onChange={(event) => setFormulario({ ...formulario, objetoPrivado: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  <span className="block text-xs font-semibold text-[#405d6d]">Objeto privado</span>
                  <span className="mt-1 block text-xs font-normal text-[#718896]">La descripción y la fotografía solo serán visibles para funcionarios.</span>
                </span>
              </label>
              {errorFormulario && <p className="m-0 text-sm text-[#963d38]" role="alert">{errorFormulario}</p>}
              <div className="mt-1 flex justify-end gap-2">
                <button className="rounded border border-[#cbd8df] px-4 py-2 text-sm font-semibold hover:bg-[#f3f7f9] disabled:opacity-50" disabled={guardando} onClick={cerrarFormulario} type="button">Cancelar</button>
                <button className="rounded bg-[#0b4263] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155779] disabled:opacity-60" disabled={guardando} type="submit">{guardando ? 'Guardando...' : objetoEditando ? 'Guardar cambios' : 'Registrar objeto'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {documentoModalAbierto && (
        <div
          className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[#132a38]/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarFormularioDocumento()
          }}
        >
          <section aria-labelledby="document-form-title" aria-modal="true" className="my-auto w-full max-w-lg rounded-md border border-[#dbe4e8] bg-white p-6 shadow-xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[10px] font-bold uppercase text-[#1781a8]">OBJETOS ENCONTRADOS</p>
                <h2 className="mb-0 mt-1 text-xl font-semibold text-[#193449]" id="document-form-title">
                  {documentoEditando ? 'Editar documento personal' : 'Registrar documento perdido'}
                </h2>
              </div>
              <button aria-label="Cerrar" className="grid size-8 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9] disabled:opacity-50" disabled={guardandoDocumento} onClick={cerrarFormularioDocumento} type="button">
                <X size={16} />
              </button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={guardarDocumento}>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                Nombre del propietario
                <input
                  autoComplete="name"
                  className={campoClase}
                  maxLength="100"
                  onChange={(event) => setFormularioDocumento({ ...formularioDocumento, nombrePropietario: event.target.value })}
                  required
                  value={formularioDocumento.nombrePropietario}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                RUT del propietario (opcional)
                <input
                  autoComplete="off"
                  className={campoClase}
                  maxLength="20"
                  onChange={(event) => setFormularioDocumento({ ...formularioDocumento, rutPropietario: event.target.value })}
                  value={formularioDocumento.rutPropietario}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                Descripción del documento
                <textarea
                  className="min-h-24 resize-y rounded border border-[#cbd8df] px-3 py-2 text-sm font-normal outline-none focus:border-[#1781a8]"
                  maxLength="150"
                  onChange={(event) => setFormularioDocumento({ ...formularioDocumento, descripcion: event.target.value })}
                  required
                  value={formularioDocumento.descripcion}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
                Punto de retiro
                <select
                  className={campoClase}
                  onChange={(event) => setFormularioDocumento({ ...formularioDocumento, puntoRetiroId: event.target.value })}
                  required
                  value={formularioDocumento.puntoRetiroId}
                >
                  <option value="">Selecciona un punto habilitado</option>
                  {puntosRetiro.map((punto) => <option key={punto.id} value={punto.id}>{punto.nombre} · {punto.facultad}</option>)}
                </select>
              </label>
              {errorDocumento && <p className="m-0 text-sm text-[#963d38]" role="alert">{errorDocumento}</p>}
              <div className="mt-1 flex justify-end gap-2">
                <button className="rounded border border-[#cbd8df] px-4 py-2 text-sm font-semibold hover:bg-[#f3f7f9] disabled:opacity-50" disabled={guardandoDocumento} onClick={cerrarFormularioDocumento} type="button">
                  Cancelar
                </button>
                <button className="rounded bg-[#0b4263] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155779] disabled:opacity-60" disabled={guardandoDocumento} type="submit">
                  {guardandoDocumento ? 'Guardando...': documentoEditando? 'Guardar cambios': 'Registrar documento'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

    </section>
  )
}

export default PaginaObjetos