import AuthLayout from '../components/EstructuraAutenticacion.jsx'
import RegisterForm from '../components/FormularioRegistro.jsx'

function RegisterPage() {
  return (
    <AuthLayout variant="register">
      <RegisterForm />
    </AuthLayout>
  )
}

export default RegisterPage