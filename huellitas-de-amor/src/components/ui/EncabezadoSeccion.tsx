import type { ReactNode } from 'react'

interface Props {
  id: string
  antetitulo: string
  titulo: string
  children?: ReactNode
  centrado?: boolean
}

export function EncabezadoSeccion({ id, antetitulo, titulo, children, centrado = true }: Props) {
  return (
    <div className={`revelar mb-12 max-w-2xl ${centrado ? 'mx-auto text-center' : ''}`}>
      <p className="mb-3 text-sm font-bold tracking-widest text-durazno-600 uppercase">{antetitulo}</p>
      <h2 id={id} className="text-3xl font-black tracking-tight sm:text-4xl">{titulo}</h2>
      {children && <div className="mt-4 text-lg text-tinta-suave">{children}</div>}
    </div>
  )
}
