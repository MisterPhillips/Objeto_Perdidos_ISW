import { useState } from 'react'
import {
  Building2,
  ClipboardList,
  House,
  LogOut,
  MapPin,
  Menu,
  PackageSearch,
  Tags,
  UsersRound,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getSessionUser } from '../services/sessionService.js'

const secciones = [
  { label: 'Inicio', path: '/inicio', icon: House },
  { label: 'Objetos encontrados', path: '/app/objetos', icon: PackageSearch },
  { label: 'Mapa interactivo', path: '/app/mapa', icon: MapPin },
  { label: 'Solicitudes', path: '/app/solicitudes', icon: ClipboardList },
  { label: 'Puntos de retiro', path: '/app/puntos-retiro', icon: Building2 },
  { label: 'Categorías', path: '/app/categorias', icon: Tags },
  { label: 'Registrar entregas', path: '/funcionario/retiros', icon: ClipboardList, funcionario: true },
]

function PaginaPrincipal({ children }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const usuario = getSessionUser()
  const seccionesVisibles = secciones.filter(({ funcionario }) => !funcionario || usuario?.rol === 'FUNCIONARIO')
  const seccionActiva = seccionesVisibles.find(({ path }) => path === location.pathname)
    || (location.pathname === '/admin/usuarios'
      ? { label: 'Usuarios', path: '/admin/usuarios' }
      : secciones[0])

  function cerrarSesion() {
    clearSession()
    navigate('/login', { replace: true })
  }

  function enlaceSeccion({ label, path, icon: Icon }) {
    const activa = location.pathname === path
    return (
      <a
        aria-current={activa ? 'page' : undefined}
        className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium no-underline transition-colors ${
          activa
            ? 'bg-[rgb(89_190_220_/_16%)] text-white'
            : 'text-[#bfd0dc] hover:bg-[rgb(255_255_255_/_7%)] hover:text-white'
        }`}
        href={path}
        key={path}
        onClick={(event) => {
          event.preventDefault()
          setMenuAbierto(false)
          navigate(path)
        }}
      >
        <Icon aria-hidden="true" className={activa ? 'text-[#6bd0e6]' : 'text-[#9bb4c4]'} size={17} />
        <span>{label}</span>
      </a>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f7f9] text-[#183247]">
      {menuAbierto && (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-20 bg-[#102a3a]/45 lg:hidden"
          onClick={() => setMenuAbierto(false)}
          type="button"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col bg-[#073252] text-white transition-transform duration-200 lg:translate-x-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[9px] bg-white text-[11px] font-extrabold text-[#073252]">UBB</span>
            <div>
              <span className="block text-[10px] text-[#b3cad9]">Universidad del Bío-Bío</span>
              <span className="mt-0.5 block text-[17px] font-semibold tracking-[0.02em]">FINDUBB</span>
            </div>
          </div>
          <button
            aria-label="Cerrar menú"
            className="grid size-9 place-items-center rounded-md text-[#bfd0dc] hover:bg-white/10 lg:hidden"
            onClick={() => setMenuAbierto(false)}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7fa0b4]">Aplicación</p>
          <div className="grid gap-1">
            {seccionesVisibles.map(enlaceSeccion)}
          </div>
          {usuario?.rol === 'ADMIN' && (
            <>
              <p className="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7fa0b4]">Administración</p>
              <div className="grid gap-1">
                {enlaceSeccion({ label: 'Usuarios', path: '/admin/usuarios', icon: UsersRound })}
              </div>
            </>
          )}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex min-w-0 items-center gap-3 px-1">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1c5473] text-xs font-semibold text-[#dcf3fa]">
              {(usuario?.nombre || 'U').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate text-xs font-semibold">{usuario?.nombre || 'Usuario'}</p>
              <p className="m-0 mt-1 truncate text-[10px] text-[#9bb4c4]">{usuario?.rol || 'Cuenta'}</p>
            </div>
          </div>
          <button
            className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-xs font-medium text-[#bfd0dc] transition-colors hover:bg-white/10 hover:text-white"
            onClick={cerrarSesion}
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-10 flex h-[66px] items-center gap-3 border-b border-[#dbe4e8] bg-white px-5 sm:px-7">
          <button
            aria-label="Abrir navegación"
            className="grid size-9 shrink-0 place-items-center rounded-md border border-[#d5e0e5] text-[#31566a] hover:bg-[#f3f7f9] lg:hidden"
            onClick={() => setMenuAbierto(true)}
            type="button"
          >
            <Menu size={18} />
          </button>
          <p className="m-0 text-[13px] font-semibold text-[#31566a]">{seccionActiva.label}</p>
          <span className="ml-auto hidden text-[11px] text-[#81929f] sm:block">Universidad del Bío-Bío</span>
        </header>

        <main className="min-h-[calc(100vh-66px)] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
          <div className="border-b border-[#dbe4e8] pb-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1781a8]">FINDUBB / {seccionActiva.label}</p>
            <h1 className="m-0 text-[25px] font-semibold leading-tight text-[#193449]">{seccionActiva.label}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

export default PaginaPrincipal