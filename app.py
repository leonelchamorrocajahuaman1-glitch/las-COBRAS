"""AdoptaBot · Las Cobras — app web de adopción responsable (Streamlit).

Ejecutar:  streamlit run app.py
"""

import sys
import traceback

import streamlit as st
from dotenv import load_dotenv

st.set_page_config(page_title="AdoptaBot · Las Cobras", page_icon="🐾", layout="wide")
load_dotenv()

# Streamlit Cloud oculta el detalle de los errores; aquí se muestra completo para poder diagnosticarlo.
try:
    from adoptabot.interfaz import PAGINAS
except Exception:
    st.error("No se pudo cargar AdoptaBot. Detalle técnico del error:")
    st.code(f"Python {sys.version}\n\n{traceback.format_exc()}", language="text")
    st.stop()

paginas = {
    "Adopta": [
        st.Page(PAGINAS["inicio"], title="Inicio", icon="🏠", default=True),
        st.Page(PAGINAS["catalogo"], title="Catálogo", icon="🐾"),
        st.Page(PAGINAS["test"], title="Test de compatibilidad", icon="🧪"),
        st.Page(PAGINAS["chat"], title="Chat con AdoptaBot", icon="💬"),
    ],
    "Tu proceso": [
        st.Page(PAGINAS["solicitud"], title="Solicitar adopción", icon="📝"),
        st.Page(PAGINAS["mi_solicitud"], title="Mi solicitud", icon="🔍"),
    ],
    "Refugio": [
        st.Page(PAGINAS["refugio"], title="Panel del refugio", icon="🔒"),
    ],
}

with st.sidebar:
    st.markdown("### Las Cobras ❤️")
    st.caption("Adopción responsable. **No vendemos animales.**")

st.navigation(paginas).run()
