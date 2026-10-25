import streamlit as st

from adoptabot.interfaz import repositorio
from adoptabot.solicitudes import ETIQUETAS_SOLICITUD

st.title("🔍 Mi solicitud")
st.caption("Consulta el estado de tu solicitud con el código que recibiste y tu DNI.")

with st.form("consulta"):
    c1, c2 = st.columns(2)
    codigo = c1.text_input("Código de seguimiento", value=st.session_state.pop("consulta_codigo", ""),
                           placeholder="LC-1A2B3C")
    documento = c2.text_input("DNI o carné de extranjería")
    buscar = st.form_submit_button("Consultar", type="primary")

if buscar:
    s = repositorio().consultar(codigo, documento)
    if not s:
        st.error("No encontramos una solicitud con ese código y documento. Revisa que estén bien escritos.")
        st.stop()
    st.subheader(f"Solicitud {s['codigo']} · {s['mascota_nombre']}")
    st.markdown(f"**Estado:** {ETIQUETAS_SOLICITUD[s['estado']]}")
    if s["estado"] == "rechazada":
        st.warning("Esta vez no pudimos aprobar tu solicitud. Puedes postular por otra mascota cuando quieras. 💛")
    else:
        orden = ["pendiente", "entrevista", "aprobada"]
        actual = orden.index(s["estado"])
        cols = st.columns(3)
        for i, (col, paso) in enumerate(zip(cols, ["Recibida", "Entrevista", "¡Aprobada!"])):
            col.markdown(f"{'🟢' if i <= actual else '⚪'} **{paso}**")
        st.progress((actual + 1) / 3)
        if s["estado"] == "aprobada":
            st.success("¡Felicidades! Te contactaremos para coordinar la firma del contrato y la entrega. 🏡")
            st.balloons()
    if s["nota_refugio"]:
        st.info(f"**Mensaje del refugio:** {s['nota_refugio']}")
    st.caption(f"Enviada: {s['creada_en'][:10]} · Última actualización: {s['actualizada_en'][:10]}")
