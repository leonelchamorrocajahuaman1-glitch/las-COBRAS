import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useRevelar } from '../../hooks/useRevelar'
import { boton } from '../../lib/estilos'
import { FILTROS_VACIOS, filtrarMascotas, ordenarMascotas, ubicaciones, type Filtros } from '../../lib/mascotas'
import type { Mascota } from '../../types'
import { FiltrosCatalogo } from '../mascotas/FiltrosCatalogo'
import { TarjetaMascota } from '../mascotas/TarjetaMascota'
import { EncabezadoSeccion } from '../ui/EncabezadoSeccion'

interface Props {
  mascotas: Mascota[]
  alVerDetalle: (m: Mascota) => void
  alAdoptar: (m: Mascota) => void
}

export function Catalogo({ mascotas, alVerDetalle, alAdoptar }: Props) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS)
  const ciudades = useMemo(() => ubicaciones(mascotas), [mascotas])
  const resultado = useMemo(() => ordenarMascotas(filtrarMascotas(mascotas, filtros)), [mascotas, filtros])
  const disponibles = resultado.filter((m) => m.estado === 'disponible').length
  useRevelar(resultado)

  return (
    <section id="adoptar" aria-labelledby="titulo-adoptar" className="bg-crema-100/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion id="titulo-adoptar" antetitulo="Adoptar" titulo="Encuentra a tu compañero ideal">
          Todos nuestros animales son rescatados, reciben atención veterinaria y esperan una familia responsable.
        </EncabezadoSeccion>

        <FiltrosCatalogo filtros={filtros} ubicaciones={ciudades} alCambiar={setFiltros} alLimpiar={() => setFiltros(FILTROS_VACIOS)} />

        <p className="mt-6 mb-5 font-semibold text-tinta-suave" role="status" aria-live="polite">
          {resultado.length === 0
            ? 'No hay mascotas que coincidan con tu búsqueda.'
            : `${resultado.length} ${resultado.length === 1 ? 'mascota encontrada' : 'mascotas encontradas'} · ${disponibles} ${disponibles === 1 ? 'disponible' : 'disponibles'}`}
        </p>

        {resultado.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resultado.map((m) => (
              <TarjetaMascota key={m.id} mascota={m} alVerDetalle={alVerDetalle} alAdoptar={alAdoptar} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-suave ring-1 ring-crema-200">
            <SearchX className="mx-auto h-14 w-14 text-salvia-400" aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-extrabold">Ningún peludito coincide con estos filtros</h3>
            <p className="mx-auto mt-2 max-w-md text-tinta-suave">
              Prueba con otra edad, tamaño o ciudad. Cada semana llegan nuevos rescatados que podrían ser perfectos para ti.
            </p>
            <button type="button" onClick={() => setFiltros(FILTROS_VACIOS)} className={`${boton.secundario} mt-6`}>
              Ver todas las mascotas
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
