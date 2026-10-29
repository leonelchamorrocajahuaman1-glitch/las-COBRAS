import { ArrowLeft, CheckCircle2, Info, Loader2, Send } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ErrorEnvio, enviarSolicitud, type ResultadoEnvio } from '../../services/api'
import { boton, campo } from '../../lib/estilos'
import { validarSolicitud, type Errores, type SolicitudAdopcion } from '../../lib/validacion'
import type { Mascota } from '../../types'
import { Campo } from '../ui/Campo'
import { FotoMascota } from '../ui/FotoMascota'

interface Props {
  mascota: Mascota
  alVolver?: () => void
  alTerminar: () => void
}

const VACIO: SolicitudAdopcion = { nombre: '', correo: '', telefono: '', ciudad: '', vivienda: '', motivo: '', acepta: false }
const VIVIENDAS = ['Departamento', 'Casa sin patio', 'Casa con patio o jardín', 'Casa de campo o chacra']

export function FormularioAdopcion({ mascota, alVolver, alTerminar }: Props) {
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState<Errores<SolicitudAdopcion>>({})
  const [intentado, setIntentado] = useState(false)
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'error'>('editando')
  const [mensajeError, setMensajeError] = useState('')
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null)
  const formulario = useRef<HTMLFormElement>(null)
  const confirmacion = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resultado) confirmacion.current?.focus()
  }, [resultado])

  const cambiar = <K extends keyof SolicitudAdopcion>(clave: K, valor: SolicitudAdopcion[K]) => {
    const nuevos = { ...datos, [clave]: valor }
    setDatos(nuevos)
    // Después del primer intento, los errores se corrigen en vivo mientras la persona escribe.
    if (intentado) setErrores(validarSolicitud(nuevos))
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    const encontrados = validarSolicitud(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length) {
      // Lleva el foco al primer campo con error para que sea fácil corregirlo.
      requestAnimationFrame(() => formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setEstado('enviando')
    try {
      const { acepta: _acepta, ...resto } = datos
      setResultado(await enviarSolicitud({ ...resto, mascotaId: mascota.id, mascotaNombre: mascota.nombre }))
    } catch (err) {
      setMensajeError(err instanceof ErrorEnvio ? err.message : 'Ocurrió un error inesperado. Inténtalo otra vez.')
      setEstado('error')
    }
  }

  if (resultado) {
    const primerNombre = datos.nombre.trim().split(/\s+/)[0]
    return (
      <div ref={confirmacion} tabIndex={-1} className="p-6 text-center focus:outline-none sm:p-10" role="status">
        <CheckCircle2 className="mx-auto h-16 w-16 text-salvia-600" aria-hidden="true" />
        <h3 className="mt-4 text-3xl font-black">¡Solicitud recibida!</h3>
        <p className="mx-auto mt-3 max-w-md text-lg text-tinta-suave">
          Gracias, {primerNombre}. Recibimos tu solicitud para adoptar a <strong className="text-tinta">{mascota.nombre}</strong>.
        </p>
        {resultado.modo === 'servidor' ? (
          <p className="mx-auto mt-4 max-w-md text-tinta-suave">
            Tu número de solicitud es <strong className="text-tinta">{resultado.referencia}</strong>. Nuestro equipo revisará tus datos y te
            escribirá a <strong className="text-tinta">{datos.correo}</strong> en un plazo de 2 a 3 días hábiles.
          </p>
        ) : (
          <div className="mx-auto mt-5 flex max-w-md gap-3 rounded-2xl bg-durazno-100/60 p-4 text-left text-sm text-tinta">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-durazno-700" aria-hidden="true" />
            <p>
              <strong>Sitio en modo demostración:</strong> todavía no está conectado a un servidor, así que esta solicitud no se envió ni se guardó.
              Referencia de prueba: <strong>{resultado.referencia}</strong>.
            </p>
          </div>
        )}
        <button type="button" onClick={alTerminar} className={`${boton.secundario} mt-7`}>
          Seguir viendo mascotas
        </button>
      </div>
    )
  }

  const enviando = estado === 'enviando'
  return (
    <form ref={formulario} onSubmit={enviar} noValidate className="space-y-5 p-5 sm:p-7" aria-describedby="nota-formulario">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-crema-200">
        <FotoMascota foto={mascota.foto} anchos={[120, 200]} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl" />
        <div>
          <p className="text-sm text-tinta-suave">Solicitud de adopción para</p>
          <p className="text-xl font-extrabold">{mascota.nombre}</p>
        </div>
        {alVolver && (
          <button type="button" onClick={alVolver} className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-salvia-700 hover:text-salvia-800">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Ver ficha
          </button>
        )}
      </div>
      <p id="nota-formulario" className="text-sm text-tinta-suave">
        Los campos con <span className="text-durazno-600">*</span> son obligatorios.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre completo" error={errores.nombre} obligatorio className="sm:col-span-2">
          <input type="text" autoComplete="name" value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} className={campo} data-autofoco />
        </Campo>
        <Campo etiqueta="Correo electrónico" error={errores.correo} obligatorio>
          <input type="email" autoComplete="email" value={datos.correo} onChange={(e) => cambiar('correo', e.target.value)} className={campo} />
        </Campo>
        <Campo etiqueta="Teléfono" error={errores.telefono} obligatorio ayuda="Celular de 9 dígitos o número con prefijo +">
          <input type="tel" autoComplete="tel" inputMode="tel" value={datos.telefono} onChange={(e) => cambiar('telefono', e.target.value)} className={campo} />
        </Campo>
        <Campo etiqueta="Ciudad" error={errores.ciudad} obligatorio>
          <input type="text" autoComplete="address-level2" value={datos.ciudad} onChange={(e) => cambiar('ciudad', e.target.value)} className={campo} />
        </Campo>
        <Campo etiqueta="Tipo de vivienda" error={errores.vivienda} obligatorio>
          <select value={datos.vivienda} onChange={(e) => cambiar('vivienda', e.target.value)} className={campo}>
            <option value="">Selecciona una opción</option>
            {VIVIENDAS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Campo>
        <Campo
          etiqueta="¿Por qué quieres adoptar?"
          error={errores.motivo}
          obligatorio
          ayuda="Cuéntanos de tu hogar, tu rutina y quiénes viven contigo."
          className="sm:col-span-2"
        >
          <textarea rows={4} value={datos.motivo} onChange={(e) => cambiar('motivo', e.target.value)} className={`${campo} resize-y`} />
        </Campo>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-salvia-50 p-4 ring-1 ring-salvia-100">
          <input
            type="checkbox"
            checked={datos.acepta}
            onChange={(e) => cambiar('acepta', e.target.checked)}
            aria-invalid={Boolean(errores.acepta)}
            aria-describedby={errores.acepta ? 'error-acepta' : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-salvia-600"
          />
          <span className="text-sm text-tinta">
            Entiendo que adoptar es un compromiso de muchos años y me comprometo a darle cuidados veterinarios, alimentación adecuada y un hogar
            seguro, y a permitir visitas de seguimiento. <span className="text-durazno-600" aria-hidden="true">*</span>
          </span>
        </label>
        {errores.acepta && (
          <p id="error-acepta" role="alert" className="mt-1 text-sm font-medium text-red-700">{errores.acepta}</p>
        )}
      </div>

      {estado === 'error' && (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200">{mensajeError}</p>
      )}

      <button type="submit" disabled={enviando} className={`${boton.primario} w-full py-4 text-lg`}>
        {enviando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
        {enviando ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
