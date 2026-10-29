import { ArrowRight, Heart, ShieldCheck, Stethoscope } from 'lucide-react'
import { boton } from '../../lib/estilos'
import { FotoMascota } from '../ui/FotoMascota'

const PERRO = { unsplashId: 'photo-1534361960057-19889db9621e', alt: 'Perro rescatado mirando a la cámara' }
const GATO = { unsplashId: 'photo-1518791841217-8f162f1e1131', alt: 'Gato rescatado mirando a la cámara' }

export function Portada({ disponibles }: { disponibles: number }) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-salvia-50 via-crema-50 to-crema-50 pt-28 pb-20 sm:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-durazno-100 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-salvia-100 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="animate-subir">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-salvia-700 shadow-suave">
            <Heart className="h-4 w-4 fill-durazno-400 text-durazno-400" aria-hidden="true" />
            {disponibles} peluditos esperan un hogar
          </p>
          <h1 className="mt-6 text-4xl leading-[1.05] font-black tracking-tight sm:text-5xl lg:text-6xl">
            Encuentra a tu nuevo <span className="text-salvia-600">mejor amigo</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta-suave sm:text-xl">
            Adoptar es salvar dos vidas: la del animal que llega a tu casa y la del que ocupa su lugar en el refugio.
            Dale una segunda oportunidad a quien solo sabe dar amor.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#adoptar" className={`${boton.primario} px-8 py-4 text-lg`}>
              Encuentra a tu mascota <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="#como-adoptar" className={`${boton.contorno} px-8 py-3.5 text-lg`}>
              Cómo adoptar
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-tinta-suave">
            <li className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-salvia-600" aria-hidden="true" /> Vacunados y desparasitados
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-salvia-600" aria-hidden="true" /> Adopción gratuita y responsable
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 overflow-hidden rounded-[2.5rem] shadow-elevada ring-8 ring-white">
              <FotoMascota foto={PERRO} anchos={[500, 800, 1100]} sizes="(min-width: 1024px) 30vw, 60vw" className="aspect-[3/4] h-full w-full" prioridad />
            </div>
            <div className="col-span-2 flex flex-col gap-4 pt-16">
              <div className="overflow-hidden rounded-[2rem] shadow-elevada ring-8 ring-white">
                <FotoMascota foto={GATO} anchos={[400, 600, 800]} sizes="(min-width: 1024px) 20vw, 40vw" className="aspect-square h-full w-full" prioridad />
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-suave">
                <p className="font-display text-3xl font-black text-durazno-600">+1 200</p>
                <p className="text-sm font-semibold text-tinta-suave">familias felices <span className="block text-xs font-normal">(cifra de ejemplo)</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
