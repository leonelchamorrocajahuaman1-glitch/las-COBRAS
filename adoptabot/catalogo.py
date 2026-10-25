"""Catálogo de mascotas: carga, filtros y cálculo de compatibilidad.

Todo aquí es lógica pura (sin IA ni Streamlit), así que es gratis de usar y fácil de probar.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

CATALOGO_PATH = Path(__file__).resolve().parent.parent / "data" / "mascotas.json"

EMOJI_ESPECIE = {"perro": "🐶", "gato": "🐱"}
NIVELES = {"baja": 0, "media": 1, "alta": 2}
ETAPAS = ("cachorro", "adulto", "senior")
TAMAÑOS = ("pequeño", "mediano", "grande")
VIVIENDAS = ("departamento", "casa", "casa_patio")


def cargar_catalogo(path: Path = CATALOGO_PATH) -> list[dict]:
    """Lee el catálogo de mascotas."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def normalizar(texto: str) -> str:
    """Minúsculas y sin tildes, para comparar nombres escritos de cualquier forma."""
    sin_tildes = unicodedata.normalize("NFD", str(texto)).encode("ascii", "ignore").decode()
    return sin_tildes.strip().lower()


def edad_en_meses(edad: str) -> int:
    """Convierte textos como '2 años', '1 año' o '4 meses' a meses."""
    m = re.search(r"(\d+)\s*(año|mes)", normalizar(edad).replace("ano", "año"))
    if not m:
        return 0
    n = int(m.group(1))
    return n * 12 if m.group(2) == "año" else n


def etapa(mascota: dict) -> str:
    meses = edad_en_meses(mascota["edad"])
    if meses < 12:
        return "cachorro"
    return "senior" if meses >= 84 else "adulto"


def tamaño_base(mascota: dict) -> str:
    """'grande (de adulto)' -> 'grande'."""
    return normalizar(mascota["tamaño"]).split()[0].replace("pequeno", "pequeño")


def buscar_por_nombre(catalogo: list[dict], nombre: str) -> dict | None:
    objetivo = normalizar(nombre)
    return next((m for m in catalogo if normalizar(m["nombre"]) == objetivo), None)


def filtrar(
    catalogo: list[dict],
    especie: str | None = None,
    tamaño: str | None = None,
    energia: str | None = None,
    etapa_vida: str | None = None,
    apto_ninos: bool | None = None,
    apto_departamento: bool | None = None,
) -> list[dict]:
    """Devuelve las mascotas que cumplen todos los filtros indicados (None = sin filtro)."""
    resultado = []
    for m in catalogo:
        if especie and m["especie"] != especie:
            continue
        if tamaño and tamaño_base(m) != tamaño:
            continue
        if energia and m["energia"] != energia:
            continue
        if etapa_vida and etapa(m) != etapa_vida:
            continue
        if apto_ninos is not None and bool(m.get("apto_ninos")) != apto_ninos:
            continue
        if apto_departamento is not None and bool(m.get("apto_departamento")) != apto_departamento:
            continue
        resultado.append(m)
    return resultado


@dataclass
class Perfil:
    """Estilo de vida de quien quiere adoptar."""

    vivienda: str = "departamento"  # departamento | casa | casa_patio
    actividad: str = "media"  # baja | media | alta
    horas_fuera: int = 8  # horas al día que la mascota pasaría sola
    ninos: bool = False
    otros_perros: bool = False
    otros_gatos: bool = False
    experiencia: bool = False
    especie: str = "cualquiera"  # perro | gato | cualquiera


@dataclass
class Resultado:
    mascota: dict
    puntaje: int
    razones: list[str] = field(default_factory=list)
    alertas: list[str] = field(default_factory=list)


def compatibilidad(mascota: dict, perfil: Perfil) -> Resultado:
    """Puntaje de 0 a 100 de qué tan bien encaja una mascota con un perfil, con sus motivos."""
    puntaje = 100
    razones: list[str] = []
    alertas: list[str] = []
    es_perro = mascota["especie"] == "perro"
    tam = tamaño_base(mascota)
    energia = NIVELES.get(mascota["energia"], 1)
    actividad = NIVELES.get(perfil.actividad, 1)

    if perfil.especie in EMOJI_ESPECIE and mascota["especie"] != perfil.especie:
        return Resultado(mascota, 0, [], [f"Buscas un {perfil.especie}"])

    # Espacio
    if perfil.vivienda == "departamento":
        if mascota.get("apto_departamento"):
            razones.append("Se adapta bien a vivir en departamento")
        else:
            puntaje -= 35 if tam == "grande" else 20
            alertas.append("Necesita más espacio que un departamento")
    elif perfil.vivienda == "casa_patio" and es_perro and energia >= 1:
        razones.append("Tendrá un patio para correr y jugar")

    # Energía vs. estilo de vida
    diferencia = abs(energia - actividad)
    if diferencia == 0:
        razones.append(f"Su energía ({mascota['energia']}) coincide con tu ritmo de vida")
    else:
        puntaje -= 15 * diferencia
        if energia > actividad:
            alertas.append("Tiene más energía de la que tu rutina le permitiría gastar")
        else:
            alertas.append("Es más tranquilo que tu ritmo: quizá no te acompañe en todo")

    # Tiempo a solas
    if es_perro and perfil.horas_fuera >= 8:
        puntaje -= 20 if energia == 2 else 10
        alertas.append(f"Pasaría {perfil.horas_fuera} h solo: los perros necesitan compañía y paseos")
    if etapa(mascota) == "cachorro" and perfil.horas_fuera >= 6:
        puntaje -= 15
        alertas.append("Es cachorro: necesita mucha atención y educación diaria")
    if not es_perro and perfil.horas_fuera >= 8:
        razones.append("Los gatos toleran mejor quedarse solos durante la jornada")

    # Convivencia
    if perfil.ninos:
        if mascota.get("apto_ninos"):
            razones.append("Convive bien con niños")
        else:
            puntaje -= 30
            alertas.append("No es ideal para un hogar con niños")
    if perfil.otros_perros:
        if mascota.get("convive_perros"):
            razones.append("Se lleva bien con otros perros")
        else:
            puntaje -= 30
            alertas.append("No convive bien con perros")
    if perfil.otros_gatos:
        if mascota.get("convive_gatos"):
            razones.append("Se lleva bien con otros gatos")
        else:
            puntaje -= 30
            alertas.append("No convive bien con gatos")

    # Experiencia
    if mascota.get("requiere_experiencia") and not perfil.experiencia:
        puntaje -= 20
        alertas.append("Conviene que lo adopte alguien con experiencia")
    elif not mascota.get("requiere_experiencia") and not perfil.experiencia:
        razones.append("Es ideal para quien adopta por primera vez")

    # Información médica (no resta puntos, solo informa)
    if "completa" not in normalizar(mascota.get("vacunas", "")):
        alertas.append(f"Vacunas: {mascota['vacunas']}")

    return Resultado(mascota, max(0, min(100, puntaje)), razones, alertas)


def recomendar(catalogo: list[dict], perfil: Perfil, n: int = 3, excluir_ids: set | None = None) -> list[Resultado]:
    """Las `n` mascotas más compatibles con el perfil, de mayor a menor puntaje."""
    excluir_ids = excluir_ids or set()
    resultados = [compatibilidad(m, perfil) for m in catalogo if m["id"] not in excluir_ids]
    resultados = [r for r in resultados if r.puntaje > 0]
    resultados.sort(key=lambda r: (-r.puntaje, r.mascota["nombre"]))
    return resultados[:n]
