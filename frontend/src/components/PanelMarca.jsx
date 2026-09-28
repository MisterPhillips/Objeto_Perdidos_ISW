import { ClipboardPlus, MapPin, Search, ShieldCheck } from 'lucide-react'

const benefits = [
  { icon: Search, label: 'Explora objetos encontrados' },
  { icon: MapPin, label: 'Consulta puntos de retiro' },
  { icon: ClipboardPlus, label: 'Reporta lo que perdiste' },
]

function BrandPanel({ variant = 'login' }) {
  const isRegister = variant === 'register'

  return (
    <aside
      aria-label="Universidad del Bío-Bío"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#073252] px-12 py-12 text-[#f6fbff] before:pointer-events-none before:absolute before:-right-[27%] before:top-[9%] before:z-[-1] before:aspect-square before:w-[390px] before:rounded-full before:border before:border-[rgb(81_174_215_/_9%)] before:bg-[rgb(78_173_214_/_7%)] before:content-[''] after:pointer-events-none after:absolute after:-bottom-[35%] after:-left-[35%] after:z-[-1] after:aspect-square after:w-[480px] after:rounded-full after:border after:border-[rgb(81_174_215_/_9%)] after:shadow-[0_0_0_42px_rgb(78_173_214_/_4%),0_0_0_84px_rgb(78_173_214_/_3%)] after:content-[''] max-[900px]:px-8 max-[680px]:min-h-0 max-[680px]:px-[25px] max-[680px]:pt-6 max-[680px]:pb-[22px] max-[380px]:px-[19px]"
    >
      <header className="relative z-10 flex items-center gap-[13px]">
        <span className="grid size-[46px] shrink-0 place-items-center rounded-[11px] bg-white text-[13px] font-extrabold text-[#073252]" aria-hidden="true">UBB</span>
        <div>
          <span className="mb-[3px] block text-xs text-[#b3cad9]">Universidad del Bío-Bío</span>
          <p className="m-0 text-xl font-medium">FINDUBB</p>
        </div>
      </header>

      <div className="relative z-10 my-auto w-full max-w-[420px] py-[72px] max-[680px]:mt-6 max-[680px]:py-0">
        <p className="mb-[13px] flex items-center gap-[9px] text-[11px] font-bold uppercase text-[#63c4e2] before:h-0.5 before:w-6 before:bg-current before:content-[''] max-[680px]:mb-2 max-[680px]:text-[10px]">
          {isRegister ? 'Nueva cuenta' : 'Acceso universitario'}
        </p>
        <h1 className="m-0 max-w-[390px] text-[46px] font-medium leading-[1.12] max-[900px]:text-[38px] max-[680px]:max-w-[450px] max-[680px]:text-[32px]">
          {isRegister ? 'Comienza a recuperar lo que perdiste.' : 'Lo que perdiste puede estar más cerca de lo que crees.'}
        </h1>
        <p className="mb-6 mt-[14px] max-w-[350px] text-sm leading-[1.6] text-[#b5c9d7] max-[680px]:hidden">
          {isRegister
            ? 'Crea tu cuenta en FINDUBB y ayuda a que los objetos perdidos vuelvan con sus dueños.'
            : '¿Perdiste algo en la UBB? Explora los hallazgos del campus y vuelve a encontrar eso que es tuyo.'}
        </p>
        <ul className="m-0 flex list-none flex-col items-start gap-[9px] p-0 max-[680px]:hidden">
          {benefits.map(({ icon: Icon, label }) => (
            <li className="flex items-center gap-[11px] text-[13px] text-[#c4d5e0]" key={label}>
              <span className="grid size-[30px] shrink-0 place-items-center rounded-[7px] bg-[rgb(81_193_223_/_12%)] text-[#50c1df]">
                <Icon size={16} aria-hidden="true" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 flex items-center gap-[9px] text-[11px] text-[#b3cad9] max-[680px]:hidden">
        <ShieldCheck size={15} aria-hidden="true" />
        <span>Plataforma oficial de la Universidad del Bío-Bío</span>
      </div>
    </aside>
  )
}

export default BrandPanel