import { describe, expect, it } from 'vitest'
import { MASCOTAS } from '../data/mascotas'
import { FILTROS_VACIOS, edadTexto, etapaDeVida, filtrarMascotas, hayFiltrosActivos, ordenarMascotas, ubicaciones } from './mascotas'

const nombres = (f: Partial<typeof FILTROS_VACIOS>) => filtrarMascotas(MASCOTAS, { ...FILTROS_VACIOS, ...f }).map((m) => m.nombre)

describe('datos del catálogo', () => {
  it('tiene al menos 8 mascotas con ids únicos y fotos', () => {
    expect(MASCOTAS.length).toBeGreaterThanOrEqual(8)
    expect(new Set(MASCOTAS.map((m) => m.id)).size).toBe(MASCOTAS.length)
    for (const m of MASCOTAS) expect(m.foto.unsplashId).toMatch(/^photo-\d+-[0-9a-f]+$/)
  })
  it('incluye disponibles y adoptados, perros y gatos', () => {
    expect(MASCOTAS.some((m) => m.estado === 'adoptado')).toBe(true)
    expect(MASCOTAS.some((m) => m.especie === 'perro')).toBe(true)
    expect(MASCOTAS.some((m) => m.especie === 'gato')).toBe(true)
  })
})

describe('edad', () => {
  it('se muestra en meses o años', () => {
    expect(edadTexto(1)).toBe('1 mes')
    expect(edadTexto(4)).toBe('4 meses')
    expect(edadTexto(12)).toBe('1 año')
    expect(edadTexto(30)).toBe('2 años y medio')
    expect(edadTexto(96)).toBe('8 años')
  })
  it('clasifica la etapa de vida', () => {
    expect(etapaDeVida({ edadMeses: 4 })).toBe('cachorro')
    expect(etapaDeVida({ edadMeses: 18 })).toBe('joven')
    expect(etapaDeVida({ edadMeses: 60 })).toBe('adulto')
    expect(etapaDeVida({ edadMeses: 96 })).toBe('senior')
  })
})

describe('filtros', () => {
  it('busca por nombre sin importar mayúsculas ni tildes', () => {
    expect(nombres({ busqueda: 'TOMAS' })).toEqual(['Tomás'])
    expect(nombres({ busqueda: 'mia' })).toEqual(['Mía'])
    expect(nombres({ busqueda: 'zzz' })).toEqual([])
  })
  it('filtra por especie, incluida la opción "otros"', () => {
    expect(filtrarMascotas(MASCOTAS, { ...FILTROS_VACIOS, especie: 'gato' }).every((m) => m.especie === 'gato')).toBe(true)
    expect(nombres({ especie: 'otros' })).toEqual(['Copito'])
  })
  it('combina edad, tamaño, sexo y ubicación', () => {
    expect(nombres({ etapa: 'cachorro' }).sort()).toEqual(['Nala', 'Rocky'])
    expect(nombres({ tamano: 'grande' }).sort()).toEqual(['Bruno', 'Rocky'])
    expect(nombres({ especie: 'perro', sexo: 'hembra', ubicacion: 'Arequipa' })).toEqual(['Nala'])
  })
  it('oculta adoptados si se pide', () => {
    expect(nombres({ soloDisponibles: true })).not.toContain('Max')
    expect(nombres({})).toContain('Max')
  })
  it('ordena disponibles primero y detecta filtros activos', () => {
    const orden = ordenarMascotas(MASCOTAS)
    const primerAdoptado = orden.findIndex((m) => m.estado === 'adoptado')
    expect(orden.slice(primerAdoptado).every((m) => m.estado === 'adoptado')).toBe(true)
    expect(hayFiltrosActivos(FILTROS_VACIOS)).toBe(false)
    expect(hayFiltrosActivos({ ...FILTROS_VACIOS, sexo: 'macho' })).toBe(true)
    expect(ubicaciones(MASCOTAS)).toEqual(['Arequipa', 'Cusco', 'Lima', 'Trujillo'])
  })
})
