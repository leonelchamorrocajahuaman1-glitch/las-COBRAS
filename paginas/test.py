import streamlit as st

from adoptabot.catalogo import EMOJI_ESPECIE, Perfil, recomendar
from adoptabot.interfaz import catalogo, ir_a, repositorio

st.title("🧪 Test de compatibilidad")
st.caption("Responde 8 preguntas y te diremos qué mascotas encajan mejor con tu vida. Es gratis y no usa IA.")

with st.form("test"):
    c1, c2 = st.columns(2)
    especie = c1.radio("¿Qué te gustaría adoptar?", ["Me da igual", "Perro", "Gato"], horizontal=True)
    vivienda = c2.radio("¿Dónde vives?", ["Departamento", "Casa sin patio", "Casa con patio"], horizontal=True)
    actividad = st.select_slider(
        "¿Qué tan activa es tu rutina?",
        options=["baja", "media", "alta"], value="media",
        format_func={"baja": "🛋️ Tranquila", "media": "🚶 Moderada", "alta": "🏃 Muy activa"}.get,
    )
    horas = st.slider("¿Cuántas horas al día estaría sola la mascota?", 0, 12, 6)
    c3, c4, c5, c6 = st.columns(4)
    ninos = c3.checkbox("Hay niños en casa")
    perros = c4.checkbox("Tengo perros")
    gatos = c5.checkbox("Tengo gatos")
    experiencia = c6.checkbox("Ya tuve mascotas")
    enviado = st.form_submit_button("Ver mis resultados", type="primary", use_container_width=True)

if enviado:
    st.session_state.perfil = Perfil(
        vivienda={"Departamento": "departamento", "Casa sin patio": "casa", "Casa con patio": "casa_patio"}[vivienda],
        actividad=actividad, horas_fuera=horas, ninos=ninos, otros_perros=perros, otros_gatos=gatos,
        experiencia=experiencia, especie={"Perro": "perro", "Gato": "gato"}.get(especie, "cualquiera"),
    )

perfil = st.session_state.get("perfil")
if perfil:
    estados = repositorio().estados_mascotas()
    adoptadas = {i for i, e in estados.items() if e == "adoptado"}
    resultados = recomendar(catalogo(), perfil, n=3, excluir_ids=adoptadas)
    st.subheader("Tus mejores coincidencias")
    if not resultados:
        st.warning("Ahora no tenemos una mascota que encaje con tu perfil. ¡Vuelve pronto, llegan rescatados cada semana!")
    for i, r in enumerate(resultados):
        m = r.mascota
        with st.container(border=True):
            izq, der = st.columns([3, 1], vertical_alignment="center")
            izq.markdown(f"### {'🥇🥈🥉'[i]} {EMOJI_ESPECIE[m['especie']]} {m['nombre']} — {r.puntaje}% compatible")
            izq.progress(r.puntaje / 100)
            for razon in r.razones:
                izq.markdown(f"✅ {razon}")
            for alerta in r.alertas:
                izq.markdown(f"⚠️ {alerta}")
            if der.button("📝 Postular", key=f"t-post-{m['id']}", type="primary", use_container_width=True):
                ir_a("solicitud", mascota_elegida=m["id"])
            if der.button("💬 Preguntar", key=f"t-chat-{m['id']}", use_container_width=True):
                ir_a("chat", chat_pendiente=(
                    f"Hice el test y {m['nombre']} me salió {r.puntaje}% compatible. "
                    f"Vivo en {perfil.vivienda.replace('_', ' con ')}, mi rutina es {perfil.actividad} "
                    f"y la mascota estaría {perfil.horas_fuera} h sola. ¿Qué debo saber antes de adoptarlo?"
                ))
    st.caption("El puntaje es orientativo. En la entrevista el equipo del refugio te ayudará a decidir.")
