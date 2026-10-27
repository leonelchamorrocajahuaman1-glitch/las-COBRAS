"""Herramientas que Claude puede usar durante la conversación (tool use).

Gracias a ellas AdoptaBot consulta el catálogo real y el estado actual de cada mascota
(disponible, en proceso o adoptada) en lugar de depender de datos fijos en el prompt.
"""

from __future__ import annotations

import json
from typing import Callable

from .catalogo import ETAPAS, TAMAÑOS, VIVIENDAS, Perfil, buscar_por_nombre, etapa, filtrar, recomendar, tamaño_base

_NIVEL = {"type": "string", "enum": ["baja", "media", "alta"]}

HERRAMIENTAS = [
    {
        "name": "buscar_mascotas",
        "description": (
            "Busca mascotas del refugio Las Cobras por características. Todos los filtros son opcionales; "
            "sin filtros devuelve el catálogo completo. Úsala siempre antes de mencionar qué mascotas hay."
        ),
        "eager_input_streaming": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "especie": {"type": "string", "enum": ["perro", "gato"]},
                "tamano": {"type": "string", "enum": list(TAMAÑOS)},
                "energia": _NIVEL,
                "etapa": {"type": "string", "enum": list(ETAPAS), "description": "cachorro (<1 año), adulto o senior (7+ años)"},
                "apto_ninos": {"type": "boolean"},
                "apto_departamento": {"type": "boolean"},
                "solo_disponibles": {"type": "boolean", "description": "Por defecto true: oculta las ya adoptadas"},
            },
            "additionalProperties": False,
        },
    },
    {
        "name": "ver_mascota",
        "description": "Devuelve la ficha completa de una mascota (historia, vacunas, convivencia y estado de adopción).",
        "eager_input_streaming": True,
        "input_schema": {
            "type": "object",
            "properties": {"nombre": {"type": "string", "description": "Nombre de la mascota, p. ej. 'Canela'"}},
            "required": ["nombre"],
            "additionalProperties": False,
        },
    },
    {
        "name": "recomendar_mascotas",
        "description": (
            "Calcula la compatibilidad (0-100) entre el estilo de vida del usuario y las mascotas disponibles, "
            "con los motivos y alertas de cada una. Úsala cuando ya conozcas al menos la vivienda y el nivel de actividad."
        ),
        "eager_input_streaming": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "vivienda": {"type": "string", "enum": list(VIVIENDAS)},
                "actividad": _NIVEL,
                "horas_fuera": {"type": "integer", "minimum": 0, "maximum": 24,
                                "description": "Horas al día que la mascota pasaría sola"},
                "ninos": {"type": "boolean"},
                "otros_perros": {"type": "boolean"},
                "otros_gatos": {"type": "boolean"},
                "experiencia": {"type": "boolean", "description": "¿Ha tenido mascotas antes?"},
                "especie": {"type": "string", "enum": ["perro", "gato", "cualquiera"]},
            },
            "required": ["vivienda", "actividad"],
            "additionalProperties": False,
        },
    },
]

_ESQUEMAS = {h["name"]: h["input_schema"] for h in HERRAMIENTAS}
_TIPOS = {"string": str, "boolean": bool, "integer": int}


class EntradaInvalida(ValueError):
    pass


def validar_entrada(nombre: str, args: object) -> dict:
    """Comprueba los argumentos contra el esquema (con streaming de entradas el servidor no los valida)."""
    esquema = _ESQUEMAS.get(nombre)
    if esquema is None:
        raise EntradaInvalida(f"Herramienta desconocida: {nombre}")
    if not isinstance(args, dict):
        raise EntradaInvalida("Los argumentos deben ser un objeto JSON")
    props = esquema["properties"]
    for clave in esquema.get("required", []):
        if clave not in args:
            raise EntradaInvalida(f"Falta el argumento obligatorio '{clave}'")
    for clave, valor in args.items():
        if clave not in props:
            raise EntradaInvalida(f"Argumento no permitido: '{clave}'")
        definicion = props[clave]
        tipo = _TIPOS[definicion["type"]]
        # bool es subclase de int en Python: no aceptar true/false como número
        if not isinstance(valor, tipo) or (tipo is int and isinstance(valor, bool)):
            raise EntradaInvalida(f"'{clave}' debe ser de tipo {definicion['type']}")
        if "enum" in definicion and valor not in definicion["enum"]:
            raise EntradaInvalida(f"'{clave}' debe ser uno de {definicion['enum']}")
        if tipo is int and not definicion.get("minimum", valor) <= valor <= definicion.get("maximum", valor):
            raise EntradaInvalida(f"'{clave}' está fuera de rango")
    return args


def _resumen(m: dict, estado: str) -> dict:
    return {
        "nombre": m["nombre"], "especie": m["especie"], "sexo": m.get("sexo"), "edad": m["edad"],
        "etapa": etapa(m), "tamaño": tamaño_base(m), "energia": m["energia"], "estado_adopcion": estado,
    }


def crear_ejecutor(catalogo: list[dict], estado_de: Callable[[int], str]) -> Callable[[str, dict], str]:
    """Devuelve una función que ejecuta una herramienta y responde con JSON (texto) para Claude."""

    def ejecutar(nombre: str, args: dict) -> str:
        if nombre == "buscar_mascotas":
            args = dict(args)
            solo_disponibles = args.pop("solo_disponibles", True)
            if "etapa" in args:
                args["etapa_vida"] = args.pop("etapa")
            if "tamano" in args:
                args["tamaño"] = args.pop("tamano")
            encontradas = [(m, estado_de(m["id"])) for m in filtrar(catalogo, **args)]
            if solo_disponibles:
                encontradas = [(m, e) for m, e in encontradas if e != "adoptado"]
            return json.dumps({"total": len(encontradas), "mascotas": [_resumen(m, e) for m, e in encontradas]},
                              ensure_ascii=False)

        if nombre == "ver_mascota":
            m = buscar_por_nombre(catalogo, args["nombre"])
            if not m:
                nombres = ", ".join(x["nombre"] for x in catalogo)
                return json.dumps({"error": f"No hay ninguna mascota llamada '{args['nombre']}'. Existen: {nombres}"},
                                  ensure_ascii=False)
            return json.dumps({**m, "etapa": etapa(m), "estado_adopcion": estado_de(m["id"])}, ensure_ascii=False)

        if nombre == "recomendar_mascotas":
            perfil = Perfil(**args)
            adoptadas = {m["id"] for m in catalogo if estado_de(m["id"]) == "adoptado"}
            resultados = recomendar(catalogo, perfil, n=3, excluir_ids=adoptadas)
            return json.dumps({"recomendaciones": [
                {"nombre": r.mascota["nombre"], "especie": r.mascota["especie"], "compatibilidad": r.puntaje,
                 "motivos": r.razones, "alertas": r.alertas} for r in resultados
            ]}, ensure_ascii=False)

        raise EntradaInvalida(f"Herramienta desconocida: {nombre}")

    return ejecutar
