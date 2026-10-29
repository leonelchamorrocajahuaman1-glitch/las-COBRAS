package com.lascobras.adoptabot.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "adoptabot.db=target/test-web.db",
        "adoptabot.catalogo=../data/mascotas.json",
        "adoptabot.admin-password=clave-de-prueba"
})
class WebSmokeTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void paginasPrincipalesRenderizan() throws Exception {
        for (String ruta : List.of("/", "/catalogo", "/test", "/solicitud", "/mi-solicitud", "/refugio")) {
            var respuesta = mvc.perform(get(ruta)).andReturn().getResponse();
            assertEquals(200, respuesta.getStatus(), "Falló la página " + ruta);
            assertTrue(respuesta.getContentAsString().contains("Las Cobras"), "sin cabecera en " + ruta);
        }
    }

    @Test
    void catalogoMuestraMascotasYFiltra() throws Exception {
        var html = mvc.perform(get("/catalogo")).andReturn().getResponse().getContentAsString();
        assertTrue(html.contains("Canela"));

        var soloGatos = mvc.perform(get("/catalogo").param("especie", "gato"))
                .andReturn().getResponse().getContentAsString();
        assertTrue(soloGatos.contains("Luna"));
        assertTrue(!soloGatos.contains("Canela"), "no debería listar perros al filtrar gatos");
    }

    @Test
    void testCalcularResultados() throws Exception {
        var html = mvc.perform(post("/test")
                .param("especie", "perro")
                .param("vivienda", "casa_patio")
                .param("actividad", "alta")
                .param("horasFuera", "2"))
                .andReturn().getResponse().getContentAsString();
        assertTrue(html.contains("Tus mejores coincidencias"));
        assertTrue(html.contains("Canela"));
    }

    @Test
    void solicitudInvalidaMuestraElErrorSinPerderDatos() throws Exception {
        var html = mvc.perform(post("/solicitud")
                .param("mascotaId", "2")
                .param("nombre", "Ana")
                .param("documento", "70123456")
                .param("telefono", "987654321")
                .param("distrito", "Miraflores")
                .param("vivienda", "Departamento")
                .param("motivo", "Tenemos patio y tiempo para pasear al perro todos los días.")
                .param("aceptaCompromiso", "true"))
                .andReturn().getResponse().getContentAsString();
        assertTrue(html.contains("nombre y apellido"));
        assertTrue(html.contains("value=\"Ana\""));
    }
}
