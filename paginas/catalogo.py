import streamlit as st

from adoptabot.catalogo import ETAPAS, TAMAÑOS, etapa, filtrar, tamaño_base
from adoptabot.interfaz import barra_proceso, catalogo, cuadricula, ir_a, repositorio

st.title("🐾 Catálogo de mascotas")
st.caption("Todos están vacunados según su edad, desparasitados y con historia conocida.")
barra_proceso(0)

mascotas = catalogo()
estados = repositorio().estados_mascotas()

with st.container(border=True):
    encabezado, accion = st.columns([3, 1], vertical_alignment="center")
    encabezado.markdown("#### Filtros")
    encabezado.caption("¿No sabes a quién elegir? El test te orienta con 8 preguntas rápidas.")
    if accion.button("🧪 Hacer el test", use_container_width=True):
        ir_a("test")

    f1, f2, f3, f4 = st.columns([1.2, 1.4, 1.4, 1])
    especie = f1.radio("Especie", ["Todos", "Perros", "Gatos"], horizontal=True)
    tamaños = f2.multiselect("Tamaño", TAMAÑOS, format_func=str.capitalize)
    etapas = f3.multiselect("Edad", ETAPAS, format_func=str.capitalize)
    energias = f4.multiselect("Energía", ["baja", "media", "alta"], format_func=str.capitalize)
    t1, t2, t3 = st.columns(3)
    con_ninos = t1.toggle("Apto para niños")
    en_depa = t2.toggle("Apto para departamento")
    ver_adoptados = t3.toggle("Mostrar ya adoptados")

resultado = filtrar(
    mascotas,
    especie={"Perros": "perro", "Gatos": "gato"}.get(especie),
    apto_ninos=True if con_ninos else None,
    apto_departamento=True if en_depa else None,
)
resultado = [
    m for m in resultado
    if (not tamaños or tamaño_base(m) in tamaños)
    and (not etapas or etapa(m) in etapas)
    and (not energias or m["energia"] in energias)
    and (ver_adoptados or estados.get(m["id"], "disponible") != "adoptado")
]

st.markdown(f"**{len(resultado)}** {'mascota encontrada' if len(resultado) == 1 else 'mascotas encontradas'}")
if resultado:
    cuadricula(resultado, estados, prefijo="catalogo")
else:
    st.warning("No hay mascotas con esos filtros. Prueba quitando alguno o pregúntale a AdoptaBot. 🐾")
    if st.button("🧪 Hacer el test de compatibilidad", type="primary"):
        ir_a("test")
