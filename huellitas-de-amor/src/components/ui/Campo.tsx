import { cloneElement, isValidElement, useId, type ReactElement } from 'react'

interface Props {
  etiqueta: string
  error?: string
  ayuda?: string
  obligatorio?: boolean
  className?: string
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string; required?: boolean }>
}

/** Envuelve un input: etiqueta asociada, texto de ayuda y mensaje de error accesible. */
export function Campo({ etiqueta, error, ayuda, obligatorio, className = '', children }: Props) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`
  const descritoPor = [ayuda && idAyuda, error && idError].filter(Boolean).join(' ') || undefined
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-invalid': Boolean(error), 'aria-describedby': descritoPor, required: obligatorio })
    : children

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-tinta">
        {etiqueta}
        {obligatorio && <span className="text-durazno-600" aria-hidden="true"> *</span>}
      </label>
      {control}
      {ayuda && !error && (
        <p id={idAyuda} className="mt-1 text-xs text-tinta-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
