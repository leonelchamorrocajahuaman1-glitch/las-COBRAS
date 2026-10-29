package com.lascobras.adoptabot.solicitudes;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.lascobras.adoptabot.catalogo.CatalogoService;
import com.lascobras.adoptabot.catalogo.Mascota;

class SolicitudServiceTest {

    private static CatalogoService catalogo;

    @TempDir
    Path tmp;

    private SolicitudRepository repo;
    private SolicitudService servicio;

    @BeforeAll
    static void cargarCatalogo() {
        catalogo = new CatalogoService(Path.of("../data/mascotas.json"));
    }

    @BeforeEach
    void abrir() {
        repo = new SolicitudRepository(tmp.resolve("test.db"));
        servicio = new SolicitudService(repo);
    }

    @AfterEach
    void cerrar() {
        repo.cerrar();
    }

    private static Mascota mascota(String nombre) {
        return catalogo.buscarPorNombre(nombre).orElseThrow();
    }

    private static DatosSolicitud datos() {
        DatosSolicitud datos = new DatosSolicitud();
        datos.setNombre("Ana Quispe");
        datos.setDocumento("70123456");
        datos.setTelefono("987 654 321");
        datos.setEmail("ana@correo.pe");
        datos.setDistrito("Miraflores");
        datos.setVivienda("Casa con patio");
        datos.setMotivo("Tenemos patio, trabajo desde casa y mis hijos aman los perros.");
        datos.setAceptaCompromiso(true);
        return datos;
    }

    private static DatosSolicitud con(String campo, String valor) {
        DatosSolicitud datos = datos();
        switch (campo) {
            case "nombre" -> datos.setNombre(valor);
            case "documento" -> datos.setDocumento(valor);
            case "telefono" -> datos.setTelefono(valor);
            case "email" -> datos.setEmail(valor);
            case "motivo" -> datos.setMotivo(valor);
            default -> throw new IllegalArgumentException("Campo desconocido: " + campo);
        }
        return datos;
    }

    @ParameterizedTest
    @CsvSource({
            "nombre, Ana, nombre y apellido",
            "documento, '123', DNI",
            "telefono, '12345', celular",
            "email, no-es-correo, correo",
            "motivo, 'porque sí', detalle"
    })
    void rechazaDatosInvalidos(String campo, String valor, String mensaje) {
        SolicitudInvalidaException error = assertThrows(SolicitudInvalidaException.class,
                () -> servicio.crear(mascota("Canela"), con(campo, valor)));
        assertTrue(error.getMessage().toLowerCase().contains(mensaje.toLowerCase()),
                "Se esperaba «" + mensaje + "» en: " + error.getMessage());
    }

    @Test
    void exigeAceptarElCompromiso() {
        DatosSolicitud datos = datos();
        datos.setAceptaCompromiso(false);
        SolicitudInvalidaException error = assertThrows(SolicitudInvalidaException.class,
                () -> servicio.crear(mascota("Canela"), datos));
        assertTrue(error.getMessage().contains("compromiso"));
    }

    @Test
    void creaYConsultaConCodigoYDocumento() {
        String codigo = servicio.crear(mascota("Canela"), datos());
        assertTrue(codigo.startsWith("LC-"));
        Solicitud solicitud = servicio.consultar(codigo.toLowerCase(), "70123456").orElseThrow();
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.estado());
        assertEquals("987654321", solicitud.telefono());
        assertTrue(servicio.consultar(codigo, "99999999").isEmpty(),
                "sin el documento correcto no se ven los datos");
    }

    @Test
    void noDuplicaSolicitudesActivas() {
        servicio.crear(mascota("Canela"), datos());
        SolicitudInvalidaException error = assertThrows(SolicitudInvalidaException.class,
                () -> servicio.crear(mascota("Canela"), datos()));
        assertTrue(error.getMessage().contains("Ya tienes una solicitud"));
    }

    @Test
    void flujoDeEstadosActualizaLaMascota() {
        String codigo = servicio.crear(mascota("Canela"), datos());
        int canela = mascota("Canela").id();

        servicio.actualizarEstado(codigo, EstadoSolicitud.ENTREVISTA, "Te llamamos el lunes");
        assertEquals(EstadoMascota.EN_PROCESO, servicio.estadoMascota(canela));

        servicio.actualizarEstado(codigo, EstadoSolicitud.APROBADA, null);
        assertEquals(EstadoMascota.ADOPTADO, servicio.estadoMascota(canela));
        assertEquals("", servicio.consultar(codigo, "70123456").orElseThrow().notaRefugio());

        SolicitudInvalidaException error = assertThrows(SolicitudInvalidaException.class,
                () -> servicio.crear(mascota("Canela"), con("documento", "80123456")));
        assertTrue(error.getMessage().contains("ya fue adoptado"));

        servicio.actualizarEstado(codigo, EstadoSolicitud.RECHAZADA, null);
        assertEquals(EstadoMascota.DISPONIBLE, servicio.estadoMascota(canela));
    }

    @Test
    void soloUnaAprobadaPorMascota() {
        String primera = servicio.crear(mascota("Canela"), datos());
        String segunda = servicio.crear(mascota("Canela"), con("documento", "80123456"));
        servicio.actualizarEstado(primera, EstadoSolicitud.APROBADA, null);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> servicio.actualizarEstado(segunda, EstadoSolicitud.APROBADA, null));
        assertTrue(error.getMessage().contains("ya tiene otra solicitud aprobada"));
    }

    @Test
    void estadisticas() {
        String aprobada = servicio.crear(mascota("Canela"), datos());
        servicio.crear(mascota("Luna"), datos());
        servicio.actualizarEstado(aprobada, EstadoSolicitud.APROBADA, null);

        Estadisticas stats = servicio.estadisticas();
        assertEquals(2, stats.solicitudes());
        assertEquals(1, stats.porEstado().get("aprobada"));
        assertEquals(1, stats.adoptadas());
        assertFalse(stats.porEstado().isEmpty());
    }
}
