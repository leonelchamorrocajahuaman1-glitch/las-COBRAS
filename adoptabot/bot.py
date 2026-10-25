"""Cliente de AdoptaBot sobre la API de Claude (Anthropic)."""

import os
from collections.abc import Iterator

from anthropic import Anthropic

from .prompt import construir_system_prompt

MODELO_POR_DEFECTO = "claude-sonnet-5-5"


class AdoptaBot:
    """Mantiene el historial de la conversación y habla con Claude."""

    def __init__(self, api_key: str | None = None, modelo: str | None = None):
        self.client = Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))
        self.modelo = modelo or os.getenv("ADOPTABOT_MODEL", MODELO_POR_DEFECTO)
        self.system_prompt = construir_system_prompt()
        self.historial: list[dict] = []

    def responder(self, mensaje: str) -> str:
        """Envía un mensaje y devuelve la respuesta completa."""
        return "".join(self.responder_stream(mensaje))

    def responder_stream(self, mensaje: str) -> Iterator[str]:
        """Envía un mensaje y va devolviendo la respuesta por partes."""
        self.historial.append({"role": "user", "content": mensaje})
        partes: list[str] = []
        try:
            with self.client.messages.stream(
                model=self.modelo,
                max_tokens=1024,
                system=self.system_prompt,
                messages=self.historial,
            ) as stream:
                for texto in stream.text_stream:
                    partes.append(texto)
                    yield texto
        except Exception:
            self.historial.pop()  # no dejar un turno de usuario sin respuesta
            raise
        self.historial.append({"role": "assistant", "content": "".join(partes)})

    def reiniciar(self) -> None:
        self.historial.clear()
