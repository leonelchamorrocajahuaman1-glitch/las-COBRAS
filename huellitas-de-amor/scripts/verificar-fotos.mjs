// Comprueba que todas las fotos de Unsplash usadas en el sitio existan y sean imágenes.
// Se ejecuta en GitHub Actions antes de publicar: si una foto se rompe, la publicación falla.
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

async function archivos(dir) {
  const entradas = await readdir(dir, { withFileTypes: true })
  const lista = await Promise.all(
    entradas.map((e) => (e.isDirectory() ? archivos(join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [join(dir, e.name)] : [])),
  )
  return lista.flat()
}

const ids = new Set()
for (const archivo of await archivos('src')) {
  for (const [id] of (await readFile(archivo, 'utf8')).matchAll(/photo-\d+-[0-9a-f]+/g)) ids.add(id)
}

async function revisar(id, intentos = 3) {
  const url = `https://images.unsplash.com/${id}?w=64&q=10`
  for (let i = 1; i <= intentos; i++) {
    try {
      const r = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15000) })
      const tipo = r.headers.get('content-type') ?? ''
      if (r.ok && tipo.startsWith('image/')) return { id, ok: true }
      if (r.status === 404) return { id, ok: false, motivo: 'no existe (404)' }
      if (i === intentos) return { id, ok: false, motivo: `HTTP ${r.status} ${tipo}` }
    } catch (e) {
      if (i === intentos) return { id, ok: false, motivo: e.message }
    }
    await new Promise((r) => setTimeout(r, 1000 * i))
  }
}

const resultados = await Promise.all([...ids].map((id) => revisar(id)))
for (const r of resultados) console.log(`${r.ok ? '✅' : '❌'} ${r.id}${r.ok ? '' : ` — ${r.motivo}`}`)
const fallidas = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallidas.length}/${resultados.length} fotos disponibles`)
if (fallidas.length) process.exit(1)
