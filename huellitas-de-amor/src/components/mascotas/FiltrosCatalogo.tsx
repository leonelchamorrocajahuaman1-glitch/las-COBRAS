import { RotateCcw, Search } from 'lucide-react'
import { campo } from '../../lib/estilos'
import { ETIQUETA_ETAPA, TAMANOS, hayFiltrosActivos, type Filtros } from '../../lib/mascotas'
import type { Etapa, Sexo, Tamano } from '../../types'

interface Props {
  filtros: Filtros
  ubicaciones: string[]
  alCambiar: (f: Filtros) => void
  alLimpiar: () => void
}

const ESPECIES: { valor: Filtros['especie']; texto: string }[] = [
  { valor: '', texto: 'Todos' },
  { valor: 'perro', texto: '🐶 Perros' },
  { valor: 'gato', texto: '🐱 Gatos' },
  { valor: 'otros', texto: '🐰 Otros' },
]

const selector = `${campo} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%234a5a50' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10`

export function FiltrosCatalogo({ filtros, ubicaciones, alCambiar, alLimpiar }: Props) {
  const cambiar = <K extends keyof Filtros>(clave: K, valor: Filtros[K]) => alCambiar({ ...filtros, [clave]: valor })

  return (
    <form
      role="search"
      aria-label="Buscar y filtrar mascotas"
      onSubmit={(e) => e.preventDefault()}
      className="revelar rounded-3xl bg-white p-5 shadow-suave ring-1 ring-crema-200 sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-tinta-suave" aria-hidden="true" />
          <label htmlFor="busqueda" className="sr-only">Buscar por nombre</label>
          <input
            id="busqueda"
            type="search"
            value={filtros.busqueda}
            onChange={(e) => cambiar('busqueda', e.target.value)}
            placeholder="Buscar por nombre…"
            className={`${campo} pl-12`}
            autoComplete="off"
          />
        </div>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Especie</legend>
          {ESPECIES.map((e) => (
            <button
              key={e.texto}
              type="button"
              aria-pressed={filtros.especie === e.valor}
              onClick={() => cambiar('especie', e.valor)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtros.especie === e.valor
                  ? 'bg-salvia-600 text-white shadow-suave'
                  : 'bg-crema-100 text-tinta-suave hover:bg-salvia-100 hover:text-salvia-800'
              }`}
            >
              {e.texto}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-4">
        <div>
          <label htmlFor="f-edad" className="mb-1 block text-xs font-bold tracking-wide text-tinta-suave uppercase">Edad</label>
          <select id="f-edad" value={filtros.etapa} onChange={(e) => cambiar('etapa', e.target.value as Etapa | '')} className={selector}>
            <option value="">Cualquier edad</option>
            {(Object.keys(ETIQUETA_ETAPA) as Etapa[]).map((e) => (
              <option key={e} value={e}>{ETIQUETA_ETAPA[e]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-tamano" className="mb-1 block text-xs font-bold tracking-wide text-tinta-suave uppercase">Tamaño</label>
          <select id="f-tamano" value={filtros.tamano} onChange={(e) => cambiar('tamano', e.target.value as Tamano | '')} className={selector}>
            <option value="">Todos los tamaños</option>
            {TAMANOS.map((t) => (
              <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-sexo" className="mb-1 block text-xs font-bold tracking-wide text-tinta-suave uppercase">Sexo</label>
          <select id="f-sexo" value={filtros.sexo} onChange={(e) => cambiar('sexo', e.target.value as Sexo | '')} className={selector}>
            <option value="">Macho o hembra</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-ubicacion" className="mb-1 block text-xs font-bold tracking-wide text-tinta-suave uppercase">Ubicación</label>
          <select id="f-ubicacion" value={filtros.ubicacion} onChange={(e) => cambiar('ubicacion', e.target.value)} className={selector}>
            <option value="">Todas las ciudades</option>
            {ubicaciones.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-tinta-suave">
          <input
            type="checkbox"
            checked={filtros.soloDisponibles}
            onChange={(e) => cambiar('soloDisponibles', e.target.checked)}
            className="h-4 w-4 rounded accent-salvia-600"
          />
          Mostrar solo disponibles
        </label>
        {hayFiltrosActivos(filtros) && (
          <button type="button" onClick={alLimpiar} className="inline-flex items-center gap-1.5 text-sm font-bold text-durazno-600 hover:text-durazno-700">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Limpiar filtros
          </button>
        )}
      </div>
    </form>
  )
}
