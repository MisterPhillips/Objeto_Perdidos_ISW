import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const centroCampus = [-36.8231422, -73.0125121]
const limitesCampus = [
	[-36.827, -73.0177],
	[-36.8193, -73.0063],
]

const iconoPuntoRetiro = L.divIcon({
	className: '',
	html: '<span style="display:block;width:22px;height:22px;border:3px solid white;border-radius:50%;background:#0b4263;box-shadow:0 1px 5px #19344980"></span>',
	iconSize: [22, 22],
	iconAnchor: [11, 11],
	popupAnchor: [0, -12],
})

function MapaCampus({ puntosRetiro, onAbrirPunto }) {
	const puntosConUbicacion = puntosRetiro.filter(
		(punto) => Number.isFinite(punto.latitud) && Number.isFinite(punto.longitud),
	)

	return (
		<section aria-label="Mapa del Campus Collao" className="mb-8 overflow-hidden rounded-lg border border-[#dbe4e8] bg-white">
			<div className="border-b border-[#e7edef] px-4 py-4 sm:px-5">
				<p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#1781a8]">CAMPUS COLLAO</p>
				<h2 className="m-0 mt-1 text-base font-semibold text-[#193449]">Mapa interactivo</h2>
				<p className="m-0 mt-1 text-xs text-[#687f8d]">
					Universidad del Bío-Bío, sede Concepción. Puedes desplazarte por el campus y sus alrededores.
				</p>
			</div>
			<MapContainer
				center={centroCampus}
				className="h-90 w-full sm:h-107.5 relative z-0"
				doubleClickZoom="center"
				dragging 
				keyboard={false}
				maxBounds={limitesCampus}
				maxBoundsViscosity={1}
				maxZoom={19}
				minZoom={16}
				scrollWheelZoom="center"
				touchZoom="center"
				zoom={17}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					maxZoom={19}
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{puntosConUbicacion.map((punto) => (
					<Marker
						icon={iconoPuntoRetiro}
						key={punto.id}
						position={[punto.latitud, punto.longitud]}
						title={punto.nombre}
					>
						<Popup>
							<div className="min-w-52">
								<h3 className="m-0 text-sm font-semibold text-[#193449]">{punto.nombre}</h3>
								<p className="m-0 mt-1 text-xs text-[#526b79]">{punto.facultad}</p>
								{punto.descripcion && <p className="m-0 mt-2 text-xs text-[#526b79]">{punto.descripcion}</p>}
								<p className="m-0 mt-2 text-[10px] font-semibold text-[#536d7c]">Objetos recientes ({punto.objetos.length} de 5)</p>
								{punto.objetos.length === 0 ? (
									<p className="m-0 mt-1 text-xs text-[#718896]">Aún no hay objetos registrados en este punto.</p>
								) : (
									<ul className="m-0 mt-1 list-disc pl-4 text-xs text-[#526b79]">
										{punto.objetos.map((objeto) => (
											<li key={objeto.id}>
												{objeto.descripcion}
												{objeto.categoria?.nombre ? ` · ${objeto.categoria.nombre}` : ''}
											</li>
										))}
									</ul>
								)}
								<p className={`m-0 mt-2 text-[10px] font-semibold ${punto.habilitado ? 'text-[#24744e]' : 'text-[#687783]'}`}>
									{punto.habilitado ? 'Activo' : 'Inactivo'}
								</p>
								<button
									className="mt-2 rounded bg-[#0b4263] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#155779]"
									onClick={() => onAbrirPunto(punto)}
									type="button"
								>
									Ver todos los objetos
								</button>
							</div>
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</section>
	)
}

export default MapaCampus
