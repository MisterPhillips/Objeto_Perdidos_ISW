import { useEffect, useState } from 'react'
import { AlertCircle, Pencil, Plus, Search, Tag, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApiError, apiRequest } from '../config/apiClient.js'
import { clearSession } from '../services/sessionService.js'

const formularioInicial = { nombre: '', descripcion: '' }

function PaginaCategorias() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState(formularioInicial)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [intentos, setIntentos] = useState(0)

  useEffect(() => {
    let vigente = true

    apiRequest('/categorias')
      .then((data) => {
        if (vigente) setCategorias(data.categorias)
      })
      .catch((requestError) => {
        if (!vigente) return
        if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
          clearSession()
          navigate('/login', { replace: true })
          return
        }
        setError(requestError.message || 'No se pudieron cargar las categorías.')
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [intentos, navigate])

  function reintentar() {
    setCargando(true)
    setError('')
    setIntentos((actuales) => actuales + 1)
  }

  function abrirFormulario(categoria = null) {
    setCategoriaEditando(categoria)
    setFormulario(categoria
      ? { nombre: categoria.nombre, descripcion: categoria.descripcion || '' }
      : formularioInicial)
    setError('')
    setModalAbierto(true)
  }

  async function guardarCategoria(event) {
    event.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await apiRequest(categoriaEditando ? `/categorias/${categoriaEditando.id}` : '/categorias', {
        method: categoriaEditando ? 'PATCH' : 'POST',
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          descripcion: formulario.descripcion.trim() || null,
        }),
      })
      setModalAbierto(false)
      setAviso(categoriaEditando ? 'Categoría actualizada.' : 'Categoría creada.')
      setIntentos((actuales) => actuales + 1)
    } catch (requestError) {
      setError(requestError.message || 'No se pudo guardar la categoría.')
    } finally {
      setGuardando(false)
    }
  }

  async function desactivarCategoria(categoria) {
    if (!window.confirm(`¿Desactivar la categoría "${categoria.nombre}"?`)) return
    setError('')
    setAviso('')
    try {
      await apiRequest(`/categorias/${categoria.id}`, { method: 'DELETE' })
      setAviso('Categoría desactivada.')
      setIntentos((actuales) => actuales + 1)
    } catch (requestError) {
      setError(requestError.message || 'No se pudo desactivar la categoría.')
    }
  }

  const categoriasFiltradas = categorias.filter((categoria) =>
    `${categoria.nombre} ${categoria.descripcion || ''}`.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <section className="mt-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dbe4e8] pb-4">
        <p className="mb-0 text-xs font-semibold text-[#658090]">CLASIFICACIÓN DEL CATÁLOGO</p>
        <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#0b4263] px-4 text-sm font-semibold text-white hover:bg-[#155779]" onClick={() => abrirFormulario()} type="button">
          <Plus size={17} /> Nueva categoría
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dbe4e8] py-4">
        <p className="m-0 text-sm"><span className="font-semibold">{categorias.length}</span><span className="ml-1.5 text-[#687f8d]">categorías activas</span></p>
        <label className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-md border border-[#cbd8df] bg-white px-3 focus-within:border-[#1781a8]">
          <Search className="text-[#718896]" size={16} />
          <input aria-label="Buscar categorías" className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#8999a3]" onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar categoría" value={busqueda} />
        </label>
      </div>

      {error && !modalAbierto && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">
          <span className="flex items-center gap-2"><AlertCircle size={17} />{error}</span>
          <button className="rounded border border-[#dba9a4] px-3 py-1.5 text-xs font-semibold hover:bg-white" onClick={reintentar} type="button">Reintentar</button>
        </div>
      )}
      {aviso && <p className="mt-4 rounded-md border border-[#c7e4d3] bg-[#f1faf4] px-4 py-3 text-sm text-[#24744e]" role="status">{aviso}</p>}

      <div className="mt-4 overflow-hidden rounded-md border border-[#dbe4e8] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="bg-[#f5f8f9] text-[11px] uppercase text-[#607987]">
              <tr><th className="px-5 py-3 font-semibold">Categoría</th><th className="px-5 py-3 font-semibold">Descripción</th><th className="px-5 py-3 text-right font-semibold">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e7edef]">
              {cargando ? (
                <tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="3">Cargando categorías...</td></tr>
              ) : categoriasFiltradas.length === 0 ? (
                <tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="3">No hay categorías para mostrar.</td></tr>
              ) : categoriasFiltradas.map((categoria) => (
                <tr className="hover:bg-[#fbfcfc]" key={categoria.id}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e9f4f8] text-[#16769c]"><Tag size={17} /></span><span className="font-semibold">{categoria.nombre}</span></div></td>
                  <td className="max-w-md px-5 py-4 text-[#687f8d]">{categoria.descripcion || 'Sin descripción'}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2">
                    <button aria-label={`Editar ${categoria.nombre}`} className="grid size-9 place-items-center rounded border border-[#d5e0e5] text-[#31566a] hover:bg-[#edf5f8]" onClick={() => abrirFormulario(categoria)} title="Editar categoría" type="button"><Pencil size={15} /></button>
                    <button aria-label={`Desactivar ${categoria.nombre}`} className="grid size-9 place-items-center rounded border border-[#e5cfca] text-[#a14f45] hover:bg-[#fff4f2]" onClick={() => desactivarCategoria(categoria)} title="Desactivar categoría" type="button"><X size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[#132a38]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !guardando) setModalAbierto(false) }}>
          <section aria-labelledby="category-form-title" aria-modal="true" className="my-auto w-full max-w-lg rounded-md border border-[#dbe4e8] bg-white p-6 shadow-xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div><p className="m-0 text-[10px] font-bold uppercase text-[#1781a8]">ADMINISTRACIÓN</p><h2 className="mb-0 mt-1 text-xl font-semibold text-[#193449]" id="category-form-title">{categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}</h2></div>
              <button aria-label="Cerrar" className="grid size-8 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9]" disabled={guardando} onClick={() => setModalAbierto(false)} type="button"><X size={16} /></button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={guardarCategoria}>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">Nombre
                <input autoFocus className="h-10 rounded border border-[#cbd8df] px-3 text-sm font-normal outline-none focus:border-[#1781a8]" maxLength="80" onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })} required value={formulario.nombre} />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">Descripción
                <textarea className="min-h-24 resize-y rounded border border-[#cbd8df] px-3 py-2 text-sm font-normal outline-none focus:border-[#1781a8]" onChange={(event) => setFormulario({ ...formulario, descripcion: event.target.value })} value={formulario.descripcion} />
              </label>
              {error && <p className="m-0 text-sm text-[#963d38]" role="alert">{error}</p>}
              <div className="mt-1 flex justify-end gap-2">
                <button className="rounded border border-[#cbd8df] px-4 py-2 text-sm font-semibold hover:bg-[#f3f7f9]" disabled={guardando} onClick={() => setModalAbierto(false)} type="button">Cancelar</button>
                <button className="rounded bg-[#0b4263] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155779] disabled:opacity-60" disabled={guardando} type="submit">{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default PaginaCategorias