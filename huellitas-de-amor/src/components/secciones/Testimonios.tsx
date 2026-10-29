import { Quote } from 'lucide-react'
import { TESTIMONIOS } from '../../data/contenido'
import { EncabezadoSeccion } from '../ui/EncabezadoSeccion'

export function Testimonios() {
  return (
    <section aria-labelledby="titulo-testimonios" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <EncabezadoSeccion id="titulo-testimonios" antetitulo="Testimonios" titulo="Lo que dicen quienes adoptaron">
        <span className="text-sm">Testimonios de ejemplo para la demostración del sitio.</span>
      </EncabezadoSeccion>
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIOS.map((t) => (
          <figure key={t.nombre} className="revelar relative rounded-3xl bg-white p-7 shadow-suave ring-1 ring-crema-200">
            <Quote className="h-9 w-9 text-durazno-300" aria-hidden="true" />
            <blockquote className="mt-4 text-lg leading-relaxed text-tinta">“{t.texto}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-salvia-100 font-display font-black text-salvia-700" aria-hidden="true">
                {t.nombre[0]}
              </span>
              <span>
                <span className="block font-bold">{t.nombre}</span>
                <span className="block text-sm text-tinta-suave">
                  {t.adopto} · {t.ciudad}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
