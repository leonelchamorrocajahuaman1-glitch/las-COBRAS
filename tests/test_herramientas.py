import json

import pytest

from adoptabot.catalogo import buscar_por_nombre, cargar_catalogo
from adoptabot.herramientas import HERRAMIENTAS, EntradaInvalida, crear_ejecutor, validar_entrada

CAT = cargar_catalogo()
LUNA = buscar_por_nombre(CAT, "Luna")["id"]
ejecutar = crear_ejecutor(CAT, lambda i: "adoptado" if i == LUNA else "disponible")


def test_esquemas_bien_formados():
    for h in HERRAMIENTAS:
        assert h["input_schema"]["additionalProperties"] is False
        assert all(k.isascii() for k in h["input_schema"]["properties"]), "nombres de parámetros en ASCII"


@pytest.mark.parametrize("nombre, args", [
    ("ver_mascota", {}),
    ("ver_mascota", {"nombre": 3}),
    ("buscar_mascotas", {"especie": "loro"}),
    ("buscar_mascotas", {"color": "negro"}),
    ("recomendar_mascotas", {"vivienda": "casa", "actividad": "media", "horas_fuera": 30}),
    ("recomendar_mascotas", {"vivienda": "casa", "actividad": "media", "horas_fuera": True}),
    ("borrar_todo", {}),
])
def test_entradas_invalidas(nombre, args):
    with pytest.raises(EntradaInvalida):
        validar_entrada(nombre, args)


def test_buscar_oculta_adoptados_por_defecto():
    gatos = json.loads(ejecutar("buscar_mascotas", {"especie": "gato"}))
    assert "Luna" not in [m["nombre"] for m in gatos["mascotas"]]
    todos = json.loads(ejecutar("buscar_mascotas", {"especie": "gato", "solo_disponibles": False}))
    assert "Luna" in [m["nombre"] for m in todos["mascotas"]]
    grandes = json.loads(ejecutar("buscar_mascotas", {"tamano": "grande"}))
    assert {m["nombre"] for m in grandes["mascotas"]} == {"Rocky", "Bruno"}


def test_ver_mascota():
    ficha = json.loads(ejecutar("ver_mascota", {"nombre": "luna"}))
    assert ficha["estado_adopcion"] == "adoptado"
    assert "error" in json.loads(ejecutar("ver_mascota", {"nombre": "Firulais"}))


def test_recomendar_excluye_adoptados():
    r = json.loads(ejecutar("recomendar_mascotas", validar_entrada("recomendar_mascotas", {
        "vivienda": "departamento", "actividad": "media", "especie": "gato"})))
    nombres = [x["nombre"] for x in r["recomendaciones"]]
    assert nombres and "Luna" not in nombres
    assert all(0 <= x["compatibilidad"] <= 100 for x in r["recomendaciones"])
