package com.lascobras.adoptabot.catalogo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class CatalogoServiceTest {

    private static CatalogoService catalogo;

    @BeforeAll
    static void cargar() {
        catalogo = new CatalogoService(Path.of("../data/mascotas.json"));
    }

    private Mascota mascota(String nombre) {
        return catalogo.buscarPorNombre(nombre).orElseThrow();
    }

    @Test
    void edadesYEtapas() {
        assertEquals(24, CatalogoService.edadEnMeses("2 años"));
        assertEquals(12, CatalogoService.edadEnMeses("1 año"));
        assertEquals(4, CatalogoService.edadEnMeses("4 meses"));
        assertEquals("cachorro", CatalogoService.etapa(mascota("Rocky")));
        assertEquals("senior", CatalogoService.etapa(mascota("Tomás")));
        assertEquals("adulto", CatalogoService.etapa(mascota("Canela")));
    }

    @Test
    void tamanoYNombresSinTildes() {
        assertEquals("grande", CatalogoService.tamanoBase(mascota("Rocky")));
        assertEquals("pequeño", CatalogoService.tamanoBase(mascota("Tomás")));
        assertEquals("Tomás", catalogo.buscarPorNombre("tomas").orElseThrow().nombre());
        assertTrue(catalogo.buscarPorNombre("Firulais").isEmpty());
    }

    @Test
    void filtros() {
        List<Mascota> gatos = CatalogoService.filtrar(catalogo.todas(), "gato", null, null, null, null, null);
        assertFalse(gatos.isEmpty());
        assertTrue(gatos.stream().allMatch(m -> m.especie().equals("gato")));

        List<Mascota> depaNinos = CatalogoService.filtrar(catalogo.todas(), null, null, null, null, true, true);
        assertTrue(depaNinos.stream().map(Mascota::nombre).toList().containsAll(List.of("Tomás", "Nala")));

        assertTrue(CatalogoService.filtrar(catalogo.todas(), null, "grande", null, null, null, null).stream()
                .allMatch(m -> "grande".equals(CatalogoService.tamanoBase(m))));
        assertTrue(CatalogoService.filtrar(catalogo.todas(), "gato", null, null, "cachorro", null, null).isEmpty());
    }

    @Test
    void departamentoPenalizaPerrosGrandes() {
        Perfil perfil = new Perfil("departamento", "media", 4);
        assertTrue(CatalogoService.compatibilidad(mascota("Bruno"), perfil).puntaje()
                < CatalogoService.compatibilidad(mascota("Nala"), perfil).puntaje());
    }

    @Test
    void ninosExcluyenAMostazaDelPodio() {
        Perfil perfil = new Perfil("departamento", "baja", 8);
        perfil.setNinos(true);
        Resultado resultado = CatalogoService.compatibilidad(mascota("Mostaza"), perfil);
        assertTrue(resultado.alertas().contains("No es ideal para un hogar con niños"));
        assertTrue(CatalogoService.recomendar(catalogo.todas(), perfil, 2, Set.of()).stream()
                .noneMatch(r -> r.mascota().nombre().equals("Mostaza")));
    }

    @Test
    void preferenciaDeEspecieYOrden() {
        Perfil perfil = new Perfil("casa_patio", "alta", 2);
        perfil.setEspecie("perro");
        perfil.setExperiencia(true);
        List<Resultado> resultados = CatalogoService.recomendar(catalogo.todas(), perfil, 5, Set.of());
        assertFalse(resultados.isEmpty());
        assertTrue(resultados.stream().allMatch(r -> r.mascota().especie().equals("perro")));
        List<Integer> puntajes = resultados.stream().map(Resultado::puntaje).toList();
        assertEquals(puntajes.stream().sorted(Comparator.reverseOrder()).toList(), puntajes);
        assertTrue(Set.of("Canela", "Rocky").contains(resultados.get(0).mascota().nombre()));
    }

    @Test
    void puntajeEnRangoYExcluir() {
        Perfil peor = new Perfil("departamento", "baja", 12);
        peor.setNinos(true);
        peor.setOtrosPerros(true);
        peor.setOtrosGatos(true);
        for (Mascota m : catalogo.todas()) {
            int puntaje = CatalogoService.compatibilidad(m, peor).puntaje();
            assertTrue(puntaje >= 0 && puntaje <= 100, "puntaje fuera de rango para " + m.nombre());
        }

        Perfil soloGatos = new Perfil();
        soloGatos.setEspecie("gato");
        List<Resultado> sinLuna = CatalogoService.recomendar(
                catalogo.todas(), soloGatos, 10, Set.of(mascota("Luna").id()));
        assertTrue(sinLuna.stream().noneMatch(r -> r.mascota().nombre().equals("Luna")));
    }
}
