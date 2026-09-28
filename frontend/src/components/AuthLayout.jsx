import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandPanel from './BrandPanel.jsx'

function AuthLayout({ children, variant = 'login' }) {
  const isRegister = variant === 'register'

  return (
    <main className="grid min-h-screen min-w-[320px] grid-cols-1 bg-[#f3f7f9] font-sans text-[#183247] antialiased min-[681px]:grid-cols-[minmax(310px,38%)_1fr] min-[901px]:grid-cols-[minmax(370px,37.5%)_1fr]">
      <BrandPanel variant={variant} />
      <section className="flex min-h-screen min-w-0 flex-col justify-between bg-[#f3f7f9] px-[clamp(28px,5.4vw,80px)] pt-8 pb-[19px] max-[900px]:px-7 max-[680px]:min-h-[calc(100vh-153px)] max-[680px]:px-5 max-[680px]:pt-5 max-[680px]:pb-4 max-[380px]:px-[15px]" aria-label={isRegister ? 'Registro de cuenta' : 'Acceso a la plataforma'}>
        <header className="flex items-center justify-between gap-4">
          {isRegister ? (
            <Link className="flex items-center gap-2 text-xs font-medium text-[#1688c7] no-underline hover:underline" to="/login">
              <ArrowLeft size={15} aria-hidden="true" /> Volver al inicio
            </Link>
          ) : (
            <span className="flex items-center gap-2 text-[11px] text-[#8093a1]">
              <LockKeyhole size={14} aria-hidden="true" /> Acceso seguro
            </span>
          )}

          {isRegister ? (
            <span className="flex items-center gap-2 text-[11px] text-[#8093a1]">
              <ShieldCheck size={14} aria-hidden="true" /> Tus datos están protegidos
            </span>
          ) : null}
        </header>

        {children}

        <footer className="flex items-center justify-between gap-4 text-[10px] text-[#8293a0] max-[680px]:flex-wrap">
          <p className="m-0">© 2026 Universidad del Bío-Bío</p>
          <nav className="flex gap-5" aria-label="Enlaces institucionales">
            <a className="text-inherit no-underline hover:text-[#1688c7] hover:underline" href="https://www.ubiobio.cl/" rel="noreferrer" target="_blank">Ayuda</a>
            <a className="text-inherit no-underline hover:text-[#1688c7] hover:underline" href="https://www.ubiobio.cl/" rel="noreferrer" target="_blank">Privacidad</a>
          </nav>
        </footer>
      </section>

    </main>
  )
}

export default AuthLayout