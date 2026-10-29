import { useEffect, useMemo, useState } from 'react'
import { BarraNavegacion } from './components/layout/BarraNavegacion'
import { PiePagina } from './components/layout/PiePagina'
import { VentanaMascota, type VistaMascota } from './components/mascotas/VentanaMascota'
import { Beneficios } from './components/secciones/Beneficios'
import { Catalogo } from './components/secciones/Catalogo'
import { ComoAdoptar } from './components/secciones/ComoAdoptar'
import { Contacto } from './components/secciones/Contacto'
import { Destacadas } from './components/secciones/Destacadas'
import { Estadisticas } from './components/secciones/Estadisticas'
import { Historias } from './components/secciones/Historias'
import { Portada } from './components/secciones/Portada'
import { SobreNosotros } from './components/secciones/SobreNosotros'
import { Testimonios } from './components/secciones/Testimonios'
import { MASCOTAS } from './data/mascotas'
import { useRevelar } from './hooks/useRevelar'
import type { Mascota } from './types'

export default function App() {
  const [seleccion, setSeleccion] = useState<Mascota | null>(null)
  const [vista, setVista] = useState<VistaMascota>('detalle')
  const destacadas = useMemo(() => MASCOTAS.filter((m) => m.destacada && m.estado === 'disponible').slice(0, 4), [])
  const disponibles = MASCOTAS.filter((m) => m.estado === 'disponible').length
  useRevelar()

  // Si se abre un enlace con sección (p. ej. .../#adoptar), salta a ella cuando la página ya existe.
  // Se espera a las fuentes (máx. 1,5 s): al cambiar de fuente el texto cambia de alto y movería la sección.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const fuentes = document.fonts?.ready ?? Promise.resolve()
    const limite = new Promise((resolver) => setTimeout(resolver, 1500))
    Promise.race([fuentes, limite]).then(() =>
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })),
    )
  }, [])

  const abrir = (m: Mascota, v: VistaMascota) => {
    setSeleccion(m)
    setVista(v)
  }
  const verDetalle = (m: Mascota) => abrir(m, 'detalle')
  const adoptar = (m: Mascota) => abrir(m, 'formulario')

  return (
    <>
      <BarraNavegacion />
      <main>
        <Portada disponibles={disponibles} />
        <Destacadas mascotas={destacadas} alVerDetalle={verDetalle} alAdoptar={adoptar} />
        <Beneficios />
        <Estadisticas />
        <Testimonios />
        <Catalogo mascotas={MASCOTAS} alVerDetalle={verDetalle} alAdoptar={adoptar} />
        <ComoAdoptar />
        <Historias />
        <SobreNosotros />
        <Contacto />
      </main>
      <PiePagina />
      <VentanaMascota mascota={seleccion} vista={vista} alCambiarVista={setVista} alCerrar={() => setSeleccion(null)} />
    </>
  )
}
