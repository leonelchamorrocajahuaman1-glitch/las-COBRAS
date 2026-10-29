import { describe, expect, it } from 'vitest'
import { telefonoValido, validarContacto, validarSolicitud, type SolicitudAdopcion } from './validacion'

const VALIDA: SolicitudAdopcion = {
  nombre: 'Ana Quispe',
  correo: 'ana@correo.pe',
  telefono: '987 654 321',
  ciudad: 'Lima',
  vivienda: 'Departamento',
  motivo: 'Trabajo desde casa y tengo tiempo para pasearlo dos veces al día.',
  acepta: true,
}

describe('solicitud de adopción', () => {
  it('acepta datos completos', () => {
    expect(validarSolicitud(VALIDA)).toEqual({})
  })
  it('marca cada campo con un mensaje claro', () => {
    const e = validarSolicitud({ nombre: 'Ana', correo: 'ana@', telefono: '123', ciudad: '', vivienda: '', motivo: 'corto', acepta: false })
    expect(Object.keys(e).sort()).toEqual(['acepta', 'ciudad', 'correo', 'motivo', 'nombre', 'telefono', 'vivienda'])
    expect(e.nombre).toMatch(/apellido/)
    expect(e.motivo).toMatch(/llevas 5/)
  })
  it('rechaza números en el nombre', () => {
    expect(validarSolicitud({ ...VALIDA, nombre: 'Ana 123' }).nombre).toBeDefined()
  })
})

describe('teléfono', () => {
  it.each(['987654321', '987 654 321', '+51 987 654 321', '+34 612 345 678'])('acepta %s', (t) => expect(telefonoValido(t)).toBe(true))
  it.each(['12345', '887654321', 'abcdefghi', '98765432'])('rechaza %s', (t) => expect(telefonoValido(t)).toBe(false))
})

describe('contacto', () => {
  it('valida asunto y longitud del mensaje', () => {
    const e = validarContacto({ nombre: 'Luis Pérez', correo: 'luis@mail.com', asunto: '', mensaje: 'Hola' })
    expect(Object.keys(e).sort()).toEqual(['asunto', 'mensaje'])
  })
})
