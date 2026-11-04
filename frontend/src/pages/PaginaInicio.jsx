import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  MapPinned,
  PackageSearch,
  Sparkles,
  Tags,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSessionUser } from '../services/sessionService.js'

const accionesPorRol = {
  ESTUDIANTE: [
    {
      titulo: 'Buscar un objeto',
      descripcion: 'Revisa los objetos encontrados y consulta dónde retirarlos.',
      destino: '/app/objetos',
      icono: PackageSearch,
      etiqueta: 'Ver objetos',
    },
    {
      titulo: 'Explorar el mapa',
      descripcion: 'Ubica los puntos de retiro disponibles en el campus.',
      destino: '/app/mapa',
      icono: MapPinned,
      etiqueta: 'Ver mapa',
    },
  ],
  FUNCIONARIO: [
    {
      titulo: 'Registrar objeto encontrado',
      descripcion: 'Agrega un objeto al catálogo para que pueda ser localizado.',
      destino: '/app/objetos',
      icono: PackageSearch,
      etiqueta: 'Ir al catálogo',
    },
    {
      titulo: 'Registrar una entrega',
      descripcion: 'Registra la entrega de un objeto y revisa la bitácora.',
      destino: '/funcionario/retiros',
      icono: ClipboardCheck,
      etiqueta: 'Registrar entrega',
    },
  ],
  ADMIN: [
    {
      titulo: 'Gestionar categorías',
      descripcion: 'Mantén organizado el catálogo de objetos encontrados.',
      destino: '/admin/categorias',
      icono: Tags,
      etiqueta: 'Administrar categorías',
    },
    {
      titulo: 'Gestionar usuarios',
      descripcion: 'Administra cuentas y permisos de acceso a FINDUBB.',
      destino: '/admin/usuarios',
      icono: Users,
      etiqueta: 'Administrar usuarios',
    },
    {
      titulo: 'Consultar objetos',
      descripcion: 'Revisa los objetos publicados y sus puntos de retiro.',
      destino: '/app/objetos',
      icono: PackageSearch,
      etiqueta: 'Ver catálogo',
    },
  ],
}

const nombresRol = {
  ESTUDIANTE: 'Estudiante',
  FUNCIONARIO: 'Funcionario',
  ADMIN: 'Administración',
}

function PaginaInicio() {
  const usuario = getSessionUser()
  const rol = accionesPorRol[usuario?.rol] ? usuario.rol : 'ESTUDIANTE'
  const acciones = accionesPorRol[rol]
  const nombre = usuario?.nombre?.trim().split(/\s+/)[0] || 'bienvenido'

  return (
    <section aria-label="Inicio" className="mt-7 grid gap-8">
      <div className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[#073252] via-[#0b4263] to-[#16769c] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-10 -top-20 -z-10 size-64 rounded-full border-[36px] border-white/[0.07] sm:right-8 sm:size-80" />
        <div aria-hidden="true" className="absolute -bottom-24 right-24 -z-10 size-48 rounded-full bg-[#6bd0e6]/10 blur-2xl" />
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d9f4fb]">
            <Building2 aria-hidden="true" size={14} />
            Universidad del Bío-Bío
          </div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-[#c5e5f0]">
            <Sparkles aria-hidden="true" size={15} />
            FINDUBB · {nombresRol[rol]}
          </p>
          <h2 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
            Hola, {nombre}
          </h2>
          <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#d7e9f1] sm:text-base">
            {rol === 'ESTUDIANTE' && 'Encuentra tus pertenencias y descubre dónde puedes recuperarlas dentro de la universidad.'}
            {rol === 'FUNCIONARIO' && 'Registra objetos encontrados y gestiona sus entregas desde un solo lugar.'}
            {rol === 'ADMIN' && 'Administra la información de FINDUBB y ayuda a mantener el servicio organizado.'}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1781a8]">ACCESOS RÁPIDOS</p>
          <h2 className="m-0 text-lg font-semibold text-[#193449]">
            {rol === 'ESTUDIANTE' ? '¿Qué necesitas hacer?' : 'Tus tareas principales'}
          </h2>
        </div>
        <div className={`grid gap-4 ${acciones.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {acciones.map(({ titulo, descripcion, destino, icono: Icono, etiqueta }) => (
            <Link
              className="group flex min-h-44 flex-col rounded-lg border border-[#dbe4e8] bg-white p-5 no-underline transition hover:-translate-y-0.5 hover:border-[#9fc8d7] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1781a8]"
              key={destino}
              to={destino}
            >
              <span className="mb-4 grid size-10 place-items-center rounded-lg bg-[#e9f4f8] text-[#16769c]">
                <Icono aria-hidden="true" size={19} />
              </span>
              <h3 className="m-0 text-sm font-semibold text-[#193449]">{titulo}</h3>
              <p className="mb-4 mt-2 flex-1 text-xs leading-5 text-[#687f8d]">{descripcion}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16769c]">
                {etiqueta}
                <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" size={15} />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {rol === 'ESTUDIANTE' && (
        <div className="rounded-lg border border-[#dbe4e8] bg-white p-5 sm:p-6">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#658090]">ASÍ DE SIMPLE</p>
          <h2 className="m-0 text-base font-semibold text-[#193449]">Recupera tus pertenencias</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'Busca', 'Revisa el catálogo de objetos encontrados.'],
              ['02', 'Confirma', 'Identifica el punto donde está disponible.'],
              ['03', 'Retira', 'Acércate al punto indicado para recuperarlo.'],
            ].map(([numero, titulo, descripcion]) => (
              <div className="flex gap-3" key={numero}>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e9f4f8] text-[11px] font-bold text-[#16769c]">{numero}</span>
                <div>
                  <h3 className="m-0 text-sm font-semibold text-[#193449]">{titulo}</h3>
                  <p className="mb-0 mt-1 text-xs leading-5 text-[#687f8d]">{descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default PaginaInicio
