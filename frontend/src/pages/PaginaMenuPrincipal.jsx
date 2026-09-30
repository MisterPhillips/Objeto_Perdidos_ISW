import { useEffect } from 'react'
import MenuPrincipal from '../components/MenuPrincipal.jsx'

function PaginaMenuPrincipal() {
  useEffect(() => {
    document.title = 'Menú principal | FINDUBB'
  }, [])

  return <MenuPrincipal />
}

export default PaginaMenuPrincipal
