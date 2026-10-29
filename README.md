# 🐾 AdoptaBot — Las Cobras

App web de **adopción responsable de mascotas** para **Las Cobras**, hecha en Python con Streamlit y la API de Claude (Anthropic).

## Qué incluye

| Página | Para qué sirve | ¿Usa IA? |
|---|---|---|
| 🏠 **Inicio** | Presentación, estadísticas del refugio, pasos para adoptar y mascotas destacadas | No |
| 🐾 **Catálogo** | Fichas de cada mascota con filtros (especie, tamaño, edad, energía, apto para niños o departamento) e indicador de estado: disponible, en proceso o adoptado | No |
| 🧪 **Test de compatibilidad** | 8 preguntas sobre tu estilo de vida → las 3 mascotas más compatibles (0-100 %) con sus motivos y alertas | No |
| 💬 **Chat con AdoptaBot** | Asistente que consulta el catálogo **en tiempo real** con herramientas (*tool use*), recomienda según tu perfil y explica el proceso | Sí |
| 📝 **Solicitar adopción** | Formulario validado (DNI, celular, compromiso de tenencia responsable). Entrega un **código de seguimiento** (ej. `LC-1A2B3C`) | No |
| 🔍 **Mi solicitud** | Consulta el estado con tu código + DNI: recibida → entrevista → aprobada, y el mensaje del refugio | No |
| 🔒 **Panel del refugio** | Con contraseña: revisar solicitudes, cambiar su estado, dejar mensajes, marcar mascotas como adoptadas y exportar a CSV (Excel) | No |

Las páginas sin IA funcionan aunque no haya clave de API ni saldo.

### Cómo trabaja AdoptaBot

AdoptaBot no inventa datos: usa tres **herramientas** que consultan el catálogo y la base de datos:

- `buscar_mascotas`: filtra por especie, tamaño, energía, etapa de vida, niños y departamento (oculta las adoptadas).
- `ver_mascota`: ficha completa y estado de adopción actual.
- `recomendar_mascotas`: calcula la compatibilidad con el mismo algoritmo del test.

Mientras busca, el chat muestra lo que está haciendo ("🔎 Buscando en el catálogo…") y la respuesta aparece en tiempo real (*streaming*). Los errores se explican en español: clave inválida, sin saldo, sin conexión, etc.

Reglas que siempre cumple: no vende animales, no da diagnósticos veterinarios (deriva a una clínica) y nunca pide contraseñas ni datos bancarios.

## Estructura

```
las-COBRAS/
├── app.py                  # Punto de entrada: menú de páginas
├── paginas/                # Una página de Streamlit por archivo
│   ├── inicio.py · catalogo.py · test.py · chat.py
│   ├── solicitud.py · mi_solicitud.py
│   └── refugio.py          # Panel del refugio (con contraseña)
├── adoptabot/
│   ├── bot.py              # Conversación con Claude: streaming + ciclo de herramientas
│   ├── herramientas.py     # Definición y ejecución de las herramientas (con validación)
│   ├── prompt.py           # Master prompt
│   ├── catalogo.py         # Filtros y algoritmo de compatibilidad
│   ├── solicitudes.py      # Solicitudes y estados en SQLite
│   └── interfaz.py         # Tarjetas y piezas de UI compartidas
├── data/mascotas.json      # Catálogo de mascotas
├── tests/                  # Pruebas automáticas (pytest)
├── cli.py                  # Chat en la terminal
└── requirements.txt
```

## Instalación (en tu computadora)

```bash
git clone https://github.com/leonelchamorrocajahuaman1-glitch/las-COBRAS.git
cd las-COBRAS
python -m pip install -r requirements.txt
```

Copia `.env.example` como `.env` y completa:

```
ANTHROPIC_API_KEY=tu_clave_aqui          # https://console.anthropic.com
ADMIN_PASSWORD=elige_una_contraseña      # para el Panel del refugio
```

> ⚠️ Nunca subas tu archivo `.env` a GitHub (ya está en `.gitignore`).

Iniciar la app:

```bash
python -m streamlit run app.py
```

Chat en la terminal: `python cli.py`

## Publicar en Streamlit Community Cloud

1. En https://share.streamlit.io → **Create app** → repositorio `las-COBRAS`, rama `main`, archivo principal **`app.py`**.
2. En **Advanced settings → Secrets**:
   ```toml
   ANTHROPIC_API_KEY = "sk-ant-..."
   ADMIN_PASSWORD = "tu_contraseña_del_refugio"
   ```
3. **Deploy**. Cada cambio en la rama `main` se publica solo.

> En Streamlit Community Cloud el disco no es permanente: las solicitudes se borran cuando la app se reinicia o se vuelve a publicar. Sirve para demostraciones; para uso real conviene una base de datos externa (por ejemplo PostgreSQL en Supabase o Neon).

## Configuración opcional

| Variable | Por defecto | Descripción |
|---|---|---|
| `ADOPTABOT_MODEL` | `claude-opus-5-5` | Modelo de Claude. Usa `claude-sonnet-5-5` para gastar la mitad. |
| `ADOPTABOT_EFFORT` | `low` | Esfuerzo de razonamiento (`low`, `medium`, `high`). `low` es rápido y económico para chatear. |
| `ADOPTABOT_DB` | `data/adoptabot.db` | Archivo SQLite de solicitudes. |

Si un filtro de seguridad rechaza por error una consulta legítima, la API la reintenta automáticamente en el modelo de respaldo recomendado (*server-side fallback*).

## Agregar mascotas

Edita `data/mascotas.json`. Cada mascota tiene: `id` (único), `nombre`, `especie` (`perro`/`gato`), `sexo`, `edad` (ej. `"2 años"`, `"4 meses"`), `tamaño`, `energia` (`baja`/`media`/`alta`), `vacunas`, `esterilizado`, `apto_ninos`, `apto_departamento`, `convive_perros`, `convive_gatos`, `requiere_experiencia`, `ideal_para` e `historia`.

## Pruebas

```bash
python -m pip install -r requirements-dev.txt
python -m pytest
```

Cubren el algoritmo de compatibilidad, los filtros, la validación del formulario, el flujo de estados (una mascota aprobada queda adoptada y no acepta nuevas solicitudes), la validación de las herramientas y el ciclo de herramientas del bot con un cliente falso, que no usa la API ni gasta saldo.

## Versión Java (opcional)

En [`java/`](java/README.md) hay una versión equivalente con **Spring Boot + Thymeleaf + SQLite**
que comparte el catálogo (`data/mascotas.json`) y las mismas reglas de negocio. La app Python
sigue siendo la principal; la versión Java se ejecuta aparte con `./mvnw spring-boot:run`
(requiere JDK 25) y corre en otro puerto si la app Python ya usa el 8080.

