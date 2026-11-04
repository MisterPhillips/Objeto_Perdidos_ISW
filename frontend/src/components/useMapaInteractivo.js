import { useEffect, useState } from 'react'
import { apiRequest } from '../config/apiClient.js'

export function useMapaInteractivo() {
	const [puntosRetiro, setPuntosRetiro] = useState([])
	const [cargando, setCargando] = useState(true)
	const [error, setError] = useState('')
	const [intentos, setIntentos] = useState(0)
	const [puntoSeleccionado, setPuntoSeleccionado] = useState(null)
	const [objetosPunto, setObjetosPunto] = useState([])
	const [cargandoObjetos, setCargandoObjetos] = useState(false)
	const [errorObjetos, setErrorObjetos] = useState('')
	const [intentosDetalle, setIntentosDetalle] = useState(0)
	const [busqueda, setBusqueda] = useState('')
	const [busquedaAplicada, setBusquedaAplicada] = useState('')
	const puntoSeleccionadoId = puntoSeleccionado?.id

	useEffect(() => {
		let vigente = true

		apiRequest('/puntos-retiro/mapa')
			.then((data) => {
				if (vigente) setPuntosRetiro(data.puntosRetiro)
			})
			.catch((requestError) => {
				if (vigente) setError(requestError.message || 'No se pudieron cargar los puntos de retiro.')
			})
			.finally(() => {
				if (vigente) setCargando(false)
			})

		return () => {
			vigente = false
		}
	}, [intentos])

	useEffect(() => {
		if (puntoSeleccionadoId === undefined) return undefined

		let vigente = true
		apiRequest(`/puntos-retiro/${puntoSeleccionadoId}/objetos`)
			.then((data) => {
				if (vigente) {
					setPuntoSeleccionado(data.puntoRetiro)
					setObjetosPunto(data.puntoRetiro.objetos)
				}
			})
			.catch((requestError) => {
				if (vigente) setErrorObjetos(requestError.message || 'No se pudieron cargar los objetos de este punto.')
			})
			.finally(() => {
				if (vigente) setCargandoObjetos(false)
			})

		return () => {
			vigente = false
		}
	}, [intentosDetalle, puntoSeleccionadoId])

	useEffect(() => {
		if (!puntoSeleccionado) return undefined

		const cerrarConEscape = (event) => {
			if (event.key === 'Escape') setPuntoSeleccionado(null)
		}
		window.addEventListener('keydown', cerrarConEscape)
		return () => window.removeEventListener('keydown', cerrarConEscape)
	}, [puntoSeleccionado])

	function reintentar() {
		setError('')
		setCargando(true)
		setIntentos((actuales) => actuales + 1)
	}

	function abrirPunto(punto) {
		setPuntoSeleccionado(punto)
		setObjetosPunto([])
		setBusqueda('')
		setBusquedaAplicada('')
		setErrorObjetos('')
		setCargandoObjetos(true)
		setIntentosDetalle(0)
	}

	function cerrarPunto() {
		setPuntoSeleccionado(null)
	}

	function reintentarDetalle() {
		setErrorObjetos('')
		setCargandoObjetos(true)
		setIntentosDetalle((actuales) => actuales + 1)
	}

	function buscarObjetos(event) {
		event.preventDefault()
		setBusquedaAplicada(busqueda.trim().toLocaleLowerCase('es'))
	}

	const objetosFiltrados = objetosPunto.filter((objeto) =>
		objeto.descripcion.toLocaleLowerCase('es').includes(busquedaAplicada),
	)

	return {
		puntosRetiro,
		cargando,
		error,
		puntoSeleccionado,
		objetosPunto,
		cargandoObjetos,
		errorObjetos,
		busqueda,
		setBusqueda,
		objetosFiltrados,
		reintentar,
		abrirPunto,
		cerrarPunto,
		reintentarDetalle,
		buscarObjetos,
	}
}
