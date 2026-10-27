import streamlit as st

from adoptabot import MENSAJE_BIENVENIDA, AdoptaBot, mensaje_de_error
from adoptabot.interfaz import catalogo, repositorio, secreto

SUGERENCIAS = [
    "Vivo en un departamento y trabajo 8 horas, ¿qué me recomiendas?",
    "Tengo niños pequeños, ¿qué mascota es buena para ellos?",
    "¿Qué gatos tienen disponibles?",
    "¿Cuáles son los requisitos para adoptar?",
]

st.title("💬 Chat con AdoptaBot")
st.caption("Pregúntame por las mascotas, el proceso de adopción o qué compañero encaja contigo.")

clave = secreto("ANTHROPIC_API_KEY")
if not clave:
    st.warning(
        "🔑 Falta la clave de la API de Claude.\n\n"
        "- **En tu computadora:** crea un archivo `.env` con `ANTHROPIC_API_KEY=sk-ant-...`\n"
        "- **En Streamlit Cloud:** *Manage app → Settings → Secrets* y pega `ANTHROPIC_API_KEY = \"sk-ant-...\"`\n\n"
        "Mientras tanto puedes usar el **Catálogo** y el **Test de compatibilidad**, que no necesitan IA."
    )
    st.stop()

if "bot" not in st.session_state:
    st.session_state.bot = AdoptaBot(api_key=clave, catalogo=catalogo(), estado_de=repositorio().estado_mascota)
    st.session_state.mensajes = []  # lo que se muestra en pantalla
bot: AdoptaBot = st.session_state.bot

with st.sidebar:
    if st.button("🔄 Nueva conversación", use_container_width=True):
        bot.reiniciar()
        st.session_state.mensajes = []
        st.rerun()
    st.caption(f"Modelo: `{bot.modelo}`")

with st.chat_message("assistant", avatar="🐾"):
    st.markdown(MENSAJE_BIENVENIDA)

for msg in st.session_state.mensajes:
    with st.chat_message(msg["rol"], avatar="🐾" if msg["rol"] == "assistant" else "🙂"):
        for paso in msg.get("pasos", []):
            st.caption(paso)
        if msg.get("error"):
            st.error(msg["error"])
        if msg.get("texto"):
            st.markdown(msg["texto"])

pregunta = st.chat_input("Escribe tu mensaje…")
if not pregunta and st.session_state.get("chat_pendiente"):
    pregunta = st.session_state.pop("chat_pendiente")
if not pregunta and not st.session_state.mensajes:
    st.markdown("**Prueba con:**")
    cols = st.columns(2)
    for i, sugerencia in enumerate(SUGERENCIAS):
        if cols[i % 2].button(sugerencia, key=f"sug-{i}", use_container_width=True):
            st.session_state.chat_pendiente = sugerencia
            st.rerun()

if pregunta:
    st.session_state.mensajes.append({"rol": "user", "texto": pregunta})
    with st.chat_message("user", avatar="🙂"):
        st.markdown(pregunta)

    respuesta = {"rol": "assistant", "texto": "", "pasos": []}
    with st.chat_message("assistant", avatar="🐾"):
        zona_pasos = st.container()
        zona_texto = st.empty()
        zona_texto.markdown("_Pensando…_")
        try:
            for tipo, dato in bot.conversar(pregunta):
                if tipo == "herramienta":
                    respuesta["pasos"].append(dato)
                    zona_pasos.caption(dato)
                else:
                    respuesta["texto"] += dato
                    zona_texto.markdown(respuesta["texto"] + "▌")
            zona_texto.markdown(respuesta["texto"])
        except Exception as e:
            respuesta["error"] = mensaje_de_error(e)
            zona_texto.empty()
            st.error(respuesta["error"])
    st.session_state.mensajes.append(respuesta)
