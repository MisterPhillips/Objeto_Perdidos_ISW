import EstructuraAutenticacion from '../components/EstructuraAutenticacion.jsx'
import FormularioRegistro from '../components/FormularioRegistro.jsx'

function PaginaRegistro() {
  return (
    <EstructuraAutenticacion variant="register">
      <FormularioRegistro />
    </EstructuraAutenticacion>
  )
}

export default PaginaRegistro