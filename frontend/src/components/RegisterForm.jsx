import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, UserRound, UserRoundPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { register } from '../services/authService.js'

function PasswordField({ id, label, onChange, placeholder, value }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <label className="mb-[6px] block text-xs font-medium text-[#334b5d]" htmlFor={id}>{label}</label>
      <div className="flex h-[47px] items-center gap-[11px] rounded-xl border border-[#dce6ec] bg-white px-[13px] shadow-[0_4px_12px_rgb(20_49_70_/_5%)] transition-[border-color,box-shadow] focus-within:border-[#6ab5d9] focus-within:shadow-[0_0_0_3px_rgb(22_136_199_/_12%)]">
        <LockKeyhole className="shrink-0 text-[#236b98]" size={17} aria-hidden="true" />
        <input
          autoComplete={id === 'password' ? 'new-password' : 'new-password'}
          className="h-full w-full min-w-0 border-0 bg-transparent text-[13px] text-[#183247] outline-none placeholder:text-[#9aaab5]"
          id={id}
          maxLength={100}
          minLength={8}
          onChange={onChange}
          placeholder={placeholder}
          required
          type={isVisible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="flex shrink-0 items-center justify-center border-0 bg-transparent p-[5px] text-[#778b9a] hover:text-[#1688c7]"
          onClick={() => setIsVisible((visible) => !visible)}
          type="button"
        >
          {isVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

function RegisterForm() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSuccess(false)

    if (contrasena !== confirmacion) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await register({
        nombre: nombre.trim(),
        correo: correo.trim(),
        contrasena,
      })
      setIsSuccess(true)
      setMessage(result?.message || 'Cuenta creada correctamente. Ya puedes iniciar sesión.')
    } catch (error) {
      setMessage(error.message || 'No fue posible crear la cuenta. Inténtalo nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="register-title"
      className="mx-auto my-auto w-full max-w-[574px] rounded-[20px] border border-[#edf1f4] bg-white px-[32px] pt-[27px] pb-[21px] shadow-[0_18px_45px_rgb(24_50_71_/_9%)] max-[900px]:px-[27px] max-[680px]:my-[30px] max-[680px]:px-[25px] max-[680px]:pt-[25px] max-[680px]:pb-[23px] max-[380px]:px-[19px]"
    >
      <p className="mb-[6px] text-[10px] font-bold uppercase text-[#1688c7]">FINDUBB</p>
      <h2 className="m-0 text-[28px] font-medium leading-[1.2] text-[#183247]" id="register-title">Crear cuenta</h2>
      <p className="mb-5 mt-[7px] text-[13px] text-[#8293a0]">Únete a FINDUBB y conecta con tu vida universitaria.</p>

      <form className="grid gap-[14px]" onSubmit={handleSubmit}>
        <div>
          <label className="mb-[6px] block text-xs font-medium text-[#334b5d]" htmlFor="nombre">Nombre completo</label>
          <div className="flex h-[47px] items-center gap-[11px] rounded-xl border border-[#dce6ec] bg-white px-[13px] shadow-[0_4px_12px_rgb(20_49_70_/_5%)] transition-[border-color,box-shadow] focus-within:border-[#6ab5d9] focus-within:shadow-[0_0_0_3px_rgb(22_136_199_/_12%)]">
            <UserRound className="shrink-0 text-[#236b98]" size={17} aria-hidden="true" />
            <input
              autoComplete="name"
              className="h-full w-full min-w-0 border-0 bg-transparent text-[13px] text-[#183247] outline-none placeholder:text-[#9aaab5]"
              id="nombre"
              maxLength={100}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Escribe tu nombre"
              required
              value={nombre}
            />
          </div>
        </div>

        <div>
          <label className="mb-[6px] block text-xs font-medium text-[#334b5d]" htmlFor="correo">Correo institucional</label>
          <div className="flex h-[47px] items-center gap-[11px] rounded-xl border border-[#dce6ec] bg-white px-[13px] shadow-[0_4px_12px_rgb(20_49_70_/_5%)] transition-[border-color,box-shadow] focus-within:border-[#6ab5d9] focus-within:shadow-[0_0_0_3px_rgb(22_136_199_/_12%)]">
            <Mail className="shrink-0 text-[#236b98]" size={17} aria-hidden="true" />
            <input
              autoComplete="email"
              className="h-full w-full min-w-0 border-0 bg-transparent text-[13px] text-[#183247] outline-none placeholder:text-[#9aaab5]"
              id="correo"
              maxLength={150}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="nombre@alumnos.ubiobio.cl"
              required
              type="email"
              value={correo}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[14px] min-[681px]:grid-cols-2">
          <PasswordField
            id="password"
            label="Contraseña"
            onChange={(event) => setContrasena(event.target.value)}
            placeholder="Mínimo 8 caracteres"
            value={contrasena}
          />
          <PasswordField
            id="confirm-password"
            label="Confirmar contraseña"
            onChange={(event) => setConfirmacion(event.target.value)}
            placeholder="Repite tu contraseña"
            value={confirmacion}
          />
        </div>

        <label className="flex items-start gap-2 text-[11px] leading-relaxed text-[#718594]">
          <input
            checked={aceptaTerminos}
            className="mt-0.5 size-4 shrink-0 accent-[#1688c7]"
            onChange={(event) => setAceptaTerminos(event.target.checked)}
            required
            type="checkbox"
          />
          <span>
            Acepto los{' '}
            <a className="font-semibold text-[#1688c7] underline" href="https://www.ubiobio.cl/" rel="noreferrer" target="_blank">Términos</a>
            {' '}y la{' '}
            <a className="font-semibold text-[#1688c7] underline" href="https://www.ubiobio.cl/" rel="noreferrer" target="_blank">Política de privacidad</a>.
          </span>
        </label>

        <button className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#24516e] bg-[#073252] text-[13px] font-semibold text-white shadow-[0_6px_14px_rgb(7_50_82_/_16%)] transition hover:-translate-y-px hover:bg-[#0d4268] disabled:cursor-wait disabled:opacity-[.78]" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          {!isSubmitting && <UserRoundPlus size={17} aria-hidden="true" />}
        </button>

        {message && (
          <p aria-live="polite" className={`m-0 text-xs leading-relaxed ${isSuccess ? 'text-[#24744e]' : 'text-[#a13d3d]'}`} role="status">
            {message}
          </p>
        )}
      </form>

      <hr className="mb-[14px] mt-4 h-px border-0 bg-[#e5ebef]" />
      <p className="m-0 text-center text-xs text-[#81929f]">
        ¿Ya tienes una cuenta?{' '}
        <Link className="font-semibold text-[#1688c7] no-underline hover:text-[#096da8] hover:underline" to="/login">Inicia sesión</Link>
      </p>
    </section>
  )
}

export default RegisterForm