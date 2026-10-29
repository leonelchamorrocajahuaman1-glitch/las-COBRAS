import { Heart, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SECCIONES } from '../../config/secciones'
import { useSeccionActiva } from '../../hooks/useSeccionActiva'
import { boton } from '../../lib/estilos'
import { Logo } from '../ui/Logo'

const IDS = SECCIONES.map((s) => s.id)

export function BarraNavegacion() {
  const [abierto, setAbierto] = useState(false)
  const [conSombra, setConSombra] = useState(false)
  const activa = useSeccionActiva(IDS)

  useEffect(() => {
    const alDesplazar = () => setConSombra(window.scrollY > 8)
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  // Cierra el menú móvil con Escape o si la pantalla pasa a tamaño escritorio.
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    const escritorio = window.matchMedia('(min-width: 1024px)')
    const alCambiar = () => escritorio.matches && setAbierto(false)
    document.addEventListener('keydown', alTeclear)
    escritorio.addEventListener('change', alCambiar)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      escritorio.removeEventListener('change', alCambiar)
    }
  }, [abierto])

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition duration-300 ${conSombra || abierto ? 'bg-crema-50/95 shadow-suave backdrop-blur' : 'bg-transparent'}`}>
      <a href="#adoptar" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Saltar al catálogo de mascotas
      </a>
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Principal">
        <a href="#inicio" aria-label="Huellitas de Amor, ir al inicio" onClick={() => setAbierto(false)}>
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={activa === s.id ? 'location' : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-bold transition ${
                  activa === s.id ? 'bg-salvia-100 text-salvia-800' : 'text-tinta-suave hover:bg-salvia-50 hover:text-salvia-800'
                }`}
              >
                {s.texto}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* El contenedor oculta el botón en celulares (el botón en sí usa inline-flex) */}
          <span className="hidden sm:block">
            <a href="#adoptar" className={`${boton.primario} ${boton.pequeno}`}>
              <Heart className="h-4 w-4" aria-hidden="true" /> Adopta
            </a>
          </span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-tinta transition hover:bg-salvia-100 lg:hidden"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setAbierto((a) => !a)}
          >
            {abierto ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div id="menu-movil" hidden={!abierto} className="border-t border-crema-200 lg:hidden">
        <ul className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => setAbierto(false)}
                aria-current={activa === s.id ? 'location' : undefined}
                className={`block rounded-2xl px-4 py-3 text-base font-bold transition ${
                  activa === s.id ? 'bg-salvia-100 text-salvia-800' : 'text-tinta hover:bg-salvia-50'
                }`}
              >
                {s.texto}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
