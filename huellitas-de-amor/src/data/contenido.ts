import type { Historia, Testimonio } from '../types'

/** Historias y testimonios de ejemplo para mostrar el diseño; reemplázalos por casos reales. */
export const HISTORIAS: Historia[] = [
  {
    id: 'max',
    mascota: 'Max',
    familia: 'Familia Huamán',
    ciudad: 'Cusco',
    fecha: 'Marzo 2026',
    texto:
      'Max llegó a nuestra vida en una feria de adopción. Al principio dormía junto a la puerta, como si temiera que lo dejáramos. Hoy duerme entre los niños y nos acompaña a todas partes.',
    foto: { unsplashId: 'photo-1561037404-61cd46aa615b', alt: 'Max en su nuevo hogar' },
  },
  {
    id: 'simba',
    mascota: 'Simba',
    familia: 'Lucía y Diego',
    ciudad: 'Lima',
    fecha: 'Junio 2026',
    texto:
      'Buscábamos un gato tranquilo para nuestro departamento y el equipo nos recomendó a Simba. Fue amor a primera vista: se adueñó del sofá el primer día.',
    foto: { unsplashId: 'photo-1495360010541-f48722b34f7d', alt: 'Simba en su nuevo hogar' },
  },
  {
    id: 'kira',
    mascota: 'Kira',
    familia: 'Don Alberto',
    ciudad: 'Arequipa',
    fecha: 'Agosto 2026',
    texto:
      'Después de jubilarme, la casa se sentía vacía. Kira, una perrita adulta, me devolvió la rutina de caminar cada mañana. Ahora somos inseparables.',
    foto: { unsplashId: 'photo-1525253086316-d0c936c814f8', alt: 'Kira en su nuevo hogar' },
  },
]

export const TESTIMONIOS: Testimonio[] = [
  {
    nombre: 'Andrea R.',
    ciudad: 'Lima',
    adopto: 'Adoptó a Tito',
    texto: 'El proceso fue claro y muy humano. Me ayudaron a elegir un perro que encajara con mi horario de trabajo.',
  },
  {
    nombre: 'Jorge y Paola',
    ciudad: 'Trujillo',
    adopto: 'Adoptaron a Nube',
    texto: 'Nos hicieron una visita después de la adopción para ver cómo estaba Nube. Se nota que de verdad les importa.',
  },
  {
    nombre: 'Carmen L.',
    ciudad: 'Arequipa',
    adopto: 'Adoptó a Michi',
    texto: 'Nunca había tenido un gato y me resolvieron todas las dudas. Michi es la alegría de la casa.',
  },
]
