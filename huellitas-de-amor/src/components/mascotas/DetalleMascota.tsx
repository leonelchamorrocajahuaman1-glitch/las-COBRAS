import { CalendarHeart, Check, ClipboardList, Heart, MapPin, Ruler, ShieldCheck, Sparkles, Venus, Mars, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { boton } from '../../lib/estilos'
import { ETIQUETA_ESPECIE, ETIQUETA_SEXO, edadTexto } from '../../lib/mascotas'
import type { Mascota } from '../../types'
import { EtiquetaEstado } from '../ui/Etiquetas'
import { FotoMascota } from '../ui/FotoMascota'

interface Props {
  mascota: Mascota
  alAdoptar: () => void
}

function Dato({ icono, etiqueta, valor }: { icono: ReactNode; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-crema-200">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-salvia-100 text-salvia-700">{icono}</span>
      <div>
        <dt className="text-xs font-bold tracking-wide text-tinta-suave uppercase">{etiqueta}</dt>
        <dd className="font-semibold">{valor}</dd>
      </div>
    </div>
  )
}

function Salud({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <Check className="mt-0.5 h-5 w-5 shrink-0 text-salvia-600" aria-label="Sí" />
      ) : (
        <X className="mt-0.5 h-5 w-5 shrink-0 text-durazno-600" aria-label="Pendiente" />
      )}
      <span>{texto}</span>
    </li>
  )
}

export function DetalleMascota({ mascota: m, alAdoptar }: Props) {
  const adoptado = m.estado === 'adoptado'
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9]">
        <FotoMascota foto={m.foto} anchos={[600, 1000, 1400]} sizes="(min-width: 768px) 768px, 100vw" className="h-full w-full" prioridad />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 sm:p-7 sm:pt-20">
          <EtiquetaEstado estado={m.estado} />
          <p className="mt-2 font-display text-4xl font-black text-white">{m.nombre}</p>
          <p className="text-lg text-white/90">
            {ETIQUETA_ESPECIE[m.especie]} · {edadTexto(m.edadMeses)}
          </p>
        </div>
      </div>

      <div className="space-y-7 p-5 sm:p-7">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Dato icono={<CalendarHeart className="h-5 w-5" aria-hidden="true" />} etiqueta="Edad" valor={edadTexto(m.edadMeses)} />
          <Dato
            icono={m.sexo === 'macho' ? <Mars className="h-5 w-5" aria-hidden="true" /> : <Venus className="h-5 w-5" aria-hidden="true" />}
            etiqueta="Sexo"
            valor={ETIQUETA_SEXO[m.sexo]}
          />
          <Dato icono={<Ruler className="h-5 w-5" aria-hidden="true" />} etiqueta="Tamaño" valor={m.tamano[0].toUpperCase() + m.tamano.slice(1)} />
          <Dato icono={<MapPin className="h-5 w-5" aria-hidden="true" />} etiqueta="Ubicación" valor={m.ubicacion} />
        </dl>

        <section aria-labelledby="historia">
          <h3 id="historia" className="mb-2 flex items-center gap-2 text-xl font-extrabold">
            <Heart className="h-5 w-5 text-durazno-600" aria-hidden="true" /> Su historia
          </h3>
          <p className="leading-relaxed text-tinta-suave">{m.historia}</p>
        </section>

        <section aria-labelledby="personalidad">
          <h3 id="personalidad" className="mb-2 flex items-center gap-2 text-xl font-extrabold">
            <Sparkles className="h-5 w-5 text-durazno-600" aria-hidden="true" /> Personalidad y comportamiento
          </h3>
          <p className="leading-relaxed text-tinta-suave">{m.personalidad}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {m.rasgos.map((r) => (
              <li key={r} className="rounded-full bg-salvia-100 px-3 py-1 text-sm font-semibold text-salvia-800">{r}</li>
            ))}
          </ul>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section aria-labelledby="salud" className="rounded-2xl bg-salvia-50 p-5 ring-1 ring-salvia-100">
            <h3 id="salud" className="mb-3 flex items-center gap-2 text-lg font-extrabold">
              <ShieldCheck className="h-5 w-5 text-salvia-600" aria-hidden="true" /> Salud
            </h3>
            <ul className="space-y-2 text-tinta-suave">
              <Salud ok={!/proceso|falta/i.test(m.vacunas)} texto={`Vacunas: ${m.vacunas}`} />
              <Salud ok={m.esterilizado} texto={m.esterilizado ? 'Esterilizado' : 'Aún no está esterilizado (se hará a la edad indicada)'} />
              <Salud ok={m.desparasitado} texto={m.desparasitado ? 'Desparasitado' : 'Desparasitación pendiente'} />
            </ul>
          </section>
          <section aria-labelledby="requisitos" className="rounded-2xl bg-durazno-100/50 p-5 ring-1 ring-durazno-100">
            <h3 id="requisitos" className="mb-3 flex items-center gap-2 text-lg font-extrabold">
              <ClipboardList className="h-5 w-5 text-durazno-600" aria-hidden="true" /> Requisitos especiales
            </h3>
            {m.requisitos.length ? (
              <ul className="list-disc space-y-1.5 pl-5 text-tinta-suave">
                {m.requisitos.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-tinta-suave">No tiene requisitos especiales, solo mucho amor y responsabilidad.</p>
            )}
          </section>
        </div>

        <div className="sticky bottom-0 -mx-5 border-t border-crema-200 bg-crema-50/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
          {adoptado ? (
            <p className="text-center font-semibold text-durazno-700">
              🎉 {m.nombre} ya encontró una familia. ¡Conoce a los demás que siguen esperando!
            </p>
          ) : (
            <button type="button" onClick={alAdoptar} className={`${boton.primario} w-full py-4 text-lg`} data-autofoco>
              <Heart className="h-5 w-5" aria-hidden="true" /> Quiero adoptarlo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
