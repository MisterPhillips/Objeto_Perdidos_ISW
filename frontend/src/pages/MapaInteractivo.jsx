import { AlertCircle, Building2, Clock3, MapPin, Search, X } from 'lucide-react'
import MapaCampus from '../components/MapaCampus.jsx'
import { useMapaInteractivo } from '../components/useMapaInteractivo.js'

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' })

const estadosObjeto = {
	DISPONIBLE: { label: 'Disponible', className: 'bg-[#e8f5ed] text-[#24744e]' },
	ENTREGADO: { label: 'Entregado', className: 'bg-[#edf0f2] text-[#687783]' },
}

function MapaInteractivo() {
	const {
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
	} = useMapaInteractivo()
	const puntosConCoordenadas = puntosRetiro.filter(
		(punto) => Number.isFinite(punto.latitud) && Number.isFinite(punto.longitud),
	)

	return (
		<>
			<MapaCampus onAbrirPunto={abrirPunto} puntosRetiro={puntosRetiro} />
			<section aria-label="Estado de los puntos de retiro en el mapa" className="mt-4">
				{error && (
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">
						<span className="flex items-center gap-2"><AlertCircle aria-hidden="true" size={17} />{error}</span>
						<button className="rounded border border-[#dba9a4] px-3 py-1.5 text-xs font-semibold hover:bg-white" onClick={reintentar} type="button">Reintentar</button>
					</div>
				)}
				{cargando && <p className="m-0 text-sm text-[#687f8d]" role="status">Cargando puntos de retiro...</p>}
				{!cargando && !error && puntosRetiro.length === 0 && (
					<p className="m-0 flex items-center gap-2 text-sm text-[#687f8d]">
						<MapPin aria-hidden="true" size={17} />No hay puntos de retiro registrados.
					</p>
				)}
				{!cargando && !error && puntosRetiro.length > puntosConCoordenadas.length && (
					<p className="m-0 text-sm text-[#687f8d]">
						{puntosConCoordenadas.length} de {puntosRetiro.length} puntos aparecen en el mapa. Los demás aún no tienen latitud y longitud registradas.
					</p>
				)}
				{puntoSeleccionado && (
					<div className="fixed inset-0 z-50 grid place-items-center bg-[#102a3a]/55 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) cerrarPunto() }}>
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
								<button aria-label="Cerrar detalle del punto" className="grid size-9 shrink-0 place-items-center rounded border border-[#d5e0e5] text-[#526b79] hover:bg-[#f3f7f9]" onClick={cerrarPunto} type="button"><X size={17} /></button>
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
														const estado = estadosObjeto[objeto.estado] || estadosObjeto.DISPONIBLE
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
		</>
	)
}

export default MapaInteractivo
