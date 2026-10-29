import { HandHeart, HeartPulse, PiggyBank, Smile } from 'lucide-react'
import { EncabezadoSeccion } from '../ui/EncabezadoSeccion'

const BENEFICIOS = [
  {
    icono: HandHeart,
    titulo: 'Salvas una vida',
    texto: 'Cada adopción libera un espacio en el refugio para rescatar a otro animal de la calle.',
  },
  {
    icono: HeartPulse,
    titulo: 'Llega sano y cuidado',
    texto: 'Entregamos a cada mascota con chequeo veterinario, vacunas al día y esterilización según su edad.',
  },
  {
    icono: PiggyBank,
    titulo: 'Sin costo de compra',
    texto: 'La adopción es gratuita. Tu inversión es su alimento, sus cuidados y mucho tiempo juntos.',
  },
  {
    icono: Smile,
    titulo: 'Bienestar para ti',
    texto: 'Convivir con una mascota reduce el estrés, invita a moverse más y llena la casa de alegría.',
  },
]

export function Beneficios() {
  return (
    <section aria-labelledby="titulo-beneficios" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion id="titulo-beneficios" antetitulo="¿Por qué adoptar?" titulo="Adoptar cambia dos vidas: la suya y la tuya" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li
              key={titulo}
              className="revelar rounded-3xl bg-crema-50 p-6 ring-1 ring-crema-200 transition duration-300 hover:-translate-y-1 hover:shadow-suave"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-salvia-100 text-salvia-700">
                <Icono className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-extrabold">{titulo}</h3>
              <p className="mt-2 text-tinta-suave">{texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
