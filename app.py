"""Interfaz web de AdoptaBot con Streamlit.

Ejecutar:  streamlit run app.py
"""

import streamlit as st
from dotenv import load_dotenv

from adoptabot import MENSAJE_BIENVENIDA, AdoptaBot

load_dotenv()

st.set_page_config(page_title="AdoptaBot · Las Cobras", page_icon="🐾", layout="centered")
st.title("🐾 AdoptaBot")
st.caption("Asistente de adopción responsable de **Las Cobras**")

if "bot" not in st.session_state:
    try:
        st.session_state.bot = AdoptaBot()
    except Exception as e:  # p. ej. falta la API key
        st.error(f"No se pudo iniciar AdoptaBot: {e}")
        st.stop()

bot: AdoptaBot = st.session_state.bot

with st.sidebar:
    st.markdown("### Las Cobras ❤️")
    st.markdown("Adopción responsable. **No vendemos animales.**")
    if st.button("🔄 Nueva conversación"):
        bot.reiniciar()
        st.rerun()

with st.chat_message("assistant", avatar="🐾"):
    st.markdown(MENSAJE_BIENVENIDA)

for msg in bot.historial:
    avatar = "🐾" if msg["role"] == "assistant" else "🙂"
    with st.chat_message(msg["role"], avatar=avatar):
        st.markdown(msg["content"])

if pregunta := st.chat_input("Escribe tu mensaje…"):
    with st.chat_message("user", avatar="🙂"):
        st.markdown(pregunta)
    with st.chat_message("assistant", avatar="🐾"):
        try:
            st.write_stream(bot.responder_stream(pregunta))
        except Exception as e:
            st.error(f"Ocurrió un error al responder: {e}")
