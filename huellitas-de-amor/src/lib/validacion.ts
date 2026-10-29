export type Errores<T> = Partial<Record<keyof T, string>>

export interface SolicitudAdopcion {
  nombre: string
  correo: string
  telefono: string
  ciudad: string
  vivienda: string
  motivo: string
  acepta: boolean
}

export interface MensajeContacto {
  nombre: string
  correo: string
  asunto: string
  mensaje: string
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validarNombre(nombre: string): string | undefined {
  const limpio = nombre.trim().replace(/\s+/g, ' ')
  if (!limpio) return 'Escribe tu nombre completo.'
  if (limpio.split(' ').length < 2 || limpio.length < 5) return 'Incluye al menos un nombre y un apellido.'
  if (/\d/.test(limpio)) return 'El nombre no debe contener números.'
  return undefined
}

function validarCorreo(correo: string): string | undefined {
  if (!correo.trim()) return 'Escribe tu correo electrónico.'
  if (!CORREO.test(correo.trim())) return 'Revisa el correo; debe tener el formato nombre@dominio.com.'
  return undefined
}

/** Acepta celulares peruanos (9 dígitos que empiezan con 9) o números internacionales con prefijo +. */
export function telefonoValido(telefono: string): boolean {
  const digitos = telefono.replace(/[\s()-]/g, '')
  return /^(\+?51)?9\d{8}$/.test(digitos) || /^\+\d{8,15}$/.test(digitos)
}

export function validarSolicitud(d: SolicitudAdopcion): Errores<SolicitudAdopcion> {
  const e: Errores<SolicitudAdopcion> = {}
  e.nombre = validarNombre(d.nombre)
  e.correo = validarCorreo(d.correo)
  if (!d.telefono.trim()) e.telefono = 'Escribe un teléfono de contacto.'
  else if (!telefonoValido(d.telefono)) e.telefono = 'Usa un celular de 9 dígitos (ej. 987 654 321) o un número con prefijo +.'
  if (d.ciudad.trim().length < 3) e.ciudad = 'Indica tu ciudad.'
  if (!d.vivienda) e.vivienda = 'Selecciona el tipo de vivienda.'
  if (d.motivo.trim().length < 30)
    e.motivo = `Cuéntanos un poco más (mínimo 30 caracteres; llevas ${d.motivo.trim().length}).`
  if (!d.acepta) e.acepta = 'Debes aceptar el compromiso de adopción responsable.'
  return limpiar(e)
}

export function validarContacto(d: MensajeContacto): Errores<MensajeContacto> {
  const e: Errores<MensajeContacto> = {}
  e.nombre = validarNombre(d.nombre)
  e.correo = validarCorreo(d.correo)
  if (!d.asunto) e.asunto = 'Selecciona un asunto.'
  if (d.mensaje.trim().length < 20) e.mensaje = 'El mensaje debe tener al menos 20 caracteres.'
  return limpiar(e)
}

function limpiar<T>(e: Errores<T>): Errores<T> {
  return Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as Errores<T>
}
