import {
  ArrowRight, LogOut, Map, MapPin, Search, ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getSessionUser } from '../services/sessionService.js'

// NOTA: todo lo de este menú es referencial y aún no tiene funcionalidad real.
// Es el menú para cualquier miembro de la Universidad (alumnos, profesores, etc.).
// El menú con privilegios de administrador/funcionario se agregará más adelante.
const opciones = [
  { icon: Search, titulo: 'Explorar objetos perdidos', descripcion: 'Revisa el catálogo consolidado de objetos encontrados en las facultades.', rf: 'RF-03 · RF-04' },
]

function MenuPrincipal() {
  const navigate = useNavigate()
  const usuario = getSessionUser()

  const primerNombre = usuario.nombre?.trim().split(/\s+/)[0] || 'de nuevo'

  function salir() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <main className="grid min-h-screen min-w-[320px] grid-cols-1 bg-[#f3f7f9] font-sans text-[#183247] antialiased min-[901px]:grid-cols-[290px_1fr]">
      <aside
        aria-label="Universidad del Bío-Bío"
        className="relative isolate flex flex-col gap-7 overflow-hidden bg-[#073252] px-7 py-8 text-[#f6fbff] after:pointer-events-none after:absolute after:-bottom-[30%] after:-left-[45%] after:z-[-1] after:aspect-square after:w-[380px] after:rounded-full after:border after:border-[rgb(81_174_215_/_9%)] after:shadow-[0_0_0_42px_rgb(78_173_214_/_4%),0_0_0_84px_rgb(78_173_214_/_3%)] after:content-[''] min-[901px]:min-h-screen min-[901px]:px-8 min-[901px]:py-12"
      >
        <header className="flex items-center gap-[13px]">
          <span className="grid size-[46px] shrink-0 place-items-center rounded-[11px] bg-white text-[13px] font-extrabold text-[#073252]" aria-hidden="true">UBB</span>
          <div>
            <span className="mb-[3px] block text-xs text-[#b3cad9]">Universidad del Bío-Bío</span>
            <p className="m-0 text-xl font-medium">FINDUBB</p>
          </div>
        </header>

        <div className="flex items-center gap-3 rounded-2xl bg-[rgb(255_255_255_/_7%)] p-4 min-[901px]:mt-auto">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[rgb(81_193_223_/_18%)] text-sm font-bold uppercase text-[#50c1df]" aria-hidden="true">
            {usuario.nombre?.trim().charAt(0) || '?'}
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-[13px] font-medium">{usuario.nombre}</p>
            <p className="m-0 truncate text-[11px] text-[#b3cad9]">{usuario.correo}</p>
            <span className="mt-1.5 inline-block rounded-full bg-[rgb(81_193_223_/_16%)] px-2 py-0.5 text-[10px] font-semibold text-[#63c4e2]">
              Estudiante
            </span>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl border border-[rgb(255_255_255_/_18%)] bg-transparent py-3 text-[13px] font-semibold text-white transition hover:bg-[rgb(255_255_255_/_8%)] min-[901px]:mb-auto" onClick={salir} type="button">
          <LogOut size={16} aria-hidden="true" /> Cerrar sesión
        </button>

        <div className="hidden items-center gap-[9px] text-[11px] text-[#b3cad9] min-[901px]:flex">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>Plataforma oficial de la Universidad del Bío-Bío</span>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col justify-between gap-8 px-[clamp(20px,5.4vw,72px)] pt-10 pb-[19px] max-[680px]:pt-7" aria-label="Menú principal">
        <div className="mx-auto w-full max-w-[920px]">
          <p className="mb-[6px] text-[10px] font-bold uppercase text-[#1688c7]">FINDUBB</p>
          <h1 className="m-0 text-[30px] font-medium leading-[1.2] max-[680px]:text-[26px]">Hola, {primerNombre}</h1>
          <p className="mb-7 mt-[7px] text-[13px] text-[#8293a0]">¿Qué quieres hacer hoy? Elige una opción para continuar.</p>

          <article className="relative isolate mb-5 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[20px] bg-[#073252] p-7 text-white shadow-[0_18px_45px_rgb(24_50_71_/_9%)] before:pointer-events-none before:absolute before:-right-16 before:-top-16 before:z-[-1] before:size-[220px] before:rounded-full before:border before:border-[rgb(81_174_215_/_12%)] before:bg-[rgb(78_173_214_/_8%)] before:content-['']">
            <div className="flex max-w-[480px] items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[rgb(81_193_223_/_14%)] text-[#50c1df]">
                <Map size={24} aria-hidden="true" />
              </span>
              <div>
                <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase text-[#63c4e2]"><MapPin size={12} aria-hidden="true" /> RF-03 · Mapa institucional</p>
                <h2 className="m-0 text-xl font-medium">Mapa interactivo</h2>
                <p className="mb-0 mt-1.5 text-[13px] leading-relaxed text-[#b5c9d7]">Ubica en el campus los puntos de retiro habilitados y encuentra dónde retirar tu objeto.</p>
              </div>
            </div>
            <button className="flex min-h-12 items-center justify-center gap-[9px] rounded-xl bg-white px-6 text-[13px] font-semibold text-[#073252] transition hover:-translate-y-px hover:bg-[#eaf4fa]" type="button">
              Abrir mapa <ArrowRight size={17} aria-hidden="true" />
            </button>
          </article>

          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 min-[681px]:grid-cols-2">
            {opciones.map(({ icon: Icon, titulo, descripcion, rf }) => (
              <li key={titulo}>
                <button className="flex h-full w-full items-start gap-4 rounded-[20px] border border-[#edf1f4] bg-white p-5 text-left shadow-[0_18px_45px_rgb(24_50_71_/_9%)] transition hover:-translate-y-px hover:border-[#6ab5d9]" type="button">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[rgb(22_136_199_/_10%)] text-[#1688c7]">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-[#1688c7]">{rf}</span>
                    <span className="block text-[15px] font-medium text-[#183247]">{titulo}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#8293a0]">{descripcion}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <footer className="flex items-center justify-between gap-4 text-[10px] text-[#8293a0] max-[680px]:flex-wrap">
          <p className="m-0">© 2026 Universidad del Bío-Bío</p>
          <p className="m-0">Menú referencial · sujeto a cambios</p>
        </footer>
      </section>
    </main>
  )
}

export default MenuPrincipal
