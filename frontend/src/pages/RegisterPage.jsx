import AuthLayout from '../components/AuthLayout.jsx'
import RegisterForm from '../components/RegisterForm.jsx'

function RegisterPage() {
  return (
    <AuthLayout variant="register">
      <RegisterForm />
    </AuthLayout>
  )
}

export default RegisterPage