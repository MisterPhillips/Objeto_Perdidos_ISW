import { useState } from 'react'
import { AlertCircle, ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SelectorUbicacionPunto from '../components/SelectorUbicacionPunto.jsx'
import { crearPuntoRetiro } from '../services/puntoRetiroService.js'

const formularioInicial = { nombre: '', facultad: '', descripcion: '' }
const campoClase = 'mt-1 h-11 w-full rounded-md border border-[#cbd8df] bg-white px-3 text-sm outline-none focus:border-[#1781a8] focus:ring-2 focus:ring-[#1781a8]/15'

function PaginaCrearPuntoRetiro() {
	const navigate = useNavigate()
	const [formulario, setFormulario] = useState(formularioInicial)
	const [coordenadas, setCoordenadas] = useState(null)
	const [seleccionActiva, setSeleccionActiva] = useState(false)
	const [guardando, setGuardando] = useState(false)
	const [error, setError] = useState('')

	function actualizarCampo(event) {
		const { name, value } = event.target
		setFormulario((actual) => ({ ...actual, [name]: value }))
	}

	async function guardarPuntoRetiro(event) {
		event.preventDefault()
		setError('')

		if (!coordenadas) {
			setError('Selecciona la ubicación del punto en el mapa antes de guardar.')
			return
		}

		setGuardando(true)
		try {
			const respuesta = await crearPuntoRetiro({
				nombre: formulario.nombre.trim(),
				facultad: formulario.facultad.trim(),
				descripcion: formulario.descripcion.trim() || null,
				latitud: coordenadas.latitud,
				longitud: coordenadas.longitud,
			})
			navigate('/app/mapa', {
				replace: true,
				state: { aviso: `El punto "${respuesta.puntoRetiro.nombre}" fue creado correctamente.` },
			})
		} catch (requestError) {
			setError(requestError.message || 'No se pudo crear el punto de retiro.')
		} finally {
			setGuardando(false)
		}
	}

	return (
		<section aria-label="Agregar punto de retiro" className="mt-7">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<p className="m-0 max-w-2xl text-sm text-[#687f8d]">
					Completa los datos del punto y selecciónalo en el mapa para registrar sus coordenadas.
				</p>
				<button
					className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd8df] bg-white px-3 text-xs font-semibold text-[#31566a] hover:bg-[#f3f7f9]"
					onClick={() => navigate('/app/mapa')}
					type="button"
				>
					<ArrowLeft aria-hidden="true" size={15} />
					Volver al mapa
				</button>
			</div>

			<form className="rounded-lg border border-[#dbe4e8] bg-white p-4 sm:p-6" onSubmit={guardarPuntoRetiro}>
				<div className="grid gap-5 md:grid-cols-2">
					<label className="text-xs font-semibold text-[#31566a]">
						Nombre del punto <span aria-hidden="true" className="text-[#b13f38]">*</span>
						<input
							className={campoClase}
							maxLength={100}
							name="nombre"
							onChange={actualizarCampo}
							required
							value={formulario.nombre}
						/>
					</label>
					<label className="text-xs font-semibold text-[#31566a]">
						Facultad <span aria-hidden="true" className="text-[#b13f38]">*</span>
						<input
							className={campoClase}
							maxLength={100}
							name="facultad"
							onChange={actualizarCampo}
							required
							value={formulario.facultad}
						/>
					</label>
					<label className="text-xs font-semibold text-[#31566a] md:col-span-2">
						Descripción <span className="font-normal text-[#81929f]">(opcional)</span>
						<textarea
							className="mt-1 min-h-24 w-full rounded-md border border-[#cbd8df] bg-white px-3 py-2 text-sm outline-none focus:border-[#1781a8] focus:ring-2 focus:ring-[#1781a8]/15"
							name="descripcion"
							onChange={actualizarCampo}
							value={formulario.descripcion}
						/>
					</label>
				</div>

				<SelectorUbicacionPunto
					coordenadas={coordenadas}
					onActivar={() => setSeleccionActiva(true)}
					onSeleccionar={setCoordenadas}
					seleccionActiva={seleccionActiva}
				/>

				{error && (
					<div className="mt-5 flex items-center gap-2 rounded-md border border-[#eccaca] bg-[#fff5f4] px-4 py-3 text-sm text-[#963d38]" role="alert">
						<AlertCircle aria-hidden="true" size={17} />
						{error}
					</div>
				)}

				<div className="mt-6 flex justify-end border-t border-[#e7edef] pt-5">
					<button
						className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0b4263] px-4 text-sm font-semibold text-white hover:bg-[#155779] disabled:cursor-not-allowed disabled:opacity-60"
						disabled={guardando}
						type="submit"
					>
						<Save aria-hidden="true" size={16} />
						{guardando ? 'Guardando...' : 'Guardar punto de retiro'}
					</button>
				</div>
			</form>
		</section>
	)
}

export default PaginaCrearPuntoRetiro
