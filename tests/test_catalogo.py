from adoptabot.catalogo import (Perfil, buscar_por_nombre, cargar_catalogo, compatibilidad, edad_en_meses,
                                etapa, filtrar, recomendar, tamaño_base)

CAT = cargar_catalogo()


def mascota(nombre):
    return buscar_por_nombre(CAT, nombre)


def test_edades_y_etapas():
    assert edad_en_meses("2 años") == 24
    assert edad_en_meses("1 año") == 12
    assert edad_en_meses("4 meses") == 4
    assert etapa(mascota("Rocky")) == "cachorro"
    assert etapa(mascota("Tomás")) == "senior"
    assert etapa(mascota("Canela")) == "adulto"


def test_tamaño_y_nombres_sin_tildes():
    assert tamaño_base(mascota("Rocky")) == "grande"
    assert tamaño_base(mascota("Tomás")) == "pequeño"
    assert buscar_por_nombre(CAT, "tomas")["nombre"] == "Tomás"
    assert buscar_por_nombre(CAT, "Firulais") is None


def test_filtros():
    gatos = filtrar(CAT, especie="gato")
    assert gatos and all(m["especie"] == "gato" for m in gatos)
    depa_ninos = filtrar(CAT, apto_departamento=True, apto_ninos=True)
    assert {m["nombre"] for m in depa_ninos} >= {"Tomás", "Nala"}
    assert all(tamaño_base(m) == "grande" for m in filtrar(CAT, tamaño="grande"))
    assert filtrar(CAT, etapa_vida="cachorro", especie="gato") == []


def test_departamento_penaliza_perros_grandes():
    perfil = Perfil(vivienda="departamento", actividad="media", horas_fuera=4)
    assert compatibilidad(mascota("Bruno"), perfil).puntaje < compatibilidad(mascota("Nala"), perfil).puntaje


def test_ninos_excluyen_a_mostaza_del_podio():
    perfil = Perfil(vivienda="departamento", actividad="baja", ninos=True, horas_fuera=8)
    r = compatibilidad(mascota("Mostaza"), perfil)
    assert "No es ideal para un hogar con niños" in r.alertas
    assert "Mostaza" not in [x.mascota["nombre"] for x in recomendar(CAT, perfil, n=2)]


def test_preferencia_de_especie_y_orden():
    perfil = Perfil(vivienda="casa_patio", actividad="alta", horas_fuera=2, especie="perro", experiencia=True)
    resultados = recomendar(CAT, perfil, n=5)
    assert all(r.mascota["especie"] == "perro" for r in resultados)
    puntajes = [r.puntaje for r in resultados]
    assert puntajes == sorted(puntajes, reverse=True)
    assert resultados[0].mascota["nombre"] in {"Canela", "Rocky"}


def test_puntaje_en_rango_y_excluir():
    peor = Perfil(vivienda="departamento", actividad="baja", horas_fuera=12, ninos=True,
                  otros_perros=True, otros_gatos=True)
    for m in CAT:
        assert 0 <= compatibilidad(m, peor).puntaje <= 100
    sin_luna = recomendar(CAT, Perfil(especie="gato"), n=10, excluir_ids={mascota("Luna")["id"]})
    assert "Luna" not in [r.mascota["nombre"] for r in sin_luna]
