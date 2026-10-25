import csv
import hmac
import io

import streamlit as st

from adoptabot.catalogo import EMOJI_ESPECIE
from adoptabot.interfaz import catalogo, repositorio, secreto
from adoptabot.solicitudes import ESTADOS_MASCOTA, ESTADOS_SOLICITUD, ETIQUETAS_MASCOTA, ETIQUETAS_SOLICITUD

st.title("🔒 Panel del refugio")

clave_admin = secreto("ADMIN_PASSWORD")
if not clave_admin:
    st.info(
        "Para activar el panel, define la contraseña `ADMIN_PASSWORD`:\n\n"
        "- **En tu computadora:** agrega `ADMIN_PASSWORD=tu_clave` al archivo `.env`\n"
        "- **En Streamlit Cloud:** *Manage app → Settings → Secrets* → `ADMIN_PASSWORD = \"tu_clave\"`"
    )
    st.stop()

if not st.session_state.get("admin"):
    intentos = st.session_state.get("intentos_admin", 0)
    if intentos >= 5:
        st.error("Demasiados intentos fallidos. Recarga la página para intentarlo de nuevo.")
        st.stop()
    with st.form("login"):
        clave = st.text_input("Contraseña del refugio", type="password")
        if st.form_submit_button("Entrar", type="primary"):
            if hmac.compare_digest(clave.encode(), clave_admin.encode()):
                st.session_state.admin = True
                st.rerun()
            st.session_state.intentos_admin = intentos + 1
            st.error("Contraseña incorrecta.")
    st.stop()

repo = repositorio()
mascotas = {m["id"]: m for m in catalogo()}
stats = repo.estadisticas()

with st.sidebar:
    if st.button("Cerrar sesión del refugio", use_container_width=True):
        st.session_state.admin = False
        st.rerun()

c1, c2, c3, c4 = st.columns(4)
c1.metric("Solicitudes", stats["solicitudes"])
c2.metric("Por revisar", stats["por_estado"]["pendiente"])
c3.metric("En entrevista", stats["por_estado"]["entrevista"])
c4.metric("Adopciones", stats["adoptadas"])

pestaña_sol, pestaña_mas, pestaña_exp = st.tabs(["📥 Solicitudes", "🐾 Mascotas", "⬇️ Exportar"])

with pestaña_sol:
    filtro = st.radio("Mostrar", ["Todas", *ESTADOS_SOLICITUD], horizontal=True,
                      format_func=lambda e: e if e == "Todas" else ETIQUETAS_SOLICITUD[e])
    solicitudes = repo.listar(None if filtro == "Todas" else filtro)
    if not solicitudes:
        st.caption("No hay solicitudes en esta categoría.")
    for s in solicitudes:
        especie = mascotas.get(s["mascota_id"], {}).get("especie", "")
        titulo = (f"{s['codigo']} · {EMOJI_ESPECIE.get(especie, '🐾')} {s['mascota_nombre']} · "
                  f"{s['nombre']} · {ETIQUETAS_SOLICITUD[s['estado']]}")
        with st.expander(titulo, expanded=s["estado"] == "pendiente"):
            d1, d2 = st.columns(2)
            d1.markdown(f"**DNI:** {s['documento']}  \n**Celular:** {s['telefono']}  \n**Correo:** {s['email'] or '—'}")
            d2.markdown(f"**Distrito:** {s['distrito']}  \n**Vivienda:** {s['vivienda']}  \n**Enviada:** {s['creada_en'][:16].replace('T', ' ')} (UTC)")
            st.markdown(f"**Motivo:** {s['motivo']}")
            with st.form(f"f-{s['codigo']}"):
                e1, e2 = st.columns([1, 2])
                nuevo = e1.selectbox("Estado", ESTADOS_SOLICITUD, index=ESTADOS_SOLICITUD.index(s["estado"]),
                                     format_func=ETIQUETAS_SOLICITUD.get)
                nota = e2.text_input("Mensaje para el solicitante (lo verá en 'Mi solicitud')", value=s["nota_refugio"])
                if st.form_submit_button("Guardar"):
                    try:
                        repo.actualizar_estado(s["codigo"], nuevo, nota)
                    except ValueError as err:
                        st.error(str(err))
                    else:
                        st.toast(f"Solicitud {s['codigo']} actualizada")
                        st.rerun()

with pestaña_mas:
    st.caption("El estado cambia solo al aprobar o rechazar solicitudes, pero puedes corregirlo aquí.")
    def cambiar_estado(mascota_id: int, nombre: str, clave: str) -> None:
        # Solo se guarda cuando el usuario cambia el selector (no en cada recarga de la página)
        repo.fijar_estado_mascota(mascota_id, st.session_state[clave])
        st.toast(f"{nombre}: {ETIQUETAS_MASCOTA[st.session_state[clave]]}")

    estados = repo.estados_mascotas()
    for m in mascotas.values():
        a, b = st.columns([2, 1], vertical_alignment="center")
        a.markdown(f"{EMOJI_ESPECIE[m['especie']]} **{m['nombre']}** · {m['edad']} · {m['tamaño']}")
        clave = f"em-{m['id']}"
        # El selector siempre refleja la base de datos (p. ej. tras aprobar una solicitud en la otra pestaña)
        st.session_state[clave] = estados.get(m["id"], "disponible")
        b.selectbox("Estado", ESTADOS_MASCOTA, format_func=ETIQUETAS_MASCOTA.get, key=clave,
                    label_visibility="collapsed", on_change=cambiar_estado, args=(m["id"], m["nombre"], clave))

with pestaña_exp:
    todas = repo.listar()
    salida = io.StringIO()
    if todas:
        escritor = csv.DictWriter(salida, fieldnames=list(todas[0].keys()))
        escritor.writeheader()
        for fila in todas:
            # Evita que Excel interprete como fórmula un texto que empiece con =, +, - o @
            escritor.writerow({k: f"'{v}" if isinstance(v, str) and v and v[0] in "=+-@" else v for k, v in fila.items()})
    st.download_button("Descargar solicitudes (CSV)", ("﻿" + salida.getvalue()).encode("utf-8"),
                       file_name="solicitudes_las_cobras.csv", mime="text/csv", disabled=not todas)
    st.caption(f"{len(todas)} solicitud(es). El archivo se abre directamente en Excel.")
