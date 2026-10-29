import { Calendar, MapPin } from 'lucide-react'
import { HISTORIAS } from '../../data/contenido'
import { EncabezadoSeccion } from '../ui/EncabezadoSeccion'
import { FotoMascota } from '../ui/FotoMascota'

export function Historias() {
  return (
    <section id="historias" aria-labelledby="titulo-historias" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion id="titulo-historias" antetitulo="Historias felices" titulo="Finales que son nuevos comienzos">
          Así cambió la vida de algunos rescatados (y de sus familias).
          <span className="mt-1 block text-sm">Historias de ejemplo para la demostración del sitio.</span>
        </EncabezadoSeccion>
        <div className="grid gap-8 lg:grid-cols-3">
          {HISTORIAS.map((h) => (
            <article key={h.id} className="revelar group overflow-hidden rounded-3xl bg-crema-50 shadow-suave ring-1 ring-crema-200">
              <div className="aspect-[4/3] overflow-hidden">
                <FotoMascota foto={h.foto} anchos={[400, 600, 800]} sizes="(min-width: 1024px) 33vw, 100vw" className="h-full w-full transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-extrabold">
                  {h.mascota} <span className="text-base font-bold text-durazno-600">y {h.familia}</span>
                </h3>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-tinta-suave">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" /> {h.ciudad}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" aria-hidden="true" /> Adoptado en {h.fecha.toLowerCase()}
                  </span>
                </p>
                <p className="mt-4 leading-relaxed text-tinta-suave">{h.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
