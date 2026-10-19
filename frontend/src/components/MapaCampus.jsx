import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const centroCampus = [-36.8231422, -73.0125121]
const limitesCampus = [
	[-36.827, -73.0177],
	[-36.8193, -73.0063],
]
const ubicacionObjeto = [-36.8229, -73.0134]

const iconoObjeto = L.icon({
	iconUrl: '/marcador-objeto.svg',
	iconSize: [42, 50],
	iconAnchor: [21, 48],
	popupAnchor: [0, -44],
})

function MapaCampus() {
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
				className="h-[360px] w-full sm:h-[430px]"
				doubleClickZoom="center"
				dragging 
				keyboard={false}
				maxBounds={limitesCampus}
				maxBoundsViscosity={1}
				maxZoom={19}
				minZoom={15}
				scrollWheelZoom="center"
				touchZoom="center"
				zoom={17}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					maxZoom={19}
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker icon={iconoObjeto} position={ubicacionObjeto}>
					<Popup>
						<div className="min-w-44">
							<h3 className="m-0 text-sm font-semibold text-[#193449]">Mochila azul</h3>
							<p className="mb-2 mt-1 text-xs text-[#526b79]">Mochila encontrada cerca de las dependencias del campus.</p>
							<span className="inline-block rounded bg-[#e8f5ed] px-2 py-1 text-[10px] font-semibold text-[#24744e]">
								Encontrado
							</span>
						</div>
					</Popup>
				</Marker>
			</MapContainer>
		</section>
	)
}

export default MapaCampus
