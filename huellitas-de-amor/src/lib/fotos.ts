import type { Foto } from '../types'

const BASE = 'https://images.unsplash.com'

/** URL optimizada de Unsplash: recorte, formato moderno (WebP/AVIF) y ancho a medida. */
export function urlFoto(foto: Foto, ancho: number): string {
  return `${BASE}/${foto.unsplashId}?auto=format&fit=crop&w=${ancho}&q=75`
}

/** srcset para que el navegador descargue el tamaño justo según la pantalla. */
export function srcSetFoto(foto: Foto, anchos: number[]): string {
  return anchos.map((a) => `${urlFoto(foto, a)} ${a}w`).join(', ')
}
