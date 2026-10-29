import { X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  abierto: boolean
  alCerrar: () => void
  titulo: string
  /** Oculta el título visualmente (sigue disponible para lectores de pantalla) */
  ocultarTitulo?: boolean
  ancho?: string
  /** Cambia cuando el contenido cambia (p. ej. de ficha a formulario) para mover el foco y volver arriba */
  claveContenido?: string
  children: ReactNode
}

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Ventana modal accesible: se cierra con Escape o al pulsar fuera, mantiene el foco dentro
 * mientras está abierta, bloquea el scroll del fondo y devuelve el foco al botón que la abrió.
 */
export function Modal({ abierto, alCerrar, titulo, ocultarTitulo = false, ancho = 'max-w-3xl', claveContenido, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const alCerrarRef = useRef(alCerrar)
  useLayoutEffect(() => {
    alCerrarRef.current = alCerrar
  })

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        alCerrarRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const enfocables = [...panel.current.querySelectorAll<HTMLElement>(ENFOCABLES)].filter((el) => el.offsetParent !== null)
      if (!enfocables.length) return
      const [inicio, fin] = [enfocables[0], enfocables[enfocables.length - 1]]
      if (e.shiftKey && document.activeElement === inicio) {
        e.preventDefault()
        fin.focus()
      } else if (!e.shiftKey && document.activeElement === fin) {
        e.preventDefault()
        inicio.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = overflow
      previo?.focus?.()
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto || !panel.current) return
    panel.current.scrollTop = 0
    const destino = panel.current.querySelector<HTMLElement>('[data-autofoco]') ?? panel.current
    destino.focus({ preventScroll: true })
  }, [abierto, claveContenido])

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-aparecer bg-salvia-900/60 backdrop-blur-sm" onClick={alCerrar} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full ${ancho} animate-subir overflow-y-auto rounded-t-3xl bg-crema-50 shadow-elevada focus:outline-none sm:rounded-3xl`}
      >
        {ocultarTitulo && <h2 className="sr-only">{titulo}</h2>}
        <div
          className={
            ocultarTitulo
              ? 'sticky top-0 z-20 h-0'
              : 'sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-crema-200 bg-crema-50/95 px-5 py-3 backdrop-blur sm:px-7'
          }
        >
          {!ocultarTitulo && <h2 className="text-xl font-extrabold">{titulo}</h2>}
          <button
            type="button"
            onClick={alCerrar}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-tinta shadow-suave transition hover:bg-white hover:text-durazno-600 ${ocultarTitulo ? 'absolute top-3 right-3' : ''}`}
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
