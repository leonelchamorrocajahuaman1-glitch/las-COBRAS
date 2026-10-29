const CIFRAS = [
  { valor: '1 248', texto: 'adopciones concretadas' },
  { valor: '320', texto: 'rescates este año' },
  { valor: '85', texto: 'hogares temporales' },
  { valor: '96 %', texto: 'adopciones exitosas al año' },
]

export function Estadisticas() {
  return (
    <section aria-labelledby="titulo-cifras" className="bg-salvia-700 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="revelar flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <h2 id="titulo-cifras" className="text-2xl font-black text-white sm:text-3xl">Nuestro impacto</h2>
          <p className="rounded-full bg-white/15 px-4 py-1 text-sm font-semibold">Cifras de ejemplo para la demostración del sitio</p>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {CIFRAS.map((c) => (
            <div key={c.texto} className="revelar flex flex-col-reverse text-center">
              <dt className="mt-1 font-semibold text-salvia-100">{c.texto}</dt>
              <dd className="font-display text-4xl font-black text-durazno-200 sm:text-5xl">{c.valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
