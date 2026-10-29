"""Solicitudes de adopción y estado de cada mascota, guardados en SQLite."""

from __future__ import annotations

import re
import secrets
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "adoptabot.db"

ESTADOS_SOLICITUD = ("pendiente", "entrevista", "aprobada", "rechazada")
ESTADOS_MASCOTA = ("disponible", "en_proceso", "adoptado")
ETIQUETAS_SOLICITUD = {
    "pendiente": "🕒 Pendiente de revisión",
    "entrevista": "📞 Entrevista programada",
    "aprobada": "✅ Aprobada",
    "rechazada": "❌ No aprobada",
}
ETIQUETAS_MASCOTA = {"disponible": "Disponible", "en_proceso": "En proceso de adopción", "adoptado": "Adoptado ❤️"}

# Límites razonables para los datos que se guardan y luego se muestran en la app.
# Evitan que una única petición consuma espacio o memoria de forma desproporcionada.
_MAX_LONGITUD = {"nombre": 100, "email": 254, "distrito": 100, "motivo": 2_000, "nota_refugio": 2_000}
_CODIGO_RE = re.compile(r"LC-[A-F0-9]{6}")
_DOCUMENTO_RE = re.compile(r"[A-Z0-9]{8,12}")

_ESQUEMA = """
CREATE TABLE IF NOT EXISTS solicitudes (
    id INTEGER PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    mascota_id INTEGER NOT NULL,
    mascota_nombre TEXT NOT NULL,
    nombre TEXT NOT NULL,
    documento TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    distrito TEXT NOT NULL,
    vivienda TEXT NOT NULL,
    motivo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'entrevista', 'aprobada', 'rechazada')),
    nota_refugio TEXT NOT NULL DEFAULT '',
    creada_en TEXT NOT NULL,
    actualizada_en TEXT NOT NULL
);
-- Una persona no puede tener dos solicitudes activas para la misma mascota.
CREATE UNIQUE INDEX IF NOT EXISTS ux_solicitud_activa
    ON solicitudes (mascota_id, documento) WHERE estado IN ('pendiente', 'entrevista');

CREATE TABLE IF NOT EXISTS estado_mascotas (
    mascota_id INTEGER PRIMARY KEY,
    estado TEXT NOT NULL CHECK (estado IN ('disponible', 'en_proceso', 'adoptado'))
);
"""


class SolicitudInvalida(ValueError):
    """Datos del formulario que no pasan la validación (el mensaje se muestra al usuario)."""


def _ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def validar(datos: dict) -> dict:
    """Limpia y valida los datos del formulario. Lanza SolicitudInvalida con un mensaje claro."""
    limpio = {k: str(datos.get(k, "") or "").strip() for k in
              ("nombre", "documento", "telefono", "email", "distrito", "vivienda", "motivo")}
    limpio["nombre"] = re.sub(r"\s+", " ", limpio["nombre"])
    limpio["documento"] = limpio["documento"].upper()
    limpio["telefono"] = re.sub(r"[\s-]", "", limpio["telefono"])

    for campo, limite in _MAX_LONGITUD.items():
        if campo in limpio and len(limpio[campo]) > limite:
            raise SolicitudInvalida(f"{campo.capitalize()} no puede superar {limite} caracteres.")

    if len(limpio["nombre"]) < 5 or " " not in limpio["nombre"]:
        raise SolicitudInvalida("Escribe tu nombre y apellido.")
    if not _DOCUMENTO_RE.fullmatch(limpio["documento"]):
        raise SolicitudInvalida("El DNI o carné de extranjería debe tener de 8 a 12 letras o números.")
    if not re.fullmatch(r"(\+?51)?9\d{8}", limpio["telefono"]):
        raise SolicitudInvalida("El celular debe tener 9 dígitos y empezar con 9 (ej. 987654321).")
    if limpio["email"] and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", limpio["email"]):
        raise SolicitudInvalida("El correo electrónico no es válido.")
    if len(limpio["distrito"]) < 3:
        raise SolicitudInvalida("Indica tu distrito o ciudad.")
    if not limpio["vivienda"]:
        raise SolicitudInvalida("Indica el tipo de vivienda.")
    if len(limpio["motivo"]) < 30:
        raise SolicitudInvalida("Cuéntanos con un poco más de detalle por qué quieres adoptar (mínimo 30 caracteres).")
    if not datos.get("acepta_compromiso"):
        raise SolicitudInvalida("Debes aceptar el compromiso de tenencia responsable.")
    return limpio


class Repositorio:
    """Acceso a la base de datos. Seguro para usar desde varios hilos (Streamlit atiende a cada usuario en uno)."""

    def __init__(self, ruta: Path | str = DB_PATH):
        if str(ruta) != ":memory:":
            Path(ruta).parent.mkdir(parents=True, exist_ok=True)
        self._con = sqlite3.connect(str(ruta), check_same_thread=False)
        self._con.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        with self._lock:
            self._con.executescript(_ESQUEMA)

    # ---------- Estado de las mascotas ----------
    def estado_mascota(self, mascota_id: int) -> str:
        fila = self._con.execute("SELECT estado FROM estado_mascotas WHERE mascota_id = ?", (mascota_id,)).fetchone()
        return fila["estado"] if fila else "disponible"

    def estados_mascotas(self) -> dict[int, str]:
        return {f["mascota_id"]: f["estado"] for f in self._con.execute("SELECT * FROM estado_mascotas")}

    def _fijar_estado_mascota(self, mascota_id: int, estado: str) -> None:
        self._con.execute(
            "INSERT INTO estado_mascotas (mascota_id, estado) VALUES (?, ?) "
            "ON CONFLICT (mascota_id) DO UPDATE SET estado = excluded.estado",
            (mascota_id, estado),
        )

    def fijar_estado_mascota(self, mascota_id: int, estado: str) -> None:
        if estado not in ESTADOS_MASCOTA:
            raise ValueError(f"Estado de mascota inválido: {estado}")
        with self._lock, self._con:
            self._fijar_estado_mascota(mascota_id, estado)

    # ---------- Solicitudes ----------
    def crear_solicitud(self, mascota: dict, datos: dict) -> str:
        """Registra una solicitud y devuelve su código de seguimiento."""
        limpio = validar(datos)
        with self._lock, self._con:
            if self.estado_mascota(mascota["id"]) == "adoptado":
                raise SolicitudInvalida(f"{mascota['nombre']} ya fue adoptado. ¡Mira las demás mascotas!")
            codigo = "LC-" + secrets.token_hex(3).upper()
            ahora = _ahora()
            try:
                self._con.execute(
                    """INSERT INTO solicitudes (codigo, mascota_id, mascota_nombre, nombre, documento, telefono,
                       email, distrito, vivienda, motivo, creada_en, actualizada_en)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (codigo, mascota["id"], mascota["nombre"], limpio["nombre"], limpio["documento"],
                     limpio["telefono"], limpio["email"], limpio["distrito"], limpio["vivienda"],
                     limpio["motivo"], ahora, ahora),
                )
            except sqlite3.IntegrityError as e:
                if "ux_solicitud_activa" in str(e) or "mascota_id, solicitudes.documento" in str(e):
                    raise SolicitudInvalida(
                        f"Ya tienes una solicitud en curso para {mascota['nombre']}. Consulta su estado con tu código."
                    ) from e
                raise
        return codigo

    def consultar(self, codigo: str, documento: str) -> dict | None:
        """Busca una solicitud; exige código y documento para no exponer datos de otras personas."""
        codigo = str(codigo or "").strip().upper()
        documento = str(documento or "").strip().upper()
        # Rechazar formatos imposibles antes de consultar evita trabajo innecesario
        # ante intentos automatizados y no revela si existe algún código.
        if not _CODIGO_RE.fullmatch(codigo) or not _DOCUMENTO_RE.fullmatch(documento):
            return None
        fila = self._con.execute(
            "SELECT * FROM solicitudes WHERE codigo = ? AND documento = ?",
            (codigo, documento),
        ).fetchone()
        return dict(fila) if fila else None

    def listar(self, estado: str | None = None) -> list[dict]:
        if estado:
            filas = self._con.execute("SELECT * FROM solicitudes WHERE estado = ? ORDER BY id DESC", (estado,))
        else:
            filas = self._con.execute("SELECT * FROM solicitudes ORDER BY id DESC")
        return [dict(f) for f in filas]

    def actualizar_estado(self, codigo: str, estado: str, nota: str = "") -> dict:
        """Cambia el estado de una solicitud y mantiene coherente el estado de la mascota."""
        if estado not in ESTADOS_SOLICITUD:
            raise ValueError(f"Estado inválido: {estado}")
        nota = str(nota or "").strip()
        if len(nota) > _MAX_LONGITUD["nota_refugio"]:
            raise ValueError(f"El mensaje para el solicitante no puede superar {_MAX_LONGITUD['nota_refugio']} caracteres.")
        with self._lock, self._con:
            fila = self._con.execute("SELECT * FROM solicitudes WHERE codigo = ?", (codigo,)).fetchone()
            if not fila:
                raise ValueError("Solicitud no encontrada")
            mascota_id = fila["mascota_id"]
            if estado == "aprobada":
                otra = self._con.execute(
                    "SELECT codigo FROM solicitudes WHERE mascota_id = ? AND estado = 'aprobada' AND codigo <> ?",
                    (mascota_id, codigo),
                ).fetchone()
                if otra:
                    raise ValueError(f"{fila['mascota_nombre']} ya tiene otra solicitud aprobada ({otra['codigo']}).")
            self._con.execute(
                "UPDATE solicitudes SET estado = ?, nota_refugio = ?, actualizada_en = ? WHERE codigo = ?",
                (estado, nota, _ahora(), codigo),
            )
            # La mascota queda adoptada si hay una aprobada; en proceso si hay alguna en entrevista.
            activas = {f["estado"] for f in self._con.execute(
                "SELECT estado FROM solicitudes WHERE mascota_id = ?", (mascota_id,))}
            if "aprobada" in activas:
                self._fijar_estado_mascota(mascota_id, "adoptado")
            elif "entrevista" in activas:
                self._fijar_estado_mascota(mascota_id, "en_proceso")
            else:
                self._fijar_estado_mascota(mascota_id, "disponible")
            return dict(self._con.execute("SELECT * FROM solicitudes WHERE codigo = ?", (codigo,)).fetchone())

    def estadisticas(self) -> dict:
        por_estado = {e: 0 for e in ESTADOS_SOLICITUD}
        for f in self._con.execute("SELECT estado, COUNT(*) AS n FROM solicitudes GROUP BY estado"):
            por_estado[f["estado"]] = f["n"]
        adoptadas = self._con.execute(
            "SELECT COUNT(*) FROM estado_mascotas WHERE estado = 'adoptado'").fetchone()[0]
        return {"solicitudes": sum(por_estado.values()), "por_estado": por_estado, "adoptadas": adoptadas}
