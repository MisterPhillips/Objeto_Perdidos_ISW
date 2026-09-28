import AuthLayout from '../components/EstructuraAutenticacion.jsx'
import LoginForm from '../components/FormularioInicioSesion.jsx'

function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage