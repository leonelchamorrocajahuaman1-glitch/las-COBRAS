"""Módulo de cálculo de presupuesto y costos de tenencia responsable."""

from __future__ import annotations

# Costos base mensuales estimados (en soles S/. o unidad monetaria local)
COSTO_ALIMENTO_MENSUAL = {
    ("perro", "pequeño"): {"económica": 45, "estándar": 80, "premium": 130},
    ("perro", "mediano"): {"económica": 80, "estándar": 140, "premium": 220},
    ("perro", "grande"): {"económica": 120, "estándar": 210, "premium": 330},
    ("gato", "pequeño"): {"económica": 40, "estándar": 70, "premium": 110},
    ("gato", "mediano"): {"económica": 45, "estándar": 80, "premium": 125},
    ("gato", "grande"): {"económica": 55, "estándar": 95, "premium": 145},
}

COSTO_SALUD_ANUAL = {
    "perro": {
        "vacunas_anuales": 90,  # Sextuple + Rabia
        "desparasitacion": 60,  # Interna y externa cada 3 meses
        "chequeo_preventivo": 70,  # Consulta veterinaria anual
    },
    "gato": {
        "vacunas_anuales": 80,  # Triple felina + Rabia
        "desparasitacion": 50,  # Interna y externa
        "chequeo_preventivo": 70,  # Consulta veterinaria anual
    },
}

COSTO_HIGIENE_ACCESORIOS_MENSUAL = {
    "perro": 35,  # Champú, bolsas sanitarias, desgaste de correas/juguetes
    "gato": 40,   # Arena sanitaria, pala, juguetes rascadores
}


def calcular_presupuesto(
    especie: str,
    tamaño: str,
    calidad_alimento: str = "estándar",
    incluye_fondo_emergencia: bool = True,
    monto_emergencia_mensual: float = 30.0,
) -> dict:
    """Calcula el costo estimado mensual y anual de mantener a una mascota.

    Retorna un diccionario con totales y el desglose de cada rubro.
    """
    especie_norm = especie.strip().lower()
    tamaño_norm = tamaño.strip().lower()
    calidad_norm = calidad_alimento.strip().lower()

    if especie_norm not in ("perro", "gato"):
        especie_norm = "perro"
    if tamaño_norm not in ("pequeño", "mediano", "grande"):
        tamaño_norm = "mediano"
    if calidad_norm not in ("económica", "estándar", "premium"):
        calidad_norm = "estándar"

    alimento_mes = COSTO_ALIMENTO_MENSUAL.get(
        (especie_norm, tamaño_norm), {}
    ).get(calidad_norm, 80)

    higiene_mes = COSTO_HIGIENE_ACCESORIOS_MENSUAL.get(especie_norm, 35)

    salud_anual_dict = COSTO_SALUD_ANUAL.get(especie_norm, COSTO_SALUD_ANUAL["perro"])
    salud_anual_total = sum(salud_anual_dict.values())
    salud_mes = round(salud_anual_total / 12, 2)

    emergencia_mes = float(monto_emergencia_mensual) if incluye_fondo_emergencia else 0.0

    total_mensual = round(alimento_mes + higiene_mes + salud_mes + emergencia_mes, 2)
    total_anual = round(total_mensual * 12, 2)

    return {
        "especie": especie_norm,
        "tamaño": tamaño_norm,
        "calidad_alimento": calidad_norm,
        "total_mensual": total_mensual,
        "total_anual": total_anual,
        "desglose_mensual": {
            "Alimentación": alimento_mes,
            "Higiene y arena/accesorios": higiene_mes,
            "Salud preventiva (prorrateada)": salud_mes,
            "Fondo de imprevistos/emergencias": emergencia_mes,
        },
        "desglose_salud_anual": salud_anual_dict,
    }
