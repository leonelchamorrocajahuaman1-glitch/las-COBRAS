# 🐾 Huellitas de Amor

Plataforma web de **adopción responsable de mascotas**: las personas pueden conocer a los animales rescatados, ver sus fotos y características, filtrarlos y solicitar su adopción.

**Tecnología:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Lucide React · Vitest.

## Funcionalidades

- **Portada** con fotos, frase sobre adopción responsable y botón "Encuentra a tu mascota".
- **Catálogo** de 11 mascotas (perros, gatos y un conejo) con foto, edad, especie, sexo, tamaño, ubicación, descripción y estado (disponible o adoptado).
  - Búsqueda por nombre (sin importar tildes ni mayúsculas).
  - Filtros por especie, edad (cachorro, joven, adulto, senior), tamaño, sexo y ubicación, más "solo disponibles".
  - Estado vacío con botón para limpiar filtros.
- **Ficha de cada mascota** en ventana modal: foto grande, historia de rescate, personalidad, vacunas, esterilización, requisitos especiales y ubicación.
- **Formulario de adopción** (nombre, correo, teléfono, ciudad, vivienda, motivo y compromiso) con validación en vivo y mensajes claros.
- Secciones **Cómo adoptar** (4 pasos + adopción responsable), **Historias felices**, **Sobre nosotros** y **Contacto** (con formulario).
- Mascotas destacadas, beneficios de adoptar, cifras y testimonios (identificados como **contenido de ejemplo**).
- Menú fijo que resalta la sección visible, menú adaptable para celular, animaciones suaves al desplazarse (respetan la opción del sistema "reducir movimiento").
- Accesibilidad: navegación con teclado, foco atrapado en las ventanas, cierre con Escape, etiquetas en todos los campos, errores anunciados a lectores de pantalla y colores con contraste AA.

## Usarlo en tu computadora

Necesitas [Node.js 20 o superior](https://nodejs.org).

```bash
cd huellitas-de-amor
npm install
npm run dev        # abre http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila el sitio a la carpeta `dist/` |
| `npm run preview` | Sirve la versión compilada para probarla |
| `npm test` | Ejecuta las 29 pruebas automáticas |
| `npm run lint` | Revisa el código |
| `npm run verificar-fotos` | Comprueba que todas las fotos de Unsplash existan |

## Publicación en GitHub Pages

Cada cambio en esta carpeta que llegue a la rama `main` se prueba y se publica solo (`.github/workflows/huellitas-de-amor.yml`, en la raíz del repositorio). Para activarlo **una única vez**:

1. En GitHub, entra a **Settings → Pages**.
2. En **Source**, elige **GitHub Actions**.

El sitio quedará en `https://leonelchamorrocajahuaman1-glitch.github.io/las-COBRAS/`.

## ⚠️ Lo que falta para producción

Este sitio **no tiene backend**. Mientras no se conecte uno, los formularios funcionan en **modo demostración**: validan los datos y muestran una confirmación que dice claramente que la solicitud **no se envió ni se guardó**.

La estructura está lista para conectarlo:

1. **Servidor que reciba los formularios.** Implementa en tu API:
   - `POST /solicitudes`: cuerpo con `nombre, correo, telefono, ciudad, vivienda, motivo, mascotaId, mascotaNombre`, responde `{ "id": "..." }`.
   - `POST /contacto`: cuerpo con `nombre, correo, asunto, mensaje`, responde `{ "id": "..." }`.

   Luego crea `.env` con `VITE_API_URL=https://tu-api.com` y vuelve a compilar. El código está en `src/services/api.ts`.
   Opciones sencillas: Supabase, Firebase o un pequeño servidor Node/Express con PostgreSQL. Para recibir avisos por correo sin servidor propio existen servicios como Formspree.
2. **Base de datos de mascotas.** Hoy el catálogo está en `src/data/mascotas.ts`. Para que el refugio lo actualice sin programar, muévelo a la base de datos y cárgalo desde la API manteniendo el tipo `Mascota` (`src/types.ts`).
3. **Panel de administración con inicio de sesión** para que el equipo revise solicitudes y marque mascotas como adoptadas.
4. **Fotos propias.** Hoy se usan fotos de [Unsplash](https://unsplash.com/license) por su identificador. Para usar fotos del refugio, súbelas a un almacenamiento (por ejemplo Cloudinary o Supabase Storage) y adapta `src/lib/fotos.ts`.
5. **Datos reales de la organización** en `src/config/organizacion.ts` (correo, teléfono, dirección, redes sociales) y reemplazar las cifras, historias y testimonios de ejemplo (`src/components/secciones/Estadisticas.tsx` y `src/data/contenido.ts`).

## Estructura

```
src/
├── App.tsx                    # Arma la página y controla la ventana de cada mascota
├── components/
│   ├── layout/                # Barra de navegación y pie de página
│   ├── mascotas/              # Tarjeta, filtros, ficha, formulario de adopción, ventana
│   ├── secciones/             # Portada, catálogo, cómo adoptar, historias, nosotros, contacto…
│   └── ui/                    # Modal accesible, campo de formulario, foto con respaldo, logo…
├── config/                    # Datos de la organización y secciones del menú
├── data/                      # Mascotas, historias y testimonios de ejemplo
├── hooks/                     # Animación al desplazarse y sección activa del menú
├── lib/                       # Filtros, validaciones, fotos y estilos compartidos (con pruebas)
├── services/api.ts            # Envío de formularios (modo demostración o API real)
└── types.ts
```
