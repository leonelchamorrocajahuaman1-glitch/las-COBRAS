import { Heart, MapPin } from 'lucide-react'
import { boton } from '../../lib/estilos'
import { ETIQUETA_ESPECIE, ETIQUETA_SEXO, edadTexto } from '../../lib/mascotas'
import type { Mascota } from '../../types'
import { Chip, EtiquetaEstado } from '../ui/Etiquetas'
import { FotoMascota } from '../ui/FotoMascota'

interface Props {
  mascota: Mascota
  alVerDetalle: (m: Mascota) => void
  alAdoptar: (m: Mascota) => void
}

export function TarjetaMascota({ mascota: m, alVerDetalle, alAdoptar }: Props) {
  const adoptado = m.estado === 'adoptado'
  return (
    <article
      className="revelar group flex flex-col overflow-hidden rounded-3xl bg-white shadow-suave ring-1 ring-crema-200 transition duration-300 hover:-translate-y-1 hover:shadow-elevada"
      aria-labelledby={`nombre-${m.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <FotoMascota
          foto={m.foto}
          anchos={[400, 600, 800]}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`h-full w-full transition duration-700 group-hover:scale-105 ${adoptado ? 'grayscale-[40%]' : ''}`}
        />
        <EtiquetaEstado estado={m.estado} className="absolute top-3 left-3" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 id={`nombre-${m.id}`} className="text-2xl font-extrabold">
            {m.nombre}
          </h3>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm text-tinta-suave">
            <MapPin className="h-4 w-4 text-durazno-600" aria-hidden="true" />
            {m.ubicacion}
          </span>
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Características">
          <li><Chip>{ETIQUETA_ESPECIE[m.especie]}</Chip></li>
          <li><Chip>{edadTexto(m.edadMeses)}</Chip></li>
          <li><Chip>{ETIQUETA_SEXO[m.sexo]}</Chip></li>
          <li><Chip>Tamaño {m.tamano}</Chip></li>
        </ul>
        <p className="mt-3 flex-1 text-tinta-suave">{m.descripcion}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => alVerDetalle(m)} className={`${boton.contorno} ${boton.pequeno}`}>
            Conocer más
          </button>
          <button
            type="button"
            onClick={() => alAdoptar(m)}
            disabled={adoptado}
            className={`${boton.primario} ${boton.pequeno}`}
            aria-label={adoptado ? `${m.nombre} ya fue adoptado` : `Adoptar a ${m.nombre}`}
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {adoptado ? 'Adoptado' : 'Adoptar'}
          </button>
        </div>
      </div>
    </article>
  )
}
