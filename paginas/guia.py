import streamlit as st

from adoptabot.calculadora import calcular_presupuesto
from adoptabot.interfaz import ir_a

st.title("💡 Guía de Adopción y Calculadora")
st.markdown(
    "Adoptar a un rescatado es una de las decisiones más hermosas y transformadoras. "
    "Para ayudarte a planificar una adopción consciente y responsable, "
    "preparamos esta guía práctica y calculadora de presupuesto."
)

tab_calc, tab_adaptacion, tab_checklist, tab_faq = st.tabs([
    "🧮 Calculadora de presupuesto",
    "🗓️ La Regla 3-3-3",
    "🎒 Checklist de bienvenida",
    "❓ Preguntas frecuentes",
])

# ==========================================
# TAB 1: Calculadora de Presupuesto
# ==========================================
with tab_calc:
    st.subheader("Calculadora de tenencia responsable")
    st.caption(
        "Estima cuánto costará aproximadamente el cuidado integral de tu nuevo compañero "
        "(alimentación, salud preventiva, higiene e imprevistos)."
    )

    col1, col2 = st.columns(2)
    with col1:
        especie = st.radio("Especie", ["Perro", "Gato"], horizontal=True)
        tamaño = st.selectbox("Tamaño", ["Pequeño", "Mediano", "Grande"], index=1)
    with col2:
        calidad = st.selectbox(
            "Calidad de alimento",
            ["Económica", "Estándar", "Premium"],
            index=1,
            help="Un alimento de buena calidad reduce gastos veterinarios a largo plazo.",
        )
        fondo_emergencia = st.checkbox("Incluir fondo de imprevistos/emergencias", value=True)

    monto_fondo = 30.0
    if fondo_emergencia:
        monto_fondo = st.slider("Ahorro mensual para emergencias (S/.)", 10.0, 100.0, 30.0, step=5.0)

    resultado = calcular_presupuesto(
        especie=especie.lower(),
        tamaño=tamaño.lower(),
        calidad_alimento=calidad.lower(),
        incluye_fondo_emergencia=fondo_emergencia,
        monto_emergencia_mensual=monto_fondo,
    )

    st.markdown("---")
    m1, m2 = st.columns(2)
    m1.metric("Gasto mensual estimado", f"S/. {resultado['total_mensual']:.2f}")
    m2.metric("Gasto anual proyectado", f"S/. {resultado['total_anual']:.2f}")

    st.markdown("#### Desglose mensual")
    for rubro, monto in resultado["desglose_mensual"].items():
        st.write(f"- **{rubro}:** S/. {monto:.2f}")

    with st.expander("🩺 Ver detalle de salud preventiva anual"):
        st.caption("Valores promedio de vacunación, desparasitación y chequeo veterinario anual:")
        for concepto, costo in resultado["desglose_salud_anual"].items():
            st.write(f"- {concepto.replace('_', ' ').capitalize()}: S/. {costo:.2f}")

    st.info("💡 **Consejo:** Mantener las vacunas y desparasitaciones al día previene enfermedades costosas y protege a toda tu familia.")


# ==========================================
# TAB 2: La Regla 3-3-3 de Adaptación
# ==========================================
with tab_adaptacion:
    st.subheader("La Regla 3-3-3 de la adopción")
    st.markdown(
        "Cada animal rescatado necesita tiempo para comprender que está a salvo. "
        "Esta regla resume los tiempos naturales de adaptación:"
    )

    c1, c2, c3 = st.columns(3)
    with c1.container(border=True):
        st.markdown("### 3 Días")
        st.markdown("**Fase de descompresión**")
        st.markdown(
            "- Puede sentirse confundido o abrumado.\n"
            "- Podría esconderse o no querer comer al inicio.\n"
            "- **Qué hacer:** Dale un espacio tranquilo, silencio y no lo presiones a socializar."
        )

    with c2.container(border=True):
        st.markdown("### 3 Semanas")
        st.markdown("**Fase de aprendizaje**")
        st.markdown(
            "- Empieza a habituarse a tus horarios y rutinas.\n"
            "- Comienza a mostrar su verdadera personalidad.\n"
            "- **Qué hacer:** Mantén horarios fijos de comida y paseos. Refuerzo positivo siempre."
        )

    with c3.container(border=True):
        st.markdown("### 3 Meses")
        st.markdown("**Confianza y pertenencia**")
        st.markdown(
            "- Se siente 100 % en casa y parte de la manada familiar.\n"
            "- Confianza y vínculo afectivo consolidado.\n"
            "- **Qué hacer:** Disfruten juntos de una convivencia llena de cariño y lealtad."
        )


# ==========================================
# TAB 3: Checklist de Bienvenida
# ==========================================
with tab_checklist:
    st.subheader("🎒 Checklist para el primer día en casa")
    st.markdown("Marca lo que ya tengas listo antes de traer a tu nuevo amigo a casa:")

    st.checkbox("Plato para comida y bebedero con agua fresca", value=True)
    st.checkbox("Cama cómoda o colchoneta en una zona resguardada", value=True)
    st.checkbox("Alimento adecuado para su especie y etapa (cachorro, adulto o senior)")
    st.checkbox("Collar con placa identificatoria (con tu celular legible) y correa segura")
    st.checkbox("Caja de arena y pala (para gatos) / Bolsas biodegradables (para perros)")
    st.checkbox("Juguete seguro o mordedor para ayudar con la ansiedad inicial")
    st.checkbox("Número de una clínica veterinaria de confianza para urgencias")


# ==========================================
# TAB 4: Preguntas Frecuentes
# ==========================================
with tab_faq:
    st.subheader("❓ Preguntas frecuentes")

    with st.expander("¿Cuáles son los requisitos principales para adoptar?"):
        st.markdown(
            "1. Ser mayor de edad y presentar DNI vigente.\n"
            "2. Todos los miembros del hogar deben estar de acuerdo con la adopción.\n"
            "3. Contar con espacio seguro (en caso de departamentos, contar con mallas de seguridad si son gatos).\n"
            "4. Firmar el compromiso de tenencia responsable."
        )

    with st.expander("¿Las mascotas se entregan esterilizadas?"):
        st.markdown(
            "**Sí.** Todos los animales adultos se entregan esterilizados y vacunados. "
            "En el caso de cachorros muy pequeños que aún no alcanzan la edad quirúrgica, "
            "la adopción incluye un compromiso obligatorio de esterilización al cumplir la edad adecuada."
        )

    with st.expander("¿Por qué no venden animales en Las Cobras?"):
        st.markdown(
            "Creemos firmemente que los animales no son mercancía. Cada rescatado merece un hogar por amor, "
            "y rescatar salva dos vidas: la de quien adoptas y la del animal que podrá ocupar su lugar en el refugio."
        )

    with st.expander("¿Puedo adoptar si vivo en departamento?"):
        st.markdown(
            "**¡Claro que sí!** En nuestro catálogo puedes filtrar por 'Apto departamento'. "
            "Muchos perritos de energía tranquila y la gran mayoría de gatitos se adaptan de forma perfecta a departamentos."
        )

st.markdown("---")
st.subheader("¿Listo para encontrar a tu compañero ideal?")
b1, b2 = st.columns(2)
if b1.button("🐾 Ver mascotas en adopción", type="primary", use_container_width=True):
    ir_a("catalogo")
if b2.button("🧪 Realizar test de compatibilidad", use_container_width=True):
    ir_a("test")
