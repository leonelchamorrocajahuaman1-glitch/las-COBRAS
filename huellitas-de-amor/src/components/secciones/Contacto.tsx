import { CheckCircle2, Clock, Info, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { ORGANIZACION } from '../../config/organizacion'
import { boton, campo } from '../../lib/estilos'
import { validarContacto, type Errores, type MensajeContacto } from '../../lib/validacion'
import { ErrorEnvio, enviarContacto, type ResultadoEnvio } from '../../services/api'
import { Campo } from '../ui/Campo'
import { EncabezadoSeccion } from '../ui/EncabezadoSeccion'

const VACIO: MensajeContacto = { nombre: '', correo: '', asunto: '', mensaje: '' }
const ASUNTOS = ['Quiero adoptar', 'Quiero ser hogar temporal', 'Quiero ser voluntario/a', 'Reportar un animal en riesgo', 'Donaciones', 'Otro']

export function Contacto() {
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState<Errores<MensajeContacto>>({})
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null)
  const formulario = useRef<HTMLFormElement>(null)

  const cambiar = <K extends keyof MensajeContacto>(clave: K, valor: string) => {
    const nuevos = { ...datos, [clave]: valor }
    setDatos(nuevos)
    if (intentado) setErrores(validarContacto(nuevos))
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    const encontrados = validarContacto(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length) {
      requestAnimationFrame(() => formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setEnviando(true)
    setError('')
    try {
      setResultado(await enviarContacto(datos))
    } catch (err) {
      setError(err instanceof ErrorEnvio ? err.message : 'Ocurrió un error inesperado. Inténtalo otra vez.')
    } finally {
      setEnviando(false)
    }
  }

  function nuevoMensaje() {
    setDatos(VACIO)
    setErrores({})
    setIntentado(false)
    setResultado(null)
  }

  return (
    <section id="contacto" aria-labelledby="titulo-contacto" className="bg-crema-100/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion id="titulo-contacto" antetitulo="Contacto" titulo="¿Tienes preguntas? Escríbenos">
          Respondemos dudas sobre adopciones, voluntariado, hogares temporales y donaciones.
        </EncabezadoSeccion>

        <div className="grid gap-8 lg:grid-cols-5">
          <aside className="revelar space-y-4 lg:col-span-2" aria-label="Datos de contacto">
            {[
              { icono: Mail, titulo: 'Correo', valor: ORGANIZACION.correo, href: `mailto:${ORGANIZACION.correo}` },
              { icono: Phone, titulo: 'Teléfono / WhatsApp', valor: ORGANIZACION.telefono, href: `https://wa.me/${ORGANIZACION.whatsapp}` },
              { icono: MapPin, titulo: 'Refugio', valor: ORGANIZACION.direccion },
              { icono: Clock, titulo: 'Horario de visitas', valor: ORGANIZACION.horario },
            ].map(({ icono: Icono, titulo, valor, href }) => (
              <div key={titulo} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-suave ring-1 ring-crema-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-salvia-100 text-salvia-700">
                  <Icono className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-tinta-suave">{titulo}</p>
                  {href ? (
                    <a href={href} className="font-semibold text-salvia-700 underline-offset-4 hover:underline" target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                      {valor}
                    </a>
                  ) : (
                    <p className="font-semibold">{valor}</p>
                  )}
                </div>
              </div>
            ))}
          </aside>

          <div className="revelar rounded-3xl bg-white p-6 shadow-suave ring-1 ring-crema-200 sm:p-8 lg:col-span-3">
            {resultado ? (
              <div className="py-8 text-center" role="status">
                <CheckCircle2 className="mx-auto h-14 w-14 text-salvia-600" aria-hidden="true" />
                <h3 className="mt-4 text-2xl font-black">¡Mensaje recibido!</h3>
                <p className="mx-auto mt-2 max-w-md text-tinta-suave">
                  Gracias por escribirnos, {datos.nombre.trim().split(/\s+/)[0]}.
                  {resultado.modo === 'servidor' ? ` Te responderemos a ${datos.correo} lo antes posible.` : ''}
                </p>
                {resultado.modo === 'demo' && (
                  <p className="mx-auto mt-4 flex max-w-md gap-2 rounded-2xl bg-durazno-100/60 p-4 text-left text-sm">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-durazno-700" aria-hidden="true" />
                    <span>
                      <strong>Sitio en modo demostración:</strong> el formulario aún no está conectado a un servidor, así que este mensaje no se
                      envió. Mientras tanto, puedes escribirnos a <a className="font-semibold underline" href={`mailto:${ORGANIZACION.correo}`}>{ORGANIZACION.correo}</a>.
                    </span>
                  </p>
                )}
                <button type="button" onClick={nuevoMensaje} className={`${boton.contorno} mt-6`}>
                  Escribir otro mensaje
                </button>
              </div>
            ) : (
              <form ref={formulario} onSubmit={enviar} noValidate className="grid gap-4 sm:grid-cols-2" aria-label="Formulario de contacto">
                <Campo etiqueta="Nombre completo" error={errores.nombre} obligatorio>
                  <input type="text" autoComplete="name" value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} className={campo} />
                </Campo>
                <Campo etiqueta="Correo electrónico" error={errores.correo} obligatorio>
                  <input type="email" autoComplete="email" value={datos.correo} onChange={(e) => cambiar('correo', e.target.value)} className={campo} />
                </Campo>
                <Campo etiqueta="Asunto" error={errores.asunto} obligatorio className="sm:col-span-2">
                  <select value={datos.asunto} onChange={(e) => cambiar('asunto', e.target.value)} className={campo}>
                    <option value="">Selecciona un asunto</option>
                    {ASUNTOS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </Campo>
                <Campo etiqueta="Mensaje" error={errores.mensaje} obligatorio className="sm:col-span-2">
                  <textarea rows={5} value={datos.mensaje} onChange={(e) => cambiar('mensaje', e.target.value)} className={`${campo} resize-y`} />
                </Campo>
                {error && (
                  <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200 sm:col-span-2">{error}</p>
                )}
                <button type="submit" disabled={enviando} className={`${boton.primario} sm:col-span-2`}>
                  {enviando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
                  {enviando ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
