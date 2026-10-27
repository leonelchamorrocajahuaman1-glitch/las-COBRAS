import streamlit as st

from adoptabot.interfaz import catalogo, cuadricula, ir_a, repositorio

repo = repositorio()
mascotas = catalogo()
estados = repo.estados_mascotas()
disponibles = [m for m in mascotas if estados.get(m["id"], "disponible") != "adoptado"]
stats = repo.estadisticas()

st.title("🐾 Las Cobras · Adopción responsable")
st.markdown(
    "Conectamos animales rescatados con familias que les darán un hogar para toda la vida. "
    "**Aquí no se compran mascotas: se adoptan.**"
)

c1, c2, c3 = st.columns(3)
c1.metric("Mascotas buscando hogar", len(disponibles))
c2.metric("Adopciones concretadas", stats["adoptadas"])
c3.metric("Solicitudes recibidas", stats["solicitudes"])

st.subheader("¿Cómo adoptar?")
pasos = st.columns(4)
for col, (icono, titulo, texto) in zip(pasos, [
    ("🔎", "1. Conoce", "Mira el catálogo y las historias de cada rescatado."),
    ("🧪", "2. Haz el test", "Descubre qué mascota encaja con tu estilo de vida."),
    ("📝", "3. Postula", "Llena la solicitud y recibe un código de seguimiento."),
    ("🏡", "4. Entrevista y entrega", "Te contactamos, visitas al animal y firmamos el contrato."),
]):
    with col.container(border=True):
        st.markdown(f"#### {icono} {titulo}")
        st.caption(texto)

b1, b2, b3 = st.columns(3)
if b1.button("🧪 Hacer el test de compatibilidad", type="primary", use_container_width=True):
    ir_a("test")
if b2.button("💬 Hablar con AdoptaBot", use_container_width=True):
    ir_a("chat")
if b3.button("🐾 Ver todas las mascotas", use_container_width=True):
    ir_a("catalogo")

st.subheader("Te están esperando")
cuadricula(disponibles[:3], estados, prefijo="inicio")
st.info("💛 Adoptar es un compromiso de **10 a 15 años o más**. Tómate tu tiempo para decidir.")
