import type { MensajeContacto, SolicitudAdopcion } from '../lib/validacion'

/**
 * Capa de comunicación con el servidor.
 *
 * Hoy el sitio NO tiene backend: si no se define la variable de entorno `VITE_API_URL`,
 * funciona en "modo demostración" y los formularios no se envían ni se guardan en ningún lado.
 *
 * Para conectarlo a un backend real:
 *   1. Crea un archivo `.env` con `VITE_API_URL=https://tu-api.com`
 *   2. Implementa en ese servidor:
 *        POST /solicitudes  -> cuerpo: SolicitudConMascota, respuesta: { id: string }
 *        POST /contacto     -> cuerpo: MensajeContacto,     respuesta: { id: string }
 *   3. Vuelve a compilar (`npm run build`).
 */
const API_URL: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const MODO_DEMO = !API_URL

export interface SolicitudConMascota extends Omit<SolicitudAdopcion, 'acepta'> {
  mascotaId: string
  mascotaNombre: string
}

export interface ResultadoEnvio {
  /** 'demo': validado en el navegador, sin enviarse a ningún servidor. 'servidor': confirmado por la API. */
  modo: 'demo' | 'servidor'
  referencia: string
}

export class ErrorEnvio extends Error {}

function referenciaLocal(prefijo: string): string {
  const azar = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 5).padStart(5, '0')
  return `${prefijo}-${azar}`
}

async function publicar(ruta: string, cuerpo: unknown, prefijo: string): Promise<ResultadoEnvio> {
  if (MODO_DEMO) {
    // Pequeña pausa para que el usuario vea el estado "Enviando…" igual que con un servidor real.
    await new Promise((resolver) => setTimeout(resolver, 500))
    return { modo: 'demo', referencia: referenciaLocal(prefijo) }
  }
  let respuesta: Response
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorEnvio('No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.')
  }
  if (!respuesta.ok) throw new ErrorEnvio('El servidor no pudo recibir tu mensaje. Inténtalo de nuevo en unos minutos.')
  const datos = (await respuesta.json().catch(() => ({}))) as { id?: string }
  return { modo: 'servidor', referencia: datos.id ?? referenciaLocal(prefijo) }
}

export function enviarSolicitud(solicitud: SolicitudConMascota): Promise<ResultadoEnvio> {
  return publicar('/solicitudes', solicitud, 'HA')
}

export function enviarContacto(mensaje: MensajeContacto): Promise<ResultadoEnvio> {
  return publicar('/contacto', mensaje, 'CT')
}
