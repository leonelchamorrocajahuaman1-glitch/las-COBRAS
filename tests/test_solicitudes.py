import pytest

from adoptabot.catalogo import buscar_por_nombre, cargar_catalogo
from adoptabot.solicitudes import Repositorio, SolicitudInvalida

CAT = cargar_catalogo()
CANELA = buscar_por_nombre(CAT, "Canela")
DATOS = {
    "nombre": "Ana Quispe", "documento": "70123456", "telefono": "987 654 321", "email": "ana@correo.pe",
    "distrito": "Miraflores", "vivienda": "Casa con patio",
    "motivo": "Tenemos patio, trabajo desde casa y mis hijos aman los perros.", "acepta_compromiso": True,
}


@pytest.fixture
def repo(tmp_path):
    return Repositorio(tmp_path / "test.db")


@pytest.mark.parametrize("campo, valor, mensaje", [
    ("nombre", "Ana", "nombre y apellido"),
    ("documento", "123", "DNI"),
    ("telefono", "12345", "celular"),
    ("email", "no-es-correo", "correo"),
    ("motivo", "porque sí", "detalle"),
    ("acepta_compromiso", False, "compromiso"),
])
def test_validaciones(repo, campo, valor, mensaje):
    with pytest.raises(SolicitudInvalida, match=f"(?i){mensaje}"):
        repo.crear_solicitud(CANELA, {**DATOS, campo: valor})


def test_crear_y_consultar_con_codigo_y_documento(repo):
    codigo = repo.crear_solicitud(CANELA, DATOS)
    assert codigo.startswith("LC-")
    s = repo.consultar(codigo.lower(), "70123456")
    assert s["estado"] == "pendiente" and s["telefono"] == "987654321"
    assert repo.consultar(codigo, "99999999") is None, "sin el documento correcto no se ven los datos"


def test_no_duplica_solicitudes_activas(repo):
    repo.crear_solicitud(CANELA, DATOS)
    with pytest.raises(SolicitudInvalida, match="Ya tienes una solicitud"):
        repo.crear_solicitud(CANELA, DATOS)


def test_flujo_de_estados_actualiza_la_mascota(repo):
    codigo = repo.crear_solicitud(CANELA, DATOS)
    repo.actualizar_estado(codigo, "entrevista", "Te llamamos el lunes")
    assert repo.estado_mascota(CANELA["id"]) == "en_proceso"
    repo.actualizar_estado(codigo, "aprobada")
    assert repo.estado_mascota(CANELA["id"]) == "adoptado"
    assert repo.consultar(codigo, "70123456")["nota_refugio"] == ""
    with pytest.raises(SolicitudInvalida, match="ya fue adoptado"):
        repo.crear_solicitud(CANELA, {**DATOS, "documento": "80123456"})
    repo.actualizar_estado(codigo, "rechazada")
    assert repo.estado_mascota(CANELA["id"]) == "disponible"


def test_solo_una_aprobada_por_mascota(repo):
    a = repo.crear_solicitud(CANELA, DATOS)
    b = repo.crear_solicitud(CANELA, {**DATOS, "documento": "80123456"})
    repo.actualizar_estado(a, "aprobada")
    with pytest.raises(ValueError, match="ya tiene otra solicitud aprobada"):
        repo.actualizar_estado(b, "aprobada")


def test_estadisticas(repo):
    a = repo.crear_solicitud(CANELA, DATOS)
    repo.crear_solicitud(buscar_por_nombre(CAT, "Luna"), DATOS)
    repo.actualizar_estado(a, "aprobada")
    st = repo.estadisticas()
    assert st["solicitudes"] == 2 and st["por_estado"]["aprobada"] == 1 and st["adoptadas"] == 1
