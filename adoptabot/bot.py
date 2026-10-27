"""Cliente de AdoptaBot sobre la API de Claude (Anthropic), con herramientas y streaming."""

from __future__ import annotations

import json
import os
from collections.abc import Iterator
from typing import Callable

import anthropic
from anthropic import Anthropic

from .catalogo import cargar_catalogo
from .herramientas import HERRAMIENTAS, EntradaInvalida, crear_ejecutor, validar_entrada
from .prompt import construir_system_prompt

MODELO_POR_DEFECTO = "claude-opus-5-5"
# El chat no necesita razonamiento profundo: "low" responde rápido y gasta menos tokens.
ESFUERZO_POR_DEFECTO = "low"
MAX_PASOS = 6  # vueltas máximas de herramientas por mensaje, para no entrar en bucles
# Si un filtro de seguridad rechaza la consulta por error, la API la reintenta en el modelo recomendado.
BETA_RESPALDO = "server-side-fallback-2026-07-01"

NOMBRES_HERRAMIENTAS = {
    "buscar_mascotas": "🔎 Buscando en el catálogo…",
    "ver_mascota": "📄 Revisando la ficha…",
    "recomendar_mascotas": "💞 Calculando compatibilidad…",
}


class ErrorAdoptaBot(Exception):
    """Error con un mensaje listo para mostrar al usuario."""


def mensaje_de_error(error: Exception) -> str:
    """Traduce los errores de la API a mensajes claros en español."""
    if isinstance(error, anthropic.AuthenticationError):
        return ("🔑 La clave de API no es válida. Revisa `ANTHROPIC_API_KEY` en tu archivo `.env` "
                "o en los *Secrets* de Streamlit Cloud (debe empezar con `sk-ant-`).")
    if isinstance(error, anthropic.PermissionDeniedError):
        return "🔒 Tu clave de API no tiene permiso para usar este modelo."
    if isinstance(error, anthropic.NotFoundError):
        return "🤖 El modelo configurado no existe o no está disponible para tu cuenta. Revisa `ADOPTABOT_MODEL`."
    if isinstance(error, anthropic.RateLimitError):
        return "⏳ Hay demasiadas consultas en este momento. Espera unos segundos e inténtalo otra vez."
    if isinstance(error, anthropic.BadRequestError) and "credit" in str(error).lower():
        return "💳 Tu cuenta de Anthropic no tiene saldo. Recárgalo en console.anthropic.com → Billing."
    if isinstance(error, anthropic.APIConnectionError):
        return "📡 No hay conexión con el servicio de IA. Revisa tu internet e inténtalo de nuevo."
    if isinstance(error, anthropic.APIStatusError) and error.status_code >= 500:
        return "🛠️ El servicio de IA tiene un problema temporal. Inténtalo en un momento."
    if isinstance(error, ErrorAdoptaBot):
        return str(error)
    return f"Ocurrió un error inesperado: {error}"


class AdoptaBot:
    """Mantiene la conversación y habla con Claude usando las herramientas del catálogo."""

    def __init__(
        self,
        api_key: str | None = None,
        modelo: str | None = None,
        catalogo: list[dict] | None = None,
        estado_de: Callable[[int], str] | None = None,
        client: Anthropic | None = None,
    ):
        self.client = client or Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))
        self.modelo = modelo or os.getenv("ADOPTABOT_MODEL") or MODELO_POR_DEFECTO
        self.esfuerzo = os.getenv("ADOPTABOT_EFFORT") or ESFUERZO_POR_DEFECTO
        self.catalogo = catalogo if catalogo is not None else cargar_catalogo()
        self.system_prompt = construir_system_prompt(self.catalogo)
        self._ejecutar = crear_ejecutor(self.catalogo, estado_de or (lambda _id: "disponible"))
        # Historial tal como lo recibe la API. Solo se agregan mensajes al final (nunca se editan),
        # para que el caché del prompt y los bloques de razonamiento sigan siendo válidos.
        self.historial: list[dict] = []

    # ---------- Conversación ----------
    def conversar(self, mensaje: str) -> Iterator[tuple[str, str]]:
        """Envía un mensaje y produce eventos ("texto", fragmento) o ("herramienta", descripción)."""
        inicio = len(self.historial)
        self.historial.append({"role": "user", "content": mensaje})
        try:
            yield from self._bucle()
        except BaseException:
            # Si algo falla, se descarta este turno incompleto para poder reintentar limpio.
            del self.historial[inicio:]
            raise

    def _bucle(self) -> Iterator[tuple[str, str]]:
        reintentos_json = 0
        pasos = 0
        while pasos < MAX_PASOS:
            try:
                respuesta = yield from self._transmitir()
            except ValueError:
                # La SDK no pudo leer el JSON de una herramienta: se repite el turno (máx. 2 veces).
                reintentos_json += 1
                if reintentos_json > 2:
                    raise ErrorAdoptaBot("No pude procesar la consulta. Intenta escribirla de otra forma.")
                continue
            reintentos_json = 0
            pasos += 1

            if respuesta.stop_reason == "refusal":
                raise ErrorAdoptaBot("🙈 No puedo ayudarte con esa consulta. Pregúntame sobre adopción y nuestras mascotas.")

            self.historial.append({"role": "assistant", "content": respuesta.content})
            if respuesta.stop_reason == "pause_turn":
                continue

            usos = [b for b in respuesta.content if b.type == "tool_use"]
            if not usos:
                return
            if respuesta.stop_reason == "max_tokens":
                raise ErrorAdoptaBot("La respuesta quedó incompleta. Intenta con una pregunta más corta.")

            resultados = []
            for uso in usos:
                yield ("herramienta", NOMBRES_HERRAMIENTAS.get(uso.name, f"Usando {uso.name}…"))
                resultados.append(self._resultado_herramienta(uso))
            # Todos los resultados van juntos en un solo mensaje.
            self.historial.append({"role": "user", "content": resultados})

        yield ("texto", "\n\n_(Me detuve para no tardar demasiado. ¿Puedes precisar un poco más tu pregunta?)_")

    def _transmitir(self) -> Iterator[tuple[str, str]]:
        """Una llamada en streaming a Claude. Produce el texto a medida que llega y devuelve el mensaje final."""
        with self.client.beta.messages.stream(
            model=self.modelo,
            max_tokens=16000,
            system=[{"type": "text", "text": self.system_prompt, "cache_control": {"type": "ephemeral"}}],
            tools=HERRAMIENTAS,
            messages=self.historial,
            output_config={"effort": self.esfuerzo},
            betas=[BETA_RESPALDO],
            fallbacks="default",
        ) as stream:
            for evento in stream:
                if evento.type == "text":
                    yield ("texto", evento.text)
            return stream.get_final_message()

    def _resultado_herramienta(self, uso) -> dict:
        try:
            contenido = self._ejecutar(uso.name, validar_entrada(uso.name, uso.input))
            return {"type": "tool_result", "tool_use_id": uso.id, "content": contenido}
        except (EntradaInvalida, TypeError, KeyError) as e:
            return {"type": "tool_result", "tool_use_id": uso.id, "is_error": True,
                    "content": json.dumps({"error": str(e)}, ensure_ascii=False)}

    # ---------- Atajos ----------
    def responder_stream(self, mensaje: str) -> Iterator[str]:
        """Solo el texto de la respuesta, por partes (útil para la terminal)."""
        for tipo, dato in self.conversar(mensaje):
            if tipo == "texto":
                yield dato

    def responder(self, mensaje: str) -> str:
        """Envía un mensaje y devuelve la respuesta completa."""
        return "".join(self.responder_stream(mensaje))

    def reiniciar(self) -> None:
        self.historial.clear()
