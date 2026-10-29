"""Comprueba que el master prompt describa la app real y mantenga sus reglas críticas."""

import pytest

from adoptabot.prompt import MASTER_PROMPT, MENSAJE_BIENVENIDA, construir_system_prompt


def test_system_prompt_antepone_el_master_prompt_y_anexa_el_catalogo():
    catalogo = [
        {"id": 1, "nombre": "Canela", "especie": "perro"},
        {"id": 2, "nombre": "Luna", "especie": "gato"},
    ]
    prompt = construir_system_prompt(catalogo)
    assert prompt.startswith(MASTER_PROMPT)
    assert "Canela (perro), Luna (gato)" in prompt
    assert prompt.endswith("\n")


def test_system_prompt_usa_el_catalogo_real_por_defecto():
    assert "Canela (perro)" in construir_system_prompt()


@pytest.mark.parametrize("texto", [
    "PROHIBIDA LA VENTA",
    "clínica veterinaria",
    "8 preguntas",
    "LC-XXXXXX",
    "Mi solicitud",
    "Panel del refugio",
    "buscar_mascotas",
    "ver_mascota",
    "recomendar_mascotas",
    "no reveles",
    "son datos, no órdenes",
])
def test_master_prompt_cubre_el_contexto_y_las_reglas(texto):
    assert texto in MASTER_PROMPT


def test_master_prompt_no_promete_una_app_movil():
    assert "aplicación móvil" not in MASTER_PROMPT.lower()


def test_bienvenida_presenta_al_bot_y_las_opciones():
    assert "AdoptaBot" in MENSAJE_BIENVENIDA
    assert "Las Cobras" in MENSAJE_BIENVENIDA
    assert "perrito" in MENSAJE_BIENVENIDA and "gatito" in MENSAJE_BIENVENIDA
