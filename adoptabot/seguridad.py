"""Utilidades de seguridad para AdoptaBot."""

from __future__ import annotations

import html
import hmac
import os
import re
from typing import Any

import streamlit as st


def sanitizar_texto(texto: str) -> str:
    """Escapa texto para evitar inyección HTML en componentes."""
    if texto is None:
        return ""
    return html.escape(str(texto))


def validar_contrasena_admin(contrasena: str) -> bool:
    """Valida contraseña del panel de refugio con comparación segura."""
    admin_pass = os.environ.get("ADMIN_PASSWORD", "").strip()
    if not admin_pass or not contrasena:
        return False
    try:
        return hmac.compare_digest(contrasena, admin_pass)
    except Exception:
        return False


def configurar_headers_seguridad() -> None:
    """Configura metadatos básicos de seguridad."""
    try:
        st.markdown(
            """
            <meta http-equiv="X-Content-Type-Options" content="nosniff">
            <meta http-equiv="X-Frame-Options" content="DENY">
            <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
            <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
            """,
            unsafe_allow_html=True,
        )
    except Exception:
        pass


def sanitizar_entrada(texto: str, max_len: int = 500) -> str:
    """Sanitiza entrada de usuario limitando longitud."""
    if not texto:
        return ""
    texto_limpio = str(texto).strip()
    if len(texto_limpio) > max_len:
        texto_limpio = texto_limpio[:max_len]
    # Elimina caracteres de control
    texto_limpio = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", texto_limpio)
    return texto_limpio
