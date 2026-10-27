"""Prueba el ciclo de herramientas de AdoptaBot con un cliente falso (no usa la API ni gasta saldo)."""

from types import SimpleNamespace

import anthropic
import pytest

try:  # SDK 2.x usa httpx2; las versiones 0.x usan httpx
    import httpx2 as httpx
except ImportError:
    import httpx

from adoptabot.bot import AdoptaBot, ErrorAdoptaBot, mensaje_de_error


def texto(t):
    return SimpleNamespace(type="text", text=t)


def herramienta(id_, nombre, entrada):
    return SimpleNamespace(type="tool_use", id=id_, name=nombre, input=entrada)


class StreamFalso:
    def __init__(self, respuesta):
        self.respuesta = respuesta

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def __iter__(self):
        for bloque in self.respuesta.content:
            if bloque.type == "text":
                yield SimpleNamespace(type="text", text=bloque.text)

    def get_final_message(self):
        return self.respuesta


class ClienteFalso:
    def __init__(self, respuestas):
        self.respuestas = list(respuestas)
        self.llamadas = []
        self.beta = SimpleNamespace(messages=SimpleNamespace(stream=self._stream))

    def _stream(self, **kwargs):
        # Copia del historial en el momento de la llamada (luego la lista sigue creciendo)
        self.llamadas.append({**kwargs, "messages": list(kwargs["messages"])})
        siguiente = self.respuestas.pop(0)
        if isinstance(siguiente, Exception):
            raise siguiente
        return StreamFalso(siguiente)


def respuesta(stop, *bloques):
    return SimpleNamespace(stop_reason=stop, content=list(bloques))


def crear_bot(respuestas, **kw):
    cliente = ClienteFalso(respuestas)
    return AdoptaBot(client=cliente, **kw), cliente


def test_respuesta_simple_y_parametros_de_la_api():
    bot, cliente = crear_bot([respuesta("end_turn", texto("¡Hola! "), texto("¿Perro o gato?"))])
    eventos = list(bot.conversar("hola"))
    assert eventos == [("texto", "¡Hola! "), ("texto", "¿Perro o gato?")]
    llamada = cliente.llamadas[0]
    assert llamada["model"] == "claude-opus-5-5"
    assert llamada["fallbacks"] == "default" and "server-side-fallback-2026-07-01" in llamada["betas"]
    assert llamada["output_config"] == {"effort": "low"}
    assert {h["name"] for h in llamada["tools"]} == {"buscar_mascotas", "ver_mascota", "recomendar_mascotas"}
    assert [m["role"] for m in bot.historial] == ["user", "assistant"]


def test_ciclo_de_herramientas():
    bot, cliente = crear_bot([
        respuesta("tool_use", herramienta("t1", "buscar_mascotas", {"especie": "gato"}),
                  herramienta("t2", "ver_mascota", {"nombre": "Nadie"})),
        respuesta("end_turn", texto("Tenemos a Luna, Mostaza y Simba 🐱")),
    ])
    eventos = list(bot.conversar("¿qué gatos hay?"))
    assert ("herramienta", "🔎 Buscando en el catálogo…") in eventos
    assert eventos[-1] == ("texto", "Tenemos a Luna, Mostaza y Simba 🐱")
    # Los dos resultados viajan juntos en un único mensaje de usuario
    resultados = cliente.llamadas[1]["messages"][-1]["content"]
    assert [r["tool_use_id"] for r in resultados] == ["t1", "t2"]
    assert "Luna" in resultados[0]["content"]
    assert "No hay ninguna mascota" in resultados[1]["content"]
    assert [m["role"] for m in bot.historial] == ["user", "assistant", "user", "assistant"]


def test_entrada_invalida_vuelve_como_error_de_herramienta():
    bot, cliente = crear_bot([
        respuesta("tool_use", herramienta("t1", "buscar_mascotas", {"especie": "dragón"})),
        respuesta("end_turn", texto("Solo tenemos perros y gatos.")),
    ])
    list(bot.conversar("¿tienen dragones?"))
    resultado = cliente.llamadas[1]["messages"][-1]["content"][0]
    assert resultado["is_error"] is True


def test_rechazo_y_errores_no_dejan_basura_en_el_historial():
    bot, _ = crear_bot([respuesta("refusal")])
    with pytest.raises(ErrorAdoptaBot):
        list(bot.conversar("algo indebido"))
    assert bot.historial == []

    peticion = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
    error = anthropic.AuthenticationError("invalid x-api-key", response=httpx.Response(401, request=peticion), body=None)
    bot, _ = crear_bot([respuesta("end_turn", texto("ok")), error])
    list(bot.conversar("primero"))
    with pytest.raises(anthropic.AuthenticationError):
        list(bot.conversar("segundo"))
    assert len(bot.historial) == 2, "el turno fallido se descarta y se puede reintentar"
    assert "clave de API no es válida" in mensaje_de_error(error)


def test_reintenta_json_ilegible_y_limita_pasos():
    bot, cliente = crear_bot([ValueError("json roto"), respuesta("end_turn", texto("listo"))])
    assert list(bot.responder_stream("hola")) == ["listo"]
    assert len(cliente.llamadas) == 2

    infinito = [respuesta("tool_use", herramienta(f"t{i}", "buscar_mascotas", {})) for i in range(10)]
    bot, cliente = crear_bot(infinito)
    eventos = list(bot.conversar("bucle"))
    assert len(cliente.llamadas) == 6 and "Me detuve" in eventos[-1][1]
