/** Clases de botón compartidas para mantener un estilo coherente en todo el sitio. */
const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]'

export const boton = {
  primario: `${base} bg-durazno-600 px-6 py-3 text-white shadow-suave hover:bg-durazno-700 hover:shadow-elevada`,
  secundario: `${base} bg-salvia-600 px-6 py-3 text-white shadow-suave hover:bg-salvia-700`,
  contorno: `${base} border-2 border-salvia-600 px-6 py-2.5 text-salvia-700 hover:bg-salvia-50`,
  suave: `${base} bg-salvia-100 px-4 py-2 text-salvia-800 hover:bg-salvia-200`,
  pequeno: 'px-4 py-2 text-sm',
}

export const campo =
  'w-full rounded-xl border border-crema-300 bg-white px-4 py-2.5 text-tinta placeholder:text-tinta-suave/60 transition focus:border-salvia-500 focus:outline-none focus:ring-4 focus:ring-salvia-200 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-100'
