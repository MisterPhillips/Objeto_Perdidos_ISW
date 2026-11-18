import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const centroCampus = [-36.8231422, -73.0125121]
const limitesCampus = [
	[-36.827, -73.0177],
	[-36.8193, -73.0063],
]

const iconoUbicacion = L.divIcon({
	className: '',
	html: '<span style="display:block;width:24px;height:24px;border:3px solid white;border-radius:50%;background:#d64b3c;box-shadow:0 1px 5px #19344980"></span>',
	iconSize: [24, 24],
	iconAnchor: [12, 12],
})

function CapturadorClicMapa({ seleccionActiva, onActivar, onSeleccionar }) {
	useMapEvents({
		click(event) {
			if (!seleccionActiva) {
				onActivar()
				return
			}

			onSeleccionar({
				latitud: event.latlng.lat,
				longitud: event.latlng.lng,
			})
		},
	})

	return null
}

function MarcadorUbicacion({ coordenadas }) {
	const marcadorRef = useRef(null)
	const posicion = [coordenadas.latitud, coordenadas.longitud]

	useEffect(() => {
		marcadorRef.current?.openPopup()
	}, [coordenadas])

	return (
		<Marker icon={iconoUbicacion} position={posicion} ref={marcadorRef}>
			<Popup>
				<p className="m-0 text-xs font-semibold text-[#193449]">Ubicación del punto de retiro</p>
			</Popup>
		</Marker>
	)
}

function SelectorUbicacionPunto({ centro = centroCampus, coordenadas, onActivar, onSeleccionar, seleccionActiva }) {
	return (
		<section aria-label="Seleccionar ubicación del punto de retiro" className="mt-7 overflow-hidden rounded-lg border border-[#dbe4e8] bg-white">
			<div className="border-b border-[#e7edef] px-4 py-4 sm:px-5">
				<p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#1781a8]">UBICACIÓN</p>
				<h2 className="m-0 mt-1 text-base font-semibold text-[#193449]">Localiza el punto en el mapa</h2>
				<p className="m-0 mt-1 text-xs text-[#687f8d]" role="status">
					{coordenadas
						? 'Ubicación seleccionada. Haz clic nuevamente para cambiarla.'
						: seleccionActiva
							? 'Selección activada. Ahora haz clic en la ubicación exacta.'
							: 'Haz un primer clic en el mapa para activar la selección; luego haz clic donde está el punto.'}
				</p>
			</div>
			<MapContainer
				center={centro}
				className="relative z-0 h-90 w-full sm:h-107.5"
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
				<CapturadorClicMapa
					onActivar={onActivar}
					onSeleccionar={onSeleccionar}
					seleccionActiva={seleccionActiva}
				/>
				{coordenadas && <MarcadorUbicacion coordenadas={coordenadas} />}
			</MapContainer>
		</section>
	)
}

export default SelectorUbicacionPunto
