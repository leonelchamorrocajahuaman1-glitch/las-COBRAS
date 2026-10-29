import { useEffect } from 'react'

/**
 * Hace aparecer suavemente los elementos con la clase `revelar` cuando entran en pantalla.
 * Se vuelve a ejecutar cuando cambia `dependencia` (p. ej. al filtrar el catálogo).
 */
export function useRevelar(dependencia?: unknown) {
  useEffect(() => {
    const elementos = document.querySelectorAll<HTMLElement>('.revelar:not(.visible)')
    if (!('IntersectionObserver' in window)) {
      elementos.forEach((el) => el.classList.add('visible'))
      return
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visible')
            observador.unobserve(entrada.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    elementos.forEach((el) => observador.observe(el))
    return () => observador.disconnect()
  }, [dependencia])
}
