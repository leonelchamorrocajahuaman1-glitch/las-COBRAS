import streamlit as st

from adoptabot.catalogo import EMOJI_ESPECIE
from adoptabot.interfaz import catalogo, ir_a, repositorio
from adoptabot.solicitudes import ETIQUETAS_MASCOTA, SolicitudInvalida

st.title("📝 Solicitud de adopción")
st.caption("Completa el formulario. El equipo del refugio revisará tu solicitud y te contactará para una entrevista.")

repo = repositorio()
estados = repo.estados_mascotas()
opciones = [m for m in catalogo() if estados.get(m["id"], "disponible") != "adoptado"]
if not opciones:
    st.info("¡Todas nuestras mascotas encontraron hogar! Vuelve pronto. 💛")
    st.stop()

if st.session_state.get("codigo_creado"):
    codigo, nombre = st.session_state.pop("codigo_creado")
    st.success(f"### ¡Solicitud enviada! 🎉\nTu código de seguimiento es **{codigo}**.")
    st.markdown(
        f"Guárdalo: con él y tu DNI puedes ver el estado de tu solicitud para **{nombre}** en *Mi solicitud*. "
        "Te contactaremos por celular en un plazo de 2 a 3 días hábiles."
    )
    if st.button("🔍 Ver mi solicitud"):
        ir_a("mi_solicitud", consulta_codigo=codigo)
    st.balloons()
    st.stop()

ids = [m["id"] for m in opciones]
preferida = st.session_state.get("mascota_elegida")
indice = ids.index(preferida) if preferida in ids else 0
mascota = st.selectbox(
    "¿A quién quieres adoptar?", opciones, index=indice,
    format_func=lambda m: f"{EMOJI_ESPECIE[m['especie']]} {m['nombre']} · {m['edad']} · {ETIQUETAS_MASCOTA[estados.get(m['id'], 'disponible')]}",
)
st.session_state.mascota_elegida = mascota["id"]
if estados.get(mascota["id"]) == "en_proceso":
    st.info(f"Otra familia ya está en entrevista con {mascota['nombre']}, pero puedes postular igual.")

perfil = st.session_state.get("perfil")
viviendas = ["Departamento", "Casa sin patio", "Casa con patio"]
vivienda_test = {"departamento": 0, "casa": 1, "casa_patio": 2}.get(getattr(perfil, "vivienda", ""), 0)

with st.form("solicitud", clear_on_submit=False):
    c1, c2 = st.columns(2)
    nombre = c1.text_input("Nombre y apellido *")
    documento = c2.text_input("DNI o carné de extranjería *", max_chars=12)
    c3, c4 = st.columns(2)
    telefono = c3.text_input("Celular *", placeholder="987654321", max_chars=12)
    email = c4.text_input("Correo electrónico (opcional)")
    c5, c6 = st.columns(2)
    distrito = c5.text_input("Distrito / ciudad *")
    vivienda = c6.selectbox("Tipo de vivienda *", viviendas, index=vivienda_test)
    motivo = st.text_area(
        "¿Por qué quieres adoptar? Cuéntanos de tu hogar y tu rutina *", height=120,
        placeholder="Ej.: Vivimos 3 personas, trabajo desde casa y tenemos tiempo para pasearlo dos veces al día…",
    )
    acepta = st.checkbox(
        "Me comprometo a cuidarlo toda su vida (10 a 15+ años), llevarlo al veterinario, "
        "esterilizarlo si aún no lo está y permitir visitas de seguimiento del refugio."
    )
    enviar = st.form_submit_button("Enviar solicitud", type="primary", use_container_width=True)

if enviar:
    try:
        codigo = repo.crear_solicitud(mascota, {
            "nombre": nombre, "documento": documento, "telefono": telefono, "email": email,
            "distrito": distrito, "vivienda": vivienda, "motivo": motivo, "acepta_compromiso": acepta,
        })
    except SolicitudInvalida as e:
        st.error(str(e))
    else:
        st.session_state.codigo_creado = (codigo, mascota["nombre"])
        st.rerun()
st.caption("🔒 Tus datos solo los ve el equipo del refugio. Nunca te pediremos contraseñas ni datos bancarios.")
