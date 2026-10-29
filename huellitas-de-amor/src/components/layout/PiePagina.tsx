import { Heart, Mail, MapPin, Phone } from 'lucide-react'
import { ORGANIZACION } from '../../config/organizacion'
import { MODO_DEMO } from '../../services/api'
import { Logo } from '../ui/Logo'
import { SECCIONES } from '../../config/secciones'

const AÑO = new Date().getFullYear()

export function PiePagina() {
  const redes = Object.entries(ORGANIZACION.redes).filter(([, url]) => url)
  return (
    <footer className="bg-salvia-900 text-salvia-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo claro />
          <p className="mt-4 max-w-sm text-salvia-200">
            Rescatamos, cuidamos y buscamos hogares responsables para animales abandonados. Adoptar es un acto de amor para toda la vida.
          </p>
          {redes.length > 0 && (
            <ul className="mt-5 flex gap-3">
              {redes.map(([red, url]) => (
                <li key={red}>
                  <a href={url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold capitalize hover:bg-white/20">
                    {red}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Enlaces útiles">
          <h2 className="font-display text-lg font-extrabold text-white">Enlaces útiles</h2>
          <ul className="mt-4 space-y-2">
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-salvia-200 transition hover:text-white">{s.texto}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-display text-lg font-extrabold text-white">Contacto</h2>
          <ul className="mt-4 space-y-3 text-salvia-200">
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <a href={`mailto:${ORGANIZACION.correo}`} className="hover:text-white">{ORGANIZACION.correo}</a>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <a href={`https://wa.me/${ORGANIZACION.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-white">{ORGANIZACION.telefono}</a>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{ORGANIZACION.direccion}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-salvia-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {AÑO} {ORGANIZACION.nombre}. Hecho con <Heart className="inline h-4 w-4 fill-durazno-300 text-durazno-300" aria-label="amor" /> por los animales.
          </p>
          <p>
            Fotografías: <a href="https://unsplash.com/license" target="_blank" rel="noreferrer" className="underline hover:text-white">Unsplash</a>
            {MODO_DEMO && ' · Sitio de demostración: formularios sin conexión a un servidor.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
