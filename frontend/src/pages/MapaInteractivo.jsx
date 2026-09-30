import { useEffect, useState } from 'react'
import { AlertCircle, Building2, Clock3, MapPin, PackageOpen, Search, X } from 'lucide-react'
import { apiRequest } from '../config/apiClient.js'

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' })

const estadosObjeto = {
	EN_REVISION: { label: 'En revisión', className: 'bg-[#fff5e8] text-[#94601e]' },
	DISPONIBLE: { label: 'Disponible', className: 'bg-[#e8f5ed] text-[#24744e]' },
	ENTREGADO: { label: 'Entregado', className: 'bg-[#edf0f2] text-[#687783]' },
}

function MapaInteractivo() {
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

	return (
		<section aria-label="Puntos de retiro y objetos recientes" className="mt-7">
			<div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#dbe4e8] pb-4">
				<div>
					  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#658090]">UBICACIONES REGISTRADAS</p>
					<p className="m-0 text-sm text-[#687f8d]">Cada punto muestra sus cinco objetos no privados más recientes.</p>
				</div>
				{!cargando && !error && (
					<span className="text-xs font-semibold text-[#31566a]">
						{puntosRetiro.length} {puntosRetiro.length === 1 ? 'punto de retiro' : 'puntos de retiro'}
					</span>
				)}
			</div>

			{error && (
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">
					<span className="flex items-center gap-2"><AlertCircle aria-hidden="true" size={17} />{error}</span>
					<button className="rounded border border-[#dba9a4] px-3 py-1.5 text-xs font-semibold hover:bg-white" onClick={reintentar} type="button">Reintentar</button>
				</div>
			)}

			{cargando && (
				<div aria-label="Cargando puntos de retiro" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" role="status">
					{[1, 2, 3].map((item) => (
						<div className="animate-pulse rounded-md border border-[#dbe4e8] bg-white p-5" key={item}>
							<div className="h-4 w-2/3 rounded bg-[#e7edef]" />
							<div className="mt-3 h-3 w-1/2 rounded bg-[#edf1f3]" />
							<div className="mt-5 h-32 rounded border border-[#edf1f3] bg-[#f7f9fa]" />
						</div>
					))}
				</div>
			)}

			{!cargando && !error && puntosRetiro.length === 0 && (
				<div className="rounded-md border border-dashed border-[#cbd8df] bg-white px-5 py-12 text-center">
					<MapPin aria-hidden="true" className="mx-auto text-[#7b929f]" size={23} />
					<p className="mb-0 mt-3 text-sm font-semibold text-[#31566a]">No hay puntos de retiro registrados.</p>
				</div>
			)}

			{!cargando && !error && puntosRetiro.length > 0 && (
				<div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
					{puntosRetiro.map((punto) => (
						<article className="overflow-hidden rounded-md border border-[#dbe4e8] bg-white" key={punto.id}>
							<header className="border-b border-[#e7edef]">
								<button className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-[#fbfcfc] focus-visible:outline-2 focus-visible:outline-[#1781a8]" onClick={() => abrirPunto(punto)} type="button">
									<span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e9f4f8] text-[#16769c]">
										<Building2 aria-hidden="true" size={18} />
									</span>
									<span className="min-w-0 flex-1">
										<span className="block wrap-break-word text-sm font-semibold text-[#193449]">{punto.nombre}</span>
										<span className="mt-1 block text-xs text-[#687f8d]">{punto.facultad}</span>
										{punto.descripcion && <span className="mt-1 block wrap-break-word text-xs text-[#81929f]">{punto.descripcion}</span>}
									</span>
									<span className={`shrink-0 rounded px-2 py-1 text-[10px] font-semibold ${punto.habilitado ? 'bg-[#e8f5ed] text-[#24744e]' : 'bg-[#edf0f2] text-[#687783]'}`}>
										{punto.habilitado ? 'Activo' : 'Inactivo'}
									</span>
								</button>
							</header>

							<section aria-label={`Últimos objetos en ${punto.nombre}`} className="m-3 rounded border border-[#dfe7eb] bg-[#f7f9fa] p-3">
								<div className="mb-2 flex items-center justify-between gap-2">
									<h3 className="m-0 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[#536d7c]">
										<PackageOpen aria-hidden="true" size={15} /> Objetos recientes
									</h3>
									<span className="text-[10px] text-[#81929f]">{punto.objetos.length} de 5</span>
								</div>

								{punto.objetos.length === 0 ? (
									<p className="m-0 rounded border border-dashed border-[#d5e0e5] bg-white px-3 py-4 text-center text-xs text-[#718896]">
										Aún no hay objetos registrados en este punto.
									</p>
								) : (
									<ul className="m-0 divide-y divide-[#e4eaed] rounded border border-[#e4eaed] bg-white p-0">
										{punto.objetos.map((objeto) => {
											const estado = estadosObjeto[objeto.estado] || estadosObjeto.EN_REVISION
											return (
												<li className="flex min-w-0 items-start justify-between gap-2 px-3 py-2.5" key={objeto.id}>
													<div className="min-w-0">
														<p className="m-0 wrap-break-word text-xs font-semibold text-[#31566a]">{objeto.descripcion}</p>
														<p className="m-0 mt-1 flex items-center gap-1 text-[10px] text-[#81929f]">
															<Clock3 aria-hidden="true" size={11} />
															{formatoFecha.format(new Date(objeto.createdAt))}
															{objeto.categoria?.nombre ? ` · ${objeto.categoria.nombre}` : ''}
														</p>
													</div>
													<span className={`shrink-0 rounded px-1.5 py-1 text-[9px] font-semibold ${estado.className}`}>{estado.label}</span>
												</li>
											)
										})}
									</ul>
								)}
								<button className="mt-2 w-full rounded border border-[#cbd8df] bg-white px-3 py-2 text-xs font-semibold text-[#31566a] hover:bg-[#edf5f8]" onClick={() => abrirPunto(punto)} type="button">
									Ver todos los objetos
								</button>
							</section>
						</article>
					))}
				</div>

				)}

				{puntoSeleccionado && (
					<div className="fixed inset-0 z-50 grid place-items-center bg-[#102a3a]/55 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setPuntoSeleccionado(null) }}>
						<section aria-labelledby="detalle-punto-titulo" aria-modal="true" className="flex max-h-[92dvh] w-full max-w-230 flex-col overflow-hidden rounded-lg border border-[#dbe4e8] bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog">
							<header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#dbe4e8] px-5 py-4 sm:px-6">
								<div className="flex min-w-0 items-start gap-3">
									<span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#e9f4f8] text-[#16769c]"><Building2 aria-hidden="true" size={19} /></span>
									<div className="min-w-0">
										<p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#1781a8]">PUNTO DE RETIRO</p>
										<h2 className="m-0 mt-1 wrap-break-word text-lg font-semibold text-[#193449]" id="detalle-punto-titulo">{puntoSeleccionado.nombre}</h2>
										<p className="m-0 mt-1 text-xs text-[#687f8d]">{puntoSeleccionado.facultad}</p>
									</div>
								</div>
								<button aria-label="Cerrar detalle del punto" className="grid size-9 shrink-0 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9]" onClick={() => setPuntoSeleccionado(null)} type="button"><X size={17} /></button>
							</header>

							<div className="grid min-h-0 grid-cols-1 gap-5 overflow-y-auto p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)] md:p-6">
								<div className="min-w-0">
									<form className="flex gap-2" onSubmit={buscarObjetos}>
										<label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-[#cbd8df] bg-white px-3 focus-within:border-[#1781a8] focus-within:ring-2 focus-within:ring-[#1781a8]/15">
											<Search aria-hidden="true" className="shrink-0 text-[#718896]" size={17} />
											<input autoComplete="off" className="w-full min-w-0 border-0 bg-transparent text-sm outline-none placeholder:text-[#8999a3]" onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por nombre del objeto" value={busqueda} />
										</label>
										<button className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#0b4263] px-3 text-xs font-semibold text-white hover:bg-[#155779]" type="submit"><Search aria-hidden="true" size={15} /><span>Buscar</span></button>
									</form>

									<div className="mt-4 overflow-hidden rounded-md border border-[#dbe4e8] bg-white">
										<div className="flex items-center justify-between gap-3 border-b border-[#e7edef] bg-[#f7f9fa] px-4 py-3">
											<h3 className="m-0 text-xs font-semibold text-[#31566a]">Objetos en este punto</h3>
											<span className="text-[10px] text-[#81929f]">{cargandoObjetos ? 'Cargando...' : `${objetosFiltrados.length} ${objetosFiltrados.length === 1 ? 'resultado' : 'resultados'}`}</span>
										</div>
										{cargandoObjetos ? (
											<p className="m-0 px-4 py-8 text-center text-sm text-[#718896]" role="status">Cargando objetos del punto...</p>
										) : errorObjetos ? (
											<div className="px-4 py-5 text-center">
												<p className="m-0 text-sm text-[#963d38]" role="alert">{errorObjetos}</p>
												<button className="mt-3 rounded border border-[#cbd8df] px-3 py-1.5 text-xs font-semibold text-[#31566a] hover:bg-[#f3f7f9]" onClick={reintentarDetalle} type="button">Reintentar</button>
											</div>
										) : objetosFiltrados.length === 0 ? (
											<p className="m-0 px-4 py-8 text-center text-sm text-[#718896]">{objetosPunto.length === 0 ? 'No hay objetos registrados en este punto.' : 'No se encontraron objetos con ese nombre.'}</p>
										) : (
											<ul className="m-0 max-h-[50dvh] divide-y divide-[#e7edef] overflow-y-auto p-0">
												{objetosFiltrados.map((objeto) => {
													const estado = estadosObjeto[objeto.estado] || estadosObjeto.EN_REVISION
													return (
														<li className="flex min-w-0 items-start justify-between gap-3 px-4 py-3" key={objeto.id}>
															<div className="min-w-0">
																<p className="m-0 wrap-break-word text-sm font-semibold text-[#31566a]">{objeto.descripcion}</p>
																<p className="m-0 mt-1 flex flex-wrap items-center gap-1 text-[10px] text-[#81929f]">
																	<Clock3 aria-hidden="true" size={11} /> {formatoFecha.format(new Date(objeto.createdAt))}
																	{objeto.categoria?.nombre && <span>· {objeto.categoria.nombre}</span>}
																</p>
															</div>
															<span className={`shrink-0 rounded px-2 py-1 text-[10px] font-semibold ${estado.className}`}>{estado.label}</span>
														</li>
													)
												})}
											</ul>
										)}
									</div>
								</div>

								<aside className="rounded-md border border-[#dbe4e8] bg-[#f7f9fa] p-4">
									<div className="mb-3 flex items-center gap-2 text-[#16769c]">
										<MapPin aria-hidden="true" size={16} />
										<p className="m-0 text-[10px] font-bold uppercase tracking-widest">Descripción del punto</p>
									</div>
									<p className="m-0 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-[#405d6d]">
										{puntoSeleccionado.descripcion || 'Este punto de retiro no tiene una descripción registrada.'}
									</p>
								</aside>
							</div>
						</section>
					</div>
				)}
		</section>
	)
}

export default MapaInteractivo
