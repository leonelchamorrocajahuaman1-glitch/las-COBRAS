import { CheckCircle2, Heart } from 'lucide-react'
import type { ReactNode } from 'react'
import type { EstadoAdopcion } from '../../types'

export function EtiquetaEstado({ estado, className = '' }: { estado: EstadoAdopcion; className?: string }) {
  return estado === 'disponible' ? (
    <span className={`inline-flex items-center gap-1 rounded-full bg-salvia-600 px-3 py-1 text-xs font-bold text-white shadow-suave ${className}`}>
      <Heart className="h-3.5 w-3.5" aria-hidden="true" /> Disponible
    </span>
  ) : (
    <span className={`inline-flex items-center gap-1 rounded-full bg-durazno-100 px-3 py-1 text-xs font-bold text-durazno-700 shadow-suave ${className}`}>
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Adoptado
    </span>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-crema-100 px-2.5 py-1 text-xs font-semibold text-tinta-suave">
      {children}
    </span>
  )
}
