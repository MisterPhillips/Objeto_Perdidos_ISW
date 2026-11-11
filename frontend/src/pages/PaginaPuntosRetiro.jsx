import { useEffect, useState } from 'react'
import { AlertCircle, MapPin, Pencil, Plus, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SelectorUbicacionPunto from '../components/SelectorUbicacionPunto.jsx'
import { ApiError } from '../config/apiClient.js'
import {
	actualizarPuntoRetiro,
	deshabilitarPuntoRetiro,
	obtenerPuntosRetiro,
} from '../services/puntoRetiroService.js'
import { clearSession } from '../services/sessionService.js'

const formularioInicial = {
	nombre: '',
	facultad: '',
	descripcion: '',
	latitud: null,
	longitud: null,
}

function tieneCoordenadas(punto) {
	return Number.isFinite(punto.latitud) && Number.isFinite(punto.longitud)
}

function PaginaPuntosRetiro() {
	const navigate = useNavigate()
	const [puntosRetiro, setPuntosRetiro] = useState([])
	const [busqueda, setBusqueda] = useState('')
	const [formulario, setFormulario] = useState(formularioInicial)
	const [puntoEditando, setPuntoEditando] = useState(null)
	const [modalAbierto, setModalAbierto] = useState(false)
	const [modalUbicacionAbierto, setModalUbicacionAbierto] = useState(false)
	const [coordenadasTemporales, setCoordenadasTemporales] = useState(null)
	const [cargando, setCargando] = useState(true)
	const [guardando, setGuardando] = useState(false)
	const [error, setError] = useState('')
	const [aviso, setAviso] = useState('')
	const [intentos, setIntentos] = useState(0)

	useEffect(() => {
		let vigente = true

		obtenerPuntosRetiro()
			.then((data) => {
				if (vigente) setPuntosRetiro(data.puntosRetiro)
			})
			.catch((requestError) => {
				if (!vigente) return
				if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
					clearSession()
					navigate('/login', { replace: true })
					return
				}
				setError(requestError.message || 'No se pudieron cargar los puntos de retiro.')
			})
			.finally(() => {
				if (vigente) setCargando(false)
			})

		return () => {
			vigente = false
		}
	}, [intentos, navigate])

	useEffect(() => {
		if (!modalAbierto) return undefined

		const overflowAnteriorHtml = document.documentElement.style.overflow
		const overflowAnteriorBody = document.body.style.overflow
		document.documentElement.style.overflow = 'hidden'
		document.body.style.overflow = 'hidden'

		return () => {
			document.documentElement.style.overflow = overflowAnteriorHtml
			document.body.style.overflow = overflowAnteriorBody
		}
	}, [modalAbierto])

	function recargarPuntos() {
		setCargando(true)
		setError('')
		setIntentos((actuales) => actuales + 1)
	}

	function abrirEdicion(punto) {
		setPuntoEditando(punto)
		setFormulario({
			nombre: punto.nombre,
			facultad: punto.facultad,
			descripcion: punto.descripcion || '',
			latitud: punto.latitud,
			longitud: punto.longitud,
		})
		setError('')
		setModalAbierto(true)
	}

	function abrirSelectorUbicacion() {
		setCoordenadasTemporales(
			Number.isFinite(formulario.latitud) && Number.isFinite(formulario.longitud)
				? { latitud: formulario.latitud, longitud: formulario.longitud }
				: null,
		)
		setModalUbicacionAbierto(true)
	}

	async function guardarPunto(event) {
		event.preventDefault()
		if (!puntoEditando) return

		setGuardando(true)
		setError('')
		const datos = {
			nombre: formulario.nombre.trim(),
			facultad: formulario.facultad.trim(),
			descripcion: formulario.descripcion.trim() || null,
		}
		if (Number.isFinite(formulario.latitud) && Number.isFinite(formulario.longitud)) {
			datos.latitud = formulario.latitud
			datos.longitud = formulario.longitud
		}

		try {
			const respuesta = await actualizarPuntoRetiro(puntoEditando.id, datos)
			setModalAbierto(false)
			setAviso(`El punto "${respuesta.puntoRetiro.nombre}" fue actualizado.`)
			recargarPuntos()
		} catch (requestError) {
			setError(requestError.message || 'No se pudo actualizar el punto de retiro.')
		} finally {
			setGuardando(false)
		}
	}

	async function cambiarEstado(punto) {
		const mensaje = punto.habilitado
			? `¿Quieres deshabilitar "${punto.nombre}"? El punto no se eliminará y podrás habilitarlo nuevamente.`
			: `¿Quieres habilitar "${punto.nombre}" nuevamente?`
		if (!window.confirm(mensaje)) return

		setError('')
		setAviso('')
		try {
			if (punto.habilitado) {
				await deshabilitarPuntoRetiro(punto.id)
			} else {
				await actualizarPuntoRetiro(punto.id, { habilitado: true })
			}
			setAviso(punto.habilitado ? 'Punto de retiro deshabilitado.' : 'Punto de retiro habilitado.')
			recargarPuntos()
		} catch (requestError) {
			setError(requestError.message || 'No se pudo cambiar el estado del punto de retiro.')
		}
	}

	function actualizarCampo(event) {
		const { name, value } = event.target
		setFormulario((actual) => ({ ...actual, [name]: value }))
	}

	const puntosFiltrados = puntosRetiro.filter((punto) =>
		`${punto.nombre} ${punto.facultad} ${punto.descripcion || ''}`.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es')),
	)
	const habilitados = puntosRetiro.filter((punto) => punto.habilitado).length

	return (
		<section aria-label="Gestionar puntos de retiro" className="mt-7">
			<div className="flex flex-wrap items-end justify-between gap-5">
				<div>
					<p className="mb-1 text-xs font-semibold text-[#658090]">PUNTOS Y UBICACIONES</p>
					<h2 className="m-0 text-[27px] font-semibold leading-tight">Puntos de retiro</h2>
					<p className="mb-0 mt-2 text-sm text-[#687f8d]">Edita sus datos y administra su disponibilidad.</p>
				</div>
				<button
					className="inline-flex items-center gap-2 rounded-md bg-[#0b4263] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#155779]"
					onClick={() => navigate('/admin/puntos-retiro/nuevo')}
					type="button"
				>
					<Plus size={17} /> Nuevo punto
				</button>
			</div>

			<div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-[#dbe4e8] py-4">
				<div className="flex items-center gap-2 text-sm">
					<span className="font-semibold">{puntosRetiro.length}</span><span className="text-[#687f8d]">puntos en total</span>
					<span className="mx-2 h-4 border-l border-[#cbd8df]" />
					<span className="font-semibold text-[#24744e]">{habilitados}</span><span className="text-[#687f8d]">habilitados</span>
				</div>
				<label className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-md border border-[#cbd8df] bg-white px-3 focus-within:border-[#1781a8]">
					<Search aria-hidden="true" className="text-[#718896]" size={16} />
					<input
						className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#8999a3]"
						onChange={(event) => setBusqueda(event.target.value)}
						placeholder="Buscar nombre o facultad"
						value={busqueda}
					/>
				</label>
			</div>

			{error && !modalAbierto && (
				<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">
					<span className="flex items-center gap-2"><AlertCircle aria-hidden="true" size={17} />{error}</span>
					<button className="rounded border border-[#dba9a4] px-3 py-1.5 text-xs font-semibold hover:bg-white" onClick={recargarPuntos} type="button">Reintentar</button>
				</div>
			)}
			{aviso && <p className="mt-4 rounded-md border border-[#c7e4d3] bg-[#f1faf4] px-4 py-3 text-sm text-[#24744e]" role="status">{aviso}</p>}

			<div className="mt-4 overflow-hidden rounded-md border border-[#dbe4e8] bg-white">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[760px] border-collapse text-left text-sm">
						<thead className="bg-[#f5f8f9] text-[11px] uppercase text-[#607987]">
							<tr>
								<th className="px-5 py-3 font-semibold">Punto de retiro</th>
								<th className="px-5 py-3 font-semibold">Ubicación</th>
								<th className="px-5 py-3 font-semibold">Estado</th>
								<th className="px-5 py-3 text-right font-semibold">Acciones</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[#e7edef]">
							{cargando ? (
								<tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="4">Cargando puntos de retiro...</td></tr>
							) : puntosFiltrados.length === 0 ? (
								<tr><td className="px-5 py-10 text-center text-[#718896]" colSpan="4">No hay puntos de retiro para mostrar.</td></tr>
							) : puntosFiltrados.map((punto) => (
								<tr className="hover:bg-[#fbfcfc]" key={punto.id}>
									<td className="px-5 py-3.5">
										<p className="m-0 font-semibold">{punto.nombre}</p>
										<p className="m-0 mt-0.5 text-xs text-[#718896]">{punto.facultad}</p>
									</td>
									<td className="px-5 py-3.5 text-xs text-[#687f8d]">
										{tieneCoordenadas(punto)
											? `${punto.latitud.toFixed(5)}, ${punto.longitud.toFixed(5)}`
											: 'Sin coordenadas'}
									</td>
									<td className="px-5 py-3.5">
										<span className={`inline-flex rounded px-2 py-1 text-[11px] font-semibold ${punto.habilitado ? 'bg-[#e8f5ed] text-[#24744e]' : 'bg-[#edf0f2] text-[#687783]'}`}>
											{punto.habilitado ? 'Habilitado' : 'Deshabilitado'}
										</span>
									</td>
									<td className="px-5 py-3.5">
										<div className="flex justify-end gap-2">
											<button
												aria-label={`Editar ${punto.nombre}`}
												className="grid size-9 place-items-center rounded border border-[#d5e0e5] text-[#31566a] hover:bg-[#edf5f8]"
												onClick={() => abrirEdicion(punto)}
												title="Editar punto de retiro"
												type="button"
											><Pencil size={15} /></button>
											<button
												aria-label={`${punto.habilitado ? 'Deshabilitar' : 'Habilitar'} ${punto.nombre}`}
												className={`rounded border px-3 text-xs font-semibold ${punto.habilitado ? 'border-[#e5cfca] text-[#a14f45] hover:bg-[#fff4f2]' : 'border-[#cfe1d5] text-[#24744e] hover:bg-[#f1faf4]'}`}
												onClick={() => cambiarEstado(punto)}
												type="button"
											>
												{punto.habilitado ? 'Deshabilitar' : 'Habilitar'}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{modalAbierto && (
				<div
					className="fixed inset-0 z-50 grid place-items-center bg-[#132a38]/55 p-3 sm:p-5"
					onMouseDown={(event) => { if (event.target === event.currentTarget && !guardando) setModalAbierto(false) }}
				>
					<section aria-labelledby="punto-form-title" aria-modal="true" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[#dbe4e8] bg-white p-5 shadow-2xl sm:p-6" role="dialog">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="m-0 text-[10px] font-bold uppercase text-[#1781a8]">PUNTO DE RETIRO</p>
								<h2 className="mb-0 mt-1 text-xl font-semibold" id="punto-form-title">Editar punto</h2>
							</div>
							<button aria-label="Cerrar" className="grid size-8 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9]" disabled={guardando} onClick={() => setModalAbierto(false)} type="button"><X size={16} /></button>
						</div>
						<form className="mt-5 grid gap-4" onSubmit={guardarPunto}>
							<label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
								Nombre del punto
								<input className="h-10 rounded border border-[#cbd8df] px-3 text-sm font-normal outline-none focus:border-[#1781a8]" maxLength="100" name="nombre" onChange={actualizarCampo} required value={formulario.nombre} />
							</label>
							<label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
								Facultad
								<input className="h-10 rounded border border-[#cbd8df] px-3 text-sm font-normal outline-none focus:border-[#1781a8]" maxLength="100" name="facultad" onChange={actualizarCampo} required value={formulario.facultad} />
							</label>
							<label className="grid gap-1.5 text-xs font-semibold text-[#405d6d]">
								Descripción <span className="font-normal text-[#81929f]">(opcional)</span>
								<textarea className="min-h-24 rounded border border-[#cbd8df] px-3 py-2 text-sm font-normal outline-none focus:border-[#1781a8]" name="descripcion" onChange={actualizarCampo} value={formulario.descripcion} />
							</label>
							<div className="rounded-md border border-[#dbe4e8] bg-[#f7f9fa] p-3">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="m-0 text-xs font-semibold text-[#31566a]">Coordenadas</p>
										<p className="m-0 mt-1 text-xs text-[#718896]">
											{Number.isFinite(formulario.latitud) && Number.isFinite(formulario.longitud)
												? `${formulario.latitud.toFixed(6)}, ${formulario.longitud.toFixed(6)}`
												: 'Sin ubicación seleccionada'}
										</p>
									</div>
									<button className="inline-flex h-9 items-center gap-2 rounded border border-[#cbd8df] bg-white px-3 text-xs font-semibold text-[#31566a] hover:bg-[#edf5f8]" onClick={abrirSelectorUbicacion} type="button">
										<MapPin size={15} /> Ubicación
									</button>
								</div>
							</div>
							{error && <p className="m-0 text-sm text-[#963d38]" role="alert">{error}</p>}
							<div className="mt-1 flex justify-end gap-2 border-t border-[#e7edef] pt-4">
								<button className="rounded border border-[#cbd8df] px-4 py-2 text-sm font-semibold hover:bg-[#f3f7f9]" disabled={guardando} onClick={() => setModalAbierto(false)} type="button">Cancelar</button>
								<button className="rounded bg-[#0b4263] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155779] disabled:opacity-60" disabled={guardando} type="submit">{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
							</div>
						</form>
					</section>
				</div>
			)}

			{modalUbicacionAbierto && (
				<div className="fixed inset-0 z-[60] grid place-items-center bg-[#132a38]/65 p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalUbicacionAbierto(false) }}>
					<section aria-labelledby="ubicacion-modal-title" aria-modal="true" className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#dbe4e8] bg-white p-4 shadow-2xl sm:p-6" role="dialog">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#1781a8]">UBICACIÓN DEL PUNTO</p>
								<h2 className="mb-0 mt-1 text-lg font-semibold" id="ubicacion-modal-title">Seleccionar en el mapa</h2>
							</div>
							<button aria-label="Cerrar mapa" className="grid size-8 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9]" onClick={() => setModalUbicacionAbierto(false)} type="button"><X size={16} /></button>
						</div>
						<SelectorUbicacionPunto
							centro={coordenadasTemporales ? [coordenadasTemporales.latitud, coordenadasTemporales.longitud] : undefined}
							coordenadas={coordenadasTemporales}
							onSeleccionar={setCoordenadasTemporales}
							seleccionActiva
						/>
						<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
							<p className="m-0 text-xs text-[#718896]" role="status">
								{coordenadasTemporales
									? `Ubicación seleccionada: ${coordenadasTemporales.latitud.toFixed(6)}, ${coordenadasTemporales.longitud.toFixed(6)}`
									: 'Haz clic en el mapa para seleccionar la ubicación.'}
							</p>
							<div className="flex gap-2">
								<button className="rounded border border-[#cbd8df] px-4 py-2 text-sm font-semibold hover:bg-[#f3f7f9]" onClick={() => setModalUbicacionAbierto(false)} type="button">Cancelar</button>
								<button
									className="rounded bg-[#0b4263] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155779] disabled:cursor-not-allowed disabled:opacity-60"
									disabled={!coordenadasTemporales}
									onClick={() => {
										setFormulario((actual) => ({
											...actual,
											latitud: coordenadasTemporales.latitud,
											longitud: coordenadasTemporales.longitud,
										}))
										setModalUbicacionAbierto(false)
									}}
									type="button"
								>Usar ubicación</button>
							</div>
						</div>
					</section>
				</div>
			)}
		</section>
	)
}

export default PaginaPuntosRetiro
