import { HeartHandshake, Home, Stethoscope, Users } from 'lucide-react'
import { FotoMascota } from '../ui/FotoMascota'

const FOTO = { unsplashId: 'photo-1548199973-03cce0bbc87b', alt: 'Perros rescatados jugando al aire libre' }

const VALORES = [
  { icono: Stethoscope, titulo: 'Rescate y rehabilitación', texto: 'Atención veterinaria, vacunas y esterilización para cada animal.' },
  { icono: Home, titulo: 'Hogares temporales', texto: 'Familias voluntarias que cuidan a los rescatados mientras encuentran hogar.' },
  { icono: Users, titulo: 'Educación', texto: 'Charlas en colegios y barrios sobre tenencia responsable.' },
  { icono: HeartHandshake, titulo: 'Seguimiento', texto: 'Acompañamos a cada familia después de la adopción.' },
]

export function SobreNosotros() {
  return (
    <section id="nosotros" aria-labelledby="titulo-nosotros" className="py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="revelar relative">
          <div className="overflow-hidden rounded-[2.5rem] shadow-elevada">
            <FotoMascota foto={FOTO} anchos={[600, 900, 1200]} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] w-full" />
          </div>
          <div className="absolute -right-3 -bottom-6 max-w-[15rem] rounded-3xl bg-durazno-600 p-5 text-white shadow-elevada sm:-right-6">
            <p className="font-display text-xl font-black">Nadie se queda atrás</p>
            <p className="mt-1 text-sm text-white/90">También buscamos hogar para animales mayores y con necesidades especiales.</p>
          </div>
        </div>
        <div className="revelar">
          <p className="mb-3 text-sm font-bold tracking-widest text-durazno-600 uppercase">Sobre nosotros</p>
          <h2 id="titulo-nosotros" className="text-3xl font-black tracking-tight sm:text-4xl">
            Una red de personas que creen en las segundas oportunidades
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-tinta-suave">
            Huellitas de Amor nació de un grupo de vecinos que rescataban animales en sus barrios. Nuestra misión es rescatar, rehabilitar y
            encontrar hogares responsables para perros, gatos y otros animales abandonados, y promover una cultura de respeto y cuidado hacia
            ellos.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {VALORES.map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-salvia-100 text-salvia-700">
                  <Icono className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-extrabold">{titulo}</span>
                  <span className="block text-sm text-tinta-suave">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
