import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

function catalogo() {
  return within(document.getElementById('adoptar')!)
}

function tarjetasDelCatalogo() {
  return catalogo().getAllByRole('article').map((a) => within(a).getByRole('heading', { level: 3 }).textContent)
}

describe('Huellitas de Amor', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('muestra la portada, el menú y todas las secciones', () => {
    expect(screen.getByRole('heading', { level: 1, name: /Encuentra a tu nuevo mejor amigo/ })).toBeInTheDocument()
    const menu = screen.getByRole('navigation', { name: 'Principal' })
    for (const [texto, id] of [
      ['Inicio', 'inicio'],
      ['Adoptar', 'adoptar'],
      ['Cómo adoptar', 'como-adoptar'],
      ['Historias felices', 'historias'],
      ['Sobre nosotros', 'nosotros'],
      ['Contacto', 'contacto'],
    ]) {
      const enlace = within(menu).getAllByRole('link', { name: texto })[0]
      expect(enlace).toHaveAttribute('href', `#${id}`)
      expect(document.getElementById(id)).not.toBeNull()
    }
    expect(screen.getByText(/Cifras de ejemplo/)).toBeInTheDocument()
  })

  it('busca por nombre y filtra por especie', async () => {
    const user = userEvent.setup()
    await user.type(screen.getByRole('searchbox', { name: 'Buscar por nombre' }), 'lun')
    expect(tarjetasDelCatalogo()).toEqual(['Luna'])
    await user.clear(screen.getByRole('searchbox', { name: 'Buscar por nombre' }))
    await user.click(screen.getByRole('button', { name: '🐱 Gatos' }))
    expect(screen.getByRole('button', { name: '🐱 Gatos' })).toHaveAttribute('aria-pressed', 'true')
    expect(tarjetasDelCatalogo().sort()).toEqual(['Luna', 'Mostaza', 'Mía', 'Simba'])
  })

  it('muestra un estado vacío y permite limpiar los filtros', async () => {
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Tamaño'), 'grande')
    await user.selectOptions(screen.getByLabelText('Ubicación'), 'Cusco')
    expect(screen.getByText('Ningún peludito coincide con estos filtros')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('No hay mascotas')
    await user.click(screen.getByRole('button', { name: 'Ver todas las mascotas' }))
    expect(tarjetasDelCatalogo().length).toBeGreaterThanOrEqual(8)
  })

  it('distingue adoptados: el botón Adoptar está deshabilitado', () => {
    const max = catalogo().getAllByRole('article').find((a) => within(a).queryByRole('heading', { name: 'Max' }))!
    expect(within(max).getByText('Adoptado', { selector: 'span' })).toBeInTheDocument()
    expect(within(max).getByRole('button', { name: 'Max ya fue adoptado' })).toBeDisabled()
  })

  it('abre la ficha, pasa al formulario, valida y confirma en modo demostración', async () => {
    const user = userEvent.setup()
    const canela = catalogo().getAllByRole('article').find((a) => within(a).queryByRole('heading', { name: 'Canela' }))!
    await user.click(within(canela).getByRole('button', { name: 'Conocer más' }))

    const ficha = screen.getByRole('dialog', { name: 'Ficha de Canela' })
    expect(within(ficha).getByRole('heading', { name: /Su historia/ })).toBeInTheDocument()
    expect(within(ficha).getByText(/Vacunas: Completas/)).toBeInTheDocument()
    expect(within(ficha).getByRole('heading', { name: /Requisitos especiales/ })).toBeInTheDocument()
    await user.click(within(ficha).getByRole('button', { name: /Quiero adoptarlo/ }))

    const formulario = screen.getByRole('dialog', { name: 'Adoptar a Canela' })
    const nombre = within(formulario).getByLabelText(/Nombre completo/)
    await user.click(within(formulario).getByRole('button', { name: 'Enviar solicitud' }))
    expect(within(formulario).getByText('Escribe tu nombre completo.')).toBeInTheDocument()
    expect(within(formulario).getByText(/Debes aceptar el compromiso/)).toBeInTheDocument()
    expect(nombre).toHaveAttribute('aria-invalid', 'true')

    await user.type(nombre, 'Ana Quispe')
    await user.type(within(formulario).getByLabelText(/Correo/), 'ana@correo.pe')
    await user.type(within(formulario).getByLabelText(/Teléfono/), '987654321')
    await user.type(within(formulario).getByLabelText(/Ciudad/), 'Lima')
    await user.selectOptions(within(formulario).getByLabelText(/Tipo de vivienda/), 'Departamento')
    await user.type(within(formulario).getByLabelText(/Por qué quieres adoptar/), 'Trabajo desde casa y puedo pasearla todos los días.')
    await user.click(within(formulario).getByRole('checkbox'))
    expect(nombre).toHaveAttribute('aria-invalid', 'false')
    await user.click(within(formulario).getByRole('button', { name: 'Enviar solicitud' }))

    expect(await within(formulario).findByRole('heading', { name: '¡Solicitud recibida!' })).toBeInTheDocument()
    expect(within(formulario).getByText(/no se envió ni se guardó/)).toBeInTheDocument()
    await user.click(within(formulario).getByRole('button', { name: 'Seguir viendo mascotas' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cierra la ventana con Escape', async () => {
    const user = userEvent.setup()
    await user.click(catalogo().getAllByRole('button', { name: 'Conocer más' })[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('valida y confirma el formulario de contacto', async () => {
    const user = userEvent.setup()
    const contacto = within(document.getElementById('contacto')!)
    await user.click(contacto.getByRole('button', { name: 'Enviar mensaje' }))
    expect(contacto.getByText('Selecciona un asunto.')).toBeInTheDocument()
    await user.type(contacto.getByLabelText(/Nombre completo/), 'Luis Pérez')
    await user.type(contacto.getByLabelText(/Correo/), 'luis@mail.com')
    await user.selectOptions(contacto.getByLabelText(/Asunto/), 'Quiero ser voluntario/a')
    await user.type(contacto.getByLabelText(/Mensaje/), 'Me gustaría ayudar los fines de semana.')
    await user.click(contacto.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await contacto.findByRole('heading', { name: '¡Mensaje recibido!' })).toBeInTheDocument()
  })

  it('abre y cierra el menú móvil', async () => {
    const user = userEvent.setup()
    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    await user.click(boton)
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true')
    await user.click(within(document.getElementById('menu-movil')!).getByRole('link', { name: 'Contacto' }))
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })
})
