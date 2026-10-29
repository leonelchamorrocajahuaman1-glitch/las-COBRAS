import type { Especie, Etapa, Mascota, Sexo, Tamano } from '../types'

export function etapaDeVida(m: Pick<Mascota, 'edadMeses'>): Etapa {
  if (m.edadMeses < 12) return 'cachorro'
  if (m.edadMeses < 36) return 'joven'
  if (m.edadMeses < 96) return 'adulto'
  return 'senior'
}

export function edadTexto(meses: number): string {
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const años = Math.floor(meses / 12)
  const resto = meses % 12
  const base = `${años} ${años === 1 ? 'año' : 'años'}`
  return resto >= 6 ? `${base} y medio` : base
}

export const ETIQUETA_ESPECIE: Record<Especie, string> = { perro: 'Perro', gato: 'Gato', conejo: 'Conejo' }
export const ETIQUETA_ETAPA: Record<Etapa, string> = {
  cachorro: 'Cachorro (menos de 1 año)',
  joven: 'Joven (1 a 3 años)',
  adulto: 'Adulto (3 a 8 años)',
  senior: 'Senior (8 años o más)',
}
export const ETIQUETA_SEXO: Record<Sexo, string> = { macho: 'Macho', hembra: 'Hembra' }
export const TAMANOS: Tamano[] = ['pequeño', 'mediano', 'grande']

export interface Filtros {
  busqueda: string
  especie: Especie | 'otros' | ''
  etapa: Etapa | ''
  tamano: Tamano | ''
  sexo: Sexo | ''
  ubicacion: string
  soloDisponibles: boolean
}

export const FILTROS_VACIOS: Filtros = {
  busqueda: '',
  especie: '',
  etapa: '',
  tamano: '',
  sexo: '',
  ubicacion: '',
  soloDisponibles: false,
}

/** Minúsculas y sin tildes: "tomas" encuentra a "Tomás". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function filtrarMascotas(mascotas: Mascota[], f: Filtros): Mascota[] {
  const busqueda = normalizar(f.busqueda)
  return mascotas.filter((m) => {
    if (busqueda && !normalizar(m.nombre).includes(busqueda)) return false
    if (f.especie === 'otros' ? m.especie === 'perro' || m.especie === 'gato' : f.especie && m.especie !== f.especie)
      return false
    if (f.etapa && etapaDeVida(m) !== f.etapa) return false
    if (f.tamano && m.tamano !== f.tamano) return false
    if (f.sexo && m.sexo !== f.sexo) return false
    if (f.ubicacion && m.ubicacion !== f.ubicacion) return false
    if (f.soloDisponibles && m.estado !== 'disponible') return false
    return true
  })
}

/** Disponibles primero; dentro de cada grupo, por nombre. */
export function ordenarMascotas(mascotas: Mascota[]): Mascota[] {
  return [...mascotas].sort(
    (a, b) => Number(a.estado !== 'disponible') - Number(b.estado !== 'disponible') || a.nombre.localeCompare(b.nombre, 'es'),
  )
}

export function hayFiltrosActivos(f: Filtros): boolean {
  return Object.entries(f).some(([clave, valor]) => valor !== FILTROS_VACIOS[clave as keyof Filtros])
}

export function ubicaciones(mascotas: Mascota[]): string[] {
  return [...new Set(mascotas.map((m) => m.ubicacion))].sort((a, b) => a.localeCompare(b, 'es'))
}
