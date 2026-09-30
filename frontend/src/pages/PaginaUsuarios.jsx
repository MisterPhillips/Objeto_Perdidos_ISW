import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Pencil, Plus, Search, UserRound, UserRoundX, X } from 'lucide-react'
import { ApiError, apiRequest } from '../config/apiClient.js'
import { clearSession, getSessionUser } from '../services/sessionService.js'

const formularioInicial = { nombre: '', correo: '', rol: 'ESTUDIANTE', contrasena: '' }
const roles = ['ESTUDIANTE', 'FUNCIONARIO', 'ADMIN']

function PaginaUsuarios() {
  const navigate = useNavigate()
  const usuarioActual = getSessionUser()
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState(formularioInicial)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  async function cargarUsuarios() {
    setCargando(true)
    setError('')
    try {
      const data = await apiRequest('/usuarios')
      setUsuarios(data.usuarios)
    } catch (requestError) {
      if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
        clearSession()
        navigate('/login', { replace: true })
        return
      }
      setError(requestError.message || 'No se pudo cargar la lista de usuarios.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  function abrirCreacion() {
    setUsuarioEditando(null)
    setFormulario(formularioInicial)
    setError('')
    setModalAbierto(true)
  }

  function abrirEdicion(usuario) {
    setUsuarioEditando(usuario)
    setFormulario({ nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, contrasena: '' })
    setError('')
    setModalAbierto(true)
  }

  async function guardarUsuario(event) {
    event.preventDefault()
    setGuardando(true)
    setError('')
    const datos = { ...formulario }
    if (usuarioEditando && !datos.contrasena) delete datos.contrasena

    try {
      await apiRequest(usuarioEditando ? `/usuarios/${usuarioEditando.id}` : '/usuarios', {
        method: usuarioEditando ? 'PATCH' : 'POST',
        body: JSON.stringify(datos),
      })
      setModalAbierto(false)
      setAviso(usuarioEditando ? 'Usuario actualizado.' : 'Usuario creado.')
      await cargarUsuarios()
    } catch (requestError) {
      setError(requestError.message || 'No se pudo guardar el usuario.')
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(usuario) {
    const accion = usuario.activo ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿Quieres ${accion} la cuenta de ${usuario.nombre}?`)) return

    setError('')
    setAviso('')
    try {
      if (usuario.activo) {
        await apiRequest(`/usuarios/${usuario.id}`, { method: 'DELETE' })
      } else {
        await apiRequest(`/usuarios/${usuario.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ activo: true }),
        })
      }
      setAviso(usuario.activo ? 'Usuario desactivado.' : 'Usuario reactivado.')
      await cargarUsuarios()
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cambiar el estado del usuario.')
    }
  }

  function cerrarSesion() {
    clearSession()
    navigate('/login', { replace: true })
  }

  const usuariosFiltrados = usuarios.filter((usuario) =>
    `${usuario.nombre} ${usuario.correo} ${usuario.rol}`.toLowerCase().includes(busqueda.toLowerCase()),
  )
  const activos = usuarios.filter((usuario) => usuario.activo).length

  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#193449]">
      <header className="border-b border-[#dbe4e8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 max-[600px]:px-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-[#0b4263] text-white"><UserRound size={20} /></span>
            <div>
              <p className="m-0 text-[10px] font-bold uppercase text-[#1781a8]">FINDUBB / ADMINISTRACIÓN</p>
              <p className="m-0 mt-0.5 text-sm font-semibold">Gestión de usuarios</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border border-[#cbd8df] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#f3f7f9]" onClick={cerrarSesion} type="button">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-9 max-[600px]:px-4 max-[600px]:py-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-1 text-xs font-semibold text-[#658090]">CUENTAS Y PERMISOS</p>
            <h1 className="m-0 text-[27px] font-semibold leading-tight">Usuarios</h1>
            <p className="mb-0 mt-2 text-sm text-[#687f8d]">Administra las cuentas y sus niveles de acceso.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-[#0b4263] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#155779]" onClick={abrirCreacion} type="button">
            <Plus size={17} /> Nuevo usuario
          </button>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-[#dbe4e8] py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{usuarios.length}</span><span className="text-[#687f8d]">cuentas en total</span>
            <span className="mx-2 h-4 border-l border-[#cbd8df]" />
            <span className="font-semibold text-[#24744e]">{activos}</span><span className="text-[#687f8d]">activas</span>
          </div>
          <label className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-md border border-[#cbd8df] bg-white px-3 focus-within:border-[#1781a8]">
            <Search className="text-[#718896]" size={16} />
            <input className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#8999a3]" onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar nombre, correo o rol" value={busqueda} />
          </label>
        </div>

        {error && !modalAbierto && <p className="mt-4 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">{error}</p>}
        {aviso && <p className="mt-4 rounded-md border border-[#c7e4d3] bg-[#f1faf4] px-4 py-3 text-sm text-[#24744e]" role="status">{aviso}</p>}

        <div className="mt-4 overflow-hidden rounded-md border border-[#dbe4e8] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-[#f5f8f9] text-[11px] uppercase text-[#607987]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Rol</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Registro</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7edef]">
                {cargando ? (
                  <tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="5">Cargando usuarios...</td></tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="5">No hay usuarios para mostrar.</td></tr>
                ) : usuariosFiltrados.map((usuario) => (
                  <tr className="hover:bg-[#fbfcfc]" key={usuario.id}>
                    <td className="px-5 py-3.5">
                      <p className="m-0 font-semibold">{usuario.nombre}</p>
                      <p className="m-0 mt-0.5 text-xs text-[#718896]">{usuario.correo}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium">{usuario.rol}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex rounded px-2 py-1 text-[11px] font-semibold ${usuario.activo ? 'bg-[#e8f5ed] text-[#24744e]' : 'bg-[#edf0f2] text-[#687783]'}`}>{usuario.activo ? 'Activa' : 'Desactivada'}</span></td>
                    <td className="px-5 py-3.5 text-xs text-[#687f8d]">{new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(new Date(usuario.createdAt))}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button aria-label={`Editar ${usuario.nombre}`} className="grid size-9 place-items-center rounded border border-[#d5e0e5] text-[#31566a] hover:bg-[#edf5f8]" onClick={() => abrirEdicion(usuario)} title="Editar usuario" type="button"><Pencil size={15} /></button>
                        {usuario.id !== usuarioActual?.id && (
                          <button aria-label={`${usuario.activo ? 'Desactivar' : 'Reactivar'} ${usuario.nombre}`} className={`grid size-9 place-items-center rounded border ${usuario.activo ? 'border-[#e5cfca] text-[#a14f45] hover:bg-[#fff4f2]' : 'border-[#cfe1d5] text-[#24744e] hover:bg-[#f1faf4]'}`} onClick={() => cambiarEstado(usuario)} title={usuario.activo ? 'Desactivar usuario' : 'Reactivar usuario'} type="button">
                            {usuario.activo ? <UserRoundX size={16} /> : <UserRound size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {modalAbierto && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-[#132a38]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalAbierto(false) }}>
          <section aria-labelledby="user-form-title" aria-modal="true" className="w-full max-w-lg rounded-md border border-[#dbe4e8] bg-white p-6 shadow-xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[10px] font-bold uppercase text-[#1781a8]">CUENTA DE USUARIO</p>
                <h2 className="mb-0 mt-1 text-xl font-semibold" id="user-form-title">{usuarioEditando ? 'Editar usuario' : 'Crear usuario'}</h2>
              </div>
              <button aria-label="Cerrar" className="grid size-8 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9]" onClick={() => setModalAbierto(false)} type="button"><X size={16} /></button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={guardarUsuario}>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">Nombre
                <input autoComplete="name" className="h-10 rounded border border-[#cbd8df] px-3 text-sm font-normal outline-none focus:border-[#1781a8]" maxLength="100" onChange={(event) => setFormulario({ ...formulario, nombre: event.target.value })} required value={formulario.nombre} />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">Correo electrónico
                <input autoComplete="email" className="h-10 rounded border border-[#cbd8df] px-3 text-sm font-normal outline-none focus:border-[#1781a8]" maxLength="150" onChange={(event) => setFormulario({ ...formulario, correo: event.target.value })} required type="email" value={formulario.correo} />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">Rol
                <select className="h-10 rounded border border-[#cbd8df] bg-white px-3 text-sm font-normal outline-none focus:border-[#1781a8]" onChange={(event) => setFormulario({ ...formulario, rol: event.target.value })} value={formulario.rol}>
                  {roles.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">{usuarioEditando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                <input autoComplete="new-password" className="h-10 rounded border border-[#cbd8df] px-3 text-sm font-normal outline-none focus:border-[#1781a8]" minLength="8" onChange={(event) => setFormulario({ ...formulario, contrasena: event.target.value })} required={!usuarioEditando} type="password" value={formulario.contrasena} />
                <span className="font-normal text-[#718896]">Mínimo 8 caracteres.</span>
              </label>
              {error && <p className="m-0 text-sm text-[#963d38]" role="alert">{error}</p>}
              <div className="mt-1 flex justify-end gap-2">
                <button className="rounded border border-[#cbd8df] px-4 py-2 text-sm font-semibold hover:bg-[#f3f7f9]" onClick={() => setModalAbierto(false)} type="button">Cancelar</button>
                <button className="rounded bg-[#0b4263] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155779] disabled:opacity-60" disabled={guardando} type="submit">{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default PaginaUsuarios