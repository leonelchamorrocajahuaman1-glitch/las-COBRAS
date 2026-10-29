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
st.caption("En 4 pasos puedes postular. Empieza por el test de compatibilidad o explora el catálogo.")

c1, c2, c3 = st.columns(3)
c1.metric("Mascotas buscando hogar", len(disponibles))
c2.metric("Adopciones concretadas", stats["adoptadas"])
c3.metric("Solicitudes recibidas", stats["solicitudes"])

st.subheader("¿Por dónde empiezo?")
b1, b2, b3 = st.columns([1.2, 1, 1])
if b1.button("🧪 Hacer el test de compatibilidad", type="primary", use_container_width=True):
    ir_a("test")
if b2.button("🐾 Ver todas las mascotas", use_container_width=True):
    ir_a("catalogo")
if b3.button("💬 Tengo una duda", use_container_width=True):
    ir_a("chat")
st.caption("El test son 8 preguntas y no necesita IA. Si ya sabes a quién quieres, ve directo al catálogo.")

st.subheader("Cómo es el proceso")
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

st.subheader("Te están esperando")
if disponibles:
    cuadricula(disponibles[:3], estados, prefijo="inicio")
    texto, accion = st.columns([3, 1], vertical_alignment="center")
    texto.caption(f"Mostramos 3 de {len(disponibles)} mascotas disponibles.")
    if accion.button("Ver todas", use_container_width=True):
        ir_a("catalogo")
else:
    st.info("¡Todas nuestras mascotas encontraron hogar! Vuelve pronto: llegan rescatados cada semana. 💛")

st.info("💛 Adoptar es un compromiso de **10 a 15 años o más**. Tómate tu tiempo para decidir.")
