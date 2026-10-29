"""Piezas de interfaz de Streamlit compartidas por todas las páginas."""

from __future__ import annotations

import os

import streamlit as st

from .catalogo import EMOJI_ESPECIE, cargar_catalogo, etapa, tamaño_base
from .solicitudes import DB_PATH, ETIQUETAS_MASCOTA, Repositorio

PAGINAS = {
    "inicio": "paginas/inicio.py",
    "catalogo": "paginas/catalogo.py",
    "test": "paginas/test.py",
    "chat": "paginas/chat.py",
    "solicitud": "paginas/solicitud.py",
    "mi_solicitud": "paginas/mi_solicitud.py",
    "guia": "paginas/guia.py",
    "refugio": "paginas/refugio.py",
}

COLOR_ESTADO = {"disponible": "green", "en_proceso": "orange", "adoptado": "violet"}
ETIQUETA_ETAPA = {"cachorro": "Cachorro", "adulto": "Adulto", "senior": "Senior"}


@st.cache_resource
def repositorio() -> Repositorio:
    """Una sola conexión a la base de datos para toda la app."""
    return Repositorio(os.getenv("ADOPTABOT_DB") or DB_PATH)


@st.cache_data
def catalogo() -> list[dict]:
    return cargar_catalogo()


def secreto(nombre: str) -> str:
    """Lee un valor de las variables de entorno (.env) o de los Secrets de Streamlit Cloud."""
    valor = os.getenv(nombre)
    if valor:
        return valor
    try:
        return str(st.secrets.get(nombre, ""))
    except Exception:  # no hay archivo de secrets
        return ""


def ir_a(pagina: str, **estado) -> None:
    """Cambia de página guardando datos para la siguiente (p. ej. la mascota elegida)."""
    for clave, valor in estado.items():
        st.session_state[clave] = valor
    st.switch_page(PAGINAS[pagina])


def insignia(texto: str, color: str = "gray") -> str:
    return f":{color}-background[{texto}]"


def tarjeta_mascota(m: dict, estado: str, clave: str, acciones: bool = True) -> None:
    """Tarjeta de una mascota con su ficha y botones para preguntar o postular."""
    sexo = {"macho": "♂", "hembra": "♀"}.get(m.get("sexo", ""), "")
    with st.container(border=True):
        izquierda, derecha = st.columns([1, 3], vertical_alignment="center")
        izquierda.markdown(f"<div style='font-size:3.2rem;text-align:center'>{EMOJI_ESPECIE.get(m['especie'], '🐾')}</div>",
                           unsafe_allow_html=True)
        with derecha:
            st.markdown(f"### {m['nombre']} {sexo}")
            st.markdown(insignia(ETIQUETAS_MASCOTA[estado], COLOR_ESTADO[estado]))
        st.markdown(" ".join([
            insignia(f"🎂 {m['edad']} · {ETIQUETA_ETAPA[etapa(m)]}"),
            insignia(f"📏 {tamaño_base(m).capitalize()}"),
            insignia(f"⚡ Energía {m['energia']}"),
        ]))
        st.caption(f"Ideal para: {m['ideal_para']}")
        with st.expander("Historia y salud"):
            st.write(m["historia"])
            convive = [t for t, ok in (("niños", m.get("apto_ninos")), ("perros", m.get("convive_perros")),
                                       ("gatos", m.get("convive_gatos"))) if ok]
            st.markdown(
                f"- 💉 **Vacunas:** {m['vacunas']}\n"
                f"- ✂️ **Esterilizado:** {'sí' if m['esterilizado'] else 'aún no'}\n"
                f"- 🏢 **Departamento:** {'sí' if m.get('apto_departamento') else 'necesita más espacio'}\n"
                f"- 🤝 **Convive con:** {', '.join(convive) if convive else 'prefiere ser el único'}"
            )
        if acciones:
            c1, c2 = st.columns(2)
            if c1.button("💬 Preguntar", key=f"preguntar-{clave}", use_container_width=True):
                ir_a("chat", chat_pendiente=f"Cuéntame más sobre {m['nombre']}. ¿Sería buena opción para mí?")
            if c2.button("📝 Postular", key=f"postular-{clave}", type="primary", use_container_width=True,
                         disabled=estado == "adoptado"):
                ir_a("solicitud", mascota_elegida=m["id"])


def cuadricula(mascotas: list[dict], estados: dict[int, str], prefijo: str, columnas: int = 3) -> None:
    """Muestra mascotas en filas de tarjetas."""
    for i in range(0, len(mascotas), columnas):
        cols = st.columns(columnas)
        for col, m in zip(cols, mascotas[i:i + columnas]):
            with col:
                tarjeta_mascota(m, estados.get(m["id"], "disponible"), clave=f"{prefijo}-{m['id']}")
