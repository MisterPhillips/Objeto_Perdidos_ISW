import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { login } from '../services/authService.js'

function FormularioInicioSesion() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('error')
  const [pendingAction, setPendingAction] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setPendingAction('')
    setIsSubmitting(true)

    try {
      await login({ correo: correo.trim(), contrasena: password })
      setMessageType('success')
      setMessage('Inicio de sesión exitoso.')
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || 'No fue posible iniciar sesión. Inténtalo nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function showPendingAction(action) {
    setMessageType('error')
    setMessage('Esta opción estará disponible cuando se conecte el servicio de cuentas.')
    setPendingAction(action)
  }

  return (
    <section
      aria-labelledby="login-title"
      className="mx-auto my-auto w-full max-w-[474px] rounded-[20px] border border-[#edf1f4] bg-white px-[37px] pt-[34px] pb-[27px] shadow-[0_18px_45px_rgb(24_50_71_/_9%)] max-[900px]:px-[27px] max-[680px]:my-[30px] max-[680px]:px-[25px] max-[680px]:pt-[29px] max-[680px]:pb-[23px] max-[380px]:px-[19px]"
    >
      <p className="mb-[6px] text-[10px] font-bold uppercase text-[#1688c7]">FINDUBB</p>
      <h2 className="m-0 text-[30px] font-medium leading-[1.2] text-[#183247]" id="login-title">Iniciar sesión</h2>
      <p className="mb-[25px] mt-[7px] text-[13px] text-[#8293a0]">Ingresa con tus credenciales para continuar.</p>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div>
            <label className="mb-[6px] block text-xs font-medium text-[#334b5d]" htmlFor="correo">Correo electrónico</label>
            <div className="flex h-[47px] items-center gap-[11px] rounded-xl border border-[#dce6ec] bg-white px-[13px] shadow-[0_4px_12px_rgb(20_49_70_/_5%)] transition-[border-color,box-shadow] focus-within:border-[#6ab5d9] focus-within:shadow-[0_0_0_3px_rgb(22_136_199_/_12%)]">
              <Mail className="shrink-0 text-[#236b98]" size={17} aria-hidden="true" />
              <input
                autoComplete="email"
                className="h-full w-full min-w-0 border-0 bg-transparent text-[13px] text-[#183247] outline-none placeholder:text-[#9aaab5]"
                id="correo"
                name="correo"
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="nombre@alumnos.ubiobio.cl"
                required
                type="email"
                value={correo}
              />
            </div>
          </div>

          <div>
            <label className="mb-[6px] block text-xs font-medium text-[#334b5d]" htmlFor="password">Contraseña</label>
            <div className="flex h-[47px] items-center gap-[11px] rounded-xl border border-[#dce6ec] bg-white px-[13px] shadow-[0_4px_12px_rgb(20_49_70_/_5%)] transition-[border-color,box-shadow] focus-within:border-[#6ab5d9] focus-within:shadow-[0_0_0_3px_rgb(22_136_199_/_12%)]">
              <LockKeyhole className="shrink-0 text-[#236b98]" size={17} aria-hidden="true" />
              <input
                autoComplete="current-password"
                className="h-full w-full min-w-0 border-0 bg-transparent text-[13px] text-[#183247] outline-none placeholder:text-[#9aaab5]"
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="flex shrink-0 items-center justify-center border-0 bg-transparent p-[5px] text-[#778b9a] hover:text-[#1688c7]"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 mt-[18px] flex justify-end">
          <button className="border-0 bg-transparent px-0 py-[5px] text-[11px] font-semibold text-[#1688c7] hover:text-[#096da8] hover:underline" onClick={() => showPendingAction('recovery')} type="button">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button className="flex min-h-12 w-full items-center justify-center gap-[9px] rounded-xl border border-[#24516e] bg-[#073252] text-[13px] font-semibold text-white shadow-[0_6px_14px_rgb(7_50_82_/_16%)] transition hover:-translate-y-px hover:bg-[#0d4268] disabled:cursor-wait disabled:opacity-[.78]" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
        </button>

        {message && (
          <p
            aria-live="polite"
            className={`mt-3 text-xs leading-relaxed ${messageType === 'success' ? 'text-[#24744e]' : 'text-[#a13d3d]'}`}
            key={pendingAction || message}
            role="status"
          >
            {message}
          </p>
        )}
      </form>

      <hr className="mb-4 mt-[23px] h-px border-0 bg-[#e5ebef]" />
      <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-[#81929f]">
        <span>¿No tienes una cuenta?</span>
        <Link className="px-0 py-[5px] text-[11px] font-semibold text-[#1688c7] no-underline hover:text-[#096da8] hover:underline" to="/registro">
          Regístrate
        </Link>
      </div>
    </section>
  )
}

export default FormularioInicioSesion