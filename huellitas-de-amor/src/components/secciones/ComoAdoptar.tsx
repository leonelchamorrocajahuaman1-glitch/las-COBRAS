import { BookHeart, ClipboardCheck, PhoneCall, Search } from 'lucide-react'
import { EncabezadoSeccion } from '../ui/EncabezadoSeccion'

const PASOS = [
  {
    icono: Search,
    titulo: 'Encuentra una mascota que se adapte a tu hogar',
    texto: 'Usa los filtros del catálogo para buscar por especie, edad, tamaño y ciudad. Piensa en tu espacio, tu horario y tu nivel de actividad.',
  },
  {
    icono: BookHeart,
    titulo: 'Conoce su historia y características',
    texto: 'En su ficha verás cómo fue rescatada, su personalidad, su estado de salud y si necesita algún cuidado especial.',
  },
  {
    icono: ClipboardCheck,
    titulo: 'Completa el formulario de solicitud',
    texto: 'Cuéntanos sobre ti, tu hogar y por qué quieres adoptar. Toma unos 5 minutos y no tiene ningún costo.',
  },
  {
    icono: PhoneCall,
    titulo: 'Espera el contacto y la evaluación',
    texto: 'Te llamaremos para una entrevista, coordinaremos una visita y, si todo va bien, firmaremos el compromiso de adopción.',
  },
]

const RESPONSABLE = [
  'Adoptar es un compromiso de 10 a 15 años o más: piensa en mudanzas, viajes y cambios de rutina.',
  'Calcula los gastos mensuales de alimento, veterinario, vacunas y antiparasitarios.',
  'Esteriliza a tu mascota: evita camadas no deseadas y previene enfermedades.',
  'Protege ventanas y balcones, y usa siempre placa de identificación.',
  'Dale tiempo de adaptación: algunos rescatados necesitan semanas para sentirse seguros.',
]

export function ComoAdoptar() {
  return (
    <section id="como-adoptar" aria-labelledby="titulo-como" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EncabezadoSeccion id="titulo-como" antetitulo="Cómo adoptar" titulo="Un proceso sencillo, pensado en su bienestar">
          Queremos que cada adopción sea para siempre. Por eso te acompañamos en cada paso.
        </EncabezadoSeccion>

        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className="revelar relative rounded-3xl bg-white p-6 pt-8 shadow-suave ring-1 ring-crema-200" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-durazno-600 font-display text-lg font-black text-white shadow-suave" aria-hidden="true">
                {i + 1}
              </span>
              <Icono className="h-9 w-9 text-salvia-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg leading-snug font-extrabold">
                <span className="sr-only">Paso {i + 1}: </span>
                {titulo}
              </h3>
              <p className="mt-2 text-tinta-suave">{texto}</p>
            </li>
          ))}
        </ol>

        <div className="revelar mt-14 grid gap-8 rounded-[2rem] bg-salvia-50 p-7 ring-1 ring-salvia-100 sm:p-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-black">Adopción responsable y bienestar animal</h3>
            <p className="mt-3 text-tinta-suave">
              Un animal sano y feliz necesita alimento de calidad, atención veterinaria, ejercicio, compañía y un entorno seguro.
              Antes de postular, revisa estos puntos con tu familia.
            </p>
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-tinta-suave ring-1 ring-salvia-100">
              <strong className="text-tinta">Requisitos generales:</strong> ser mayor de edad, presentar tu documento de identidad, contar con el
              acuerdo de todas las personas del hogar y aceptar visitas de seguimiento.
            </p>
          </div>
          <ul className="space-y-3 lg:col-span-3">
            {RESPONSABLE.map((r) => (
              <li key={r} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-salvia-100">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-salvia-600 text-xs font-black text-white" aria-hidden="true">
                  ✓
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
