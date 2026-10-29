import { ArrowRight } from 'lucide-react'
import type { Mascota } from '../../types'
import { boton } from '../../lib/estilos'
import { TarjetaMascota } from '../mascotas/TarjetaMascota'
import { EncabezadoSeccion } from '../ui/EncabezadoSeccion'

interface Props {
  mascotas: Mascota[]
  alVerDetalle: (m: Mascota) => void
  alAdoptar: (m: Mascota) => void
}

export function Destacadas({ mascotas, alVerDetalle, alAdoptar }: Props) {
  return (
    <section aria-labelledby="titulo-destacadas" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <EncabezadoSeccion id="titulo-destacadas" antetitulo="Mascotas destacadas" titulo="Te están esperando">
        Conoce a algunos de los rescatados que buscan familia esta semana.
      </EncabezadoSeccion>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mascotas.map((m) => (
          <TarjetaMascota key={m.id} mascota={m} alVerDetalle={alVerDetalle} alAdoptar={alAdoptar} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <a href="#adoptar" className={boton.secundario}>
          Ver todas las mascotas <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
