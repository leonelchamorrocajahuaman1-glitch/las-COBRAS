# 🐾 AdoptaBot — Las Cobras

Asistente virtual de adopción responsable de mascotas para la app **Las Cobras**, hecho en Python con la API de Claude (Anthropic).

AdoptaBot:
- 🐶🐱 Recomienda mascotas según tu estilo de vida (vivienda, tiempo, niños, otras mascotas).
- 📋 Explica el proceso: perfil → entrevista → visita guiada → contrato → entrega.
- ℹ️ Responde sobre los animales del catálogo (`data/mascotas.json`).
- ❤️ Promueve la tenencia responsable (compromiso de 10 a 15+ años).
- 🚫 No vende animales, no da diagnósticos veterinarios y nunca pide contraseñas ni datos bancarios.

## Estructura

```
las-COBRAS/
├── adoptabot/
│   ├── prompt.py      # Master prompt + carga del catálogo
│   └── bot.py         # Clase AdoptaBot (API de Claude, con historial)
├── data/
│   └── mascotas.json  # Catálogo de mascotas disponibles
├── app.py             # Chat web (Streamlit)
├── cli.py             # Chat en la terminal
├── requirements.txt
└── .env.example
```

## Instalación

```bash
git clone https://github.com/leonelchamorrocajahuaman1-glitch/las-COBRAS.git
cd las-COBRAS
python -m venv venv
# Windows: venv\Scripts\activate   |   Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Copia `.env.example` como `.env` y coloca tu clave de API de Anthropic
(se obtiene en https://console.anthropic.com):

```
ANTHROPIC_API_KEY=tu_clave_aqui
```

> ⚠️ Nunca subas tu archivo `.env` a GitHub (ya está en `.gitignore`).

## Uso

**Chat web:**
```bash
streamlit run app.py
```

**Chat en terminal:**
```bash
python cli.py
```

**Desde tu propio código:**
```python
from adoptabot import AdoptaBot

bot = AdoptaBot()
print(bot.responder("Vivo en un departamento y trabajo todo el día, ¿qué mascota me recomiendas?"))
```

## Agregar mascotas

Edita `data/mascotas.json`. Cada mascota tiene: `nombre`, `especie`, `edad`, `tamaño`, `energia`, `vacunas`, `esterilizado`, `ideal_para` e `historia`. AdoptaBot solo habla de las mascotas que estén en este archivo.
