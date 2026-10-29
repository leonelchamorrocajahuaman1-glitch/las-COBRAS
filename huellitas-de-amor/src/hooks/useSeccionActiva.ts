import { useEffect, useState } from 'react'

/** Devuelve el id de la sección visible para resaltarla en el menú. */
export function useSeccionActiva(ids: string[]): string {
  const [activa, setActiva] = useState(ids[0])
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const visibles = new Map<string, number>()
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) visibles.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        const [id, ratio] = [...visibles.entries()].sort((a, b) => b[1] - a[1])[0] ?? []
        if (id && ratio > 0) setActiva(id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observador.observe(el)
    })
    return () => observador.disconnect()
  }, [ids])
  return activa
}
