import { PawPrint } from 'lucide-react'
import { useState } from 'react'
import { srcSetFoto, urlFoto } from '../../lib/fotos'
import type { Foto } from '../../types'

interface Props {
  foto: Foto
  /** Ancho por defecto (px) y anchos alternativos para pantallas de alta densidad */
  anchos?: number[]
  sizes?: string
  className?: string
  prioridad?: boolean
}

/** Foto con carga diferida y un respaldo ilustrado si la imagen no carga: nunca se ve una imagen rota. */
export function FotoMascota({ foto, anchos = [400, 700, 1000], sizes = '100vw', className = '', prioridad = false }: Props) {
  const [estado, setEstado] = useState<'cargando' | 'lista' | 'error'>('cargando')

  if (estado === 'error') {
    return (
      <div
        role="img"
        aria-label={foto.alt}
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-salvia-100 via-crema-100 to-durazno-100 text-salvia-600 ${className}`}
      >
        <PawPrint className="h-12 w-12" aria-hidden="true" />
        <span className="px-4 text-center text-sm font-semibold">{foto.alt}</span>
      </div>
    )
  }

  return (
    <img
      src={urlFoto(foto, anchos[1] ?? anchos[0])}
      srcSet={srcSetFoto(foto, anchos)}
      sizes={sizes}
      alt={foto.alt}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setEstado('lista')}
      onError={() => setEstado('error')}
      className={`bg-crema-200 object-cover transition-opacity duration-500 ${estado === 'lista' ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  )
}
