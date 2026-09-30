import { useEffect, useState } from 'react'
import { AlertCircle, Building2, Clock3, MapPin, PackageOpen } from 'lucide-react'
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

	function reintentar() {
		setError('')
		setCargando(true)
		setIntentos((actuales) => actuales + 1)
	}

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
							<header className="flex items-start gap-3 border-b border-[#e7edef] px-4 py-4">
								<span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e9f4f8] text-[#16769c]">
									<Building2 aria-hidden="true" size={18} />
								</span>
								<div className="min-w-0 flex-1">
									  <h2 className="m-0 wrap-break-word text-sm font-semibold text-[#193449]">{punto.nombre}</h2>
									<p className="m-0 mt-1 text-xs text-[#687f8d]">{punto.facultad}</p>
									  {punto.descripcion && <p className="m-0 mt-1 wrap-break-word text-xs text-[#81929f]">{punto.descripcion}</p>}
								</div>
								<span className={`shrink-0 rounded px-2 py-1 text-[10px] font-semibold ${punto.habilitado ? 'bg-[#e8f5ed] text-[#24744e]' : 'bg-[#edf0f2] text-[#687783]'}`}>
									{punto.habilitado ? 'Activo' : 'Inactivo'}
								</span>
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
							</section>
						</article>
					))}
				</div>
			)}
		</section>
	)
}

export default MapaInteractivo
