package com.lascobras.adoptabot.solicitudes;

import java.security.SecureRandom;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.lascobras.adoptabot.catalogo.Mascota;

/** Reglas de negocio de las solicitudes de adopción. */
@Service
public class SolicitudService {

    private final SolicitudRepository repo;
    private final SecureRandom azar = new SecureRandom();

    public SolicitudService(SolicitudRepository repo) {
        this.repo = repo;
    }

    /** Registra una solicitud y devuelve su código de seguimiento. */
    public String crear(Mascota mascota, DatosSolicitud datos) {
        DatosLimpios limpio = validar(datos);
        if (repo.estadoMascota(mascota.id()) == EstadoMascota.ADOPTADO) {
            throw new SolicitudInvalidaException(
                    mascota.nombre() + " ya fue adoptado. ¡Mira las demás mascotas!");
        }
        byte[] bytes = new byte[3];
        azar.nextBytes(bytes);
        String codigo = "LC-" + HexFormat.of().withUpperCase().formatHex(bytes);
        try {
            repo.insertar(codigo, mascota, limpio, ahora());
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("UNIQUE constraint failed")) {
                throw new SolicitudInvalidaException("Ya tienes una solicitud en curso para "
                        + mascota.nombre() + ". Consulta su estado con tu código.");
            }
            throw new IllegalStateException("No se pudo guardar la solicitud", e);
        }
        return codigo;
    }

    /** Limpia y valida los datos del formulario. Lanza SolicitudInvalidaException con un mensaje claro. */
    public static DatosLimpios validar(DatosSolicitud datos) {
        String nombre = colapsar(datos.getNombre());
        String documento = texto(datos.getDocumento()).toUpperCase(Locale.ROOT);
        String telefono = texto(datos.getTelefono()).replaceAll("[\\s-]", "");
        String email = texto(datos.getEmail());
        String distrito = texto(datos.getDistrito());
        String vivienda = texto(datos.getVivienda());
        String motivo = texto(datos.getMotivo());

        if (nombre.length() < 5 || !nombre.contains(" ")) {
            throw new SolicitudInvalidaException("Escribe tu nombre y apellido.");
        }
        if (!documento.matches("[A-Z0-9]{8,12}")) {
            throw new SolicitudInvalidaException(
                    "El DNI o carné de extranjería debe tener de 8 a 12 letras o números.");
        }
        if (!telefono.matches("(\\+?51)?9\\d{8}")) {
            throw new SolicitudInvalidaException(
                    "El celular debe tener 9 dígitos y empezar con 9 (ej. 987654321).");
        }
        if (!email.isEmpty() && !email.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")) {
            throw new SolicitudInvalidaException("El correo electrónico no es válido.");
        }
        if (distrito.length() < 3) {
            throw new SolicitudInvalidaException("Indica tu distrito o ciudad.");
        }
        if (vivienda.isEmpty()) {
            throw new SolicitudInvalidaException("Indica el tipo de vivienda.");
        }
        if (motivo.length() < 30) {
            throw new SolicitudInvalidaException(
                    "Cuéntanos con un poco más de detalle por qué quieres adoptar (mínimo 30 caracteres).");
        }
        if (!datos.isAceptaCompromiso()) {
            throw new SolicitudInvalidaException("Debes aceptar el compromiso de tenencia responsable.");
        }
        return new DatosLimpios(nombre, documento, telefono, email, distrito, vivienda, motivo);
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor.strip();
    }

    private static String colapsar(String valor) {
        return texto(valor).replaceAll("\\s+", " ");
    }

    private static String ahora() {
        return OffsetDateTime.now(ZoneOffset.UTC).truncatedTo(ChronoUnit.SECONDS).toString();
    }

    // ---------- Consultas ----------

    public Optional<Solicitud> consultar(String codigo, String documento) {
        if (codigo == null || codigo.isBlank() || documento == null || documento.isBlank()) {
            return Optional.empty();
        }
        return repo.porCodigoYDocumento(codigo, documento);
    }

    public Optional<Solicitud> porCodigo(String codigo) {
        return repo.porCodigo(codigo);
    }

    public List<Solicitud> listar(EstadoSolicitud estado) {
        return repo.listar(estado);
    }

    public EstadoMascota estadoMascota(int mascotaId) {
        return repo.estadoMascota(mascotaId);
    }

    public Map<Integer, EstadoMascota> estadosMascotas() {
        return repo.estadosMascotas();
    }

    // ---------- Gestión del refugio ----------

    /** Cambia el estado de una solicitud y mantiene coherente el estado de la mascota. */
    public Solicitud actualizarEstado(String codigo, EstadoSolicitud estado, String nota) {
        Solicitud actual = repo.porCodigo(codigo)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        if (estado == EstadoSolicitud.APROBADA) {
            repo.aprobadaDeMascota(actual.mascotaId(), actual.codigo()).ifPresent(otra -> {
                throw new IllegalArgumentException(actual.mascotaNombre()
                        + " ya tiene otra solicitud aprobada (" + otra.codigo() + ").");
            });
        }
        repo.actualizar(actual.codigo(), estado, nota, ahora());

        Set<EstadoSolicitud> activas = repo.estadosDeMascota(actual.mascotaId());
        if (activas.contains(EstadoSolicitud.APROBADA)) {
            repo.fijarEstadoMascota(actual.mascotaId(), EstadoMascota.ADOPTADO);
        } else if (activas.contains(EstadoSolicitud.ENTREVISTA)) {
            repo.fijarEstadoMascota(actual.mascotaId(), EstadoMascota.EN_PROCESO);
        } else {
            repo.fijarEstadoMascota(actual.mascotaId(), EstadoMascota.DISPONIBLE);
        }
        return repo.porCodigo(actual.codigo()).orElseThrow();
    }

    public void marcarAdoptada(int mascotaId) {
        repo.fijarEstadoMascota(mascotaId, EstadoMascota.ADOPTADO);
    }

    /** Corrige manualmente el estado de una mascota desde el panel del refugio. */
    public void fijarEstadoMascota(int mascotaId, EstadoMascota estado) {
        repo.fijarEstadoMascota(mascotaId, estado);
    }

    public Estadisticas estadisticas() {
        Map<EstadoSolicitud, Integer> conteo = repo.conteoPorEstado();
        Map<String, Integer> porEstado = new LinkedHashMap<>();
        for (EstadoSolicitud estado : EstadoSolicitud.values()) {
            porEstado.put(estado.valor(), conteo.getOrDefault(estado, 0));
        }
        int total = porEstado.values().stream().mapToInt(Integer::intValue).sum();
        return new Estadisticas(total, porEstado, repo.contarAdoptadas());
    }

    /** Estados con su etiqueta legible, para los selectores del panel. */
    public static Map<EstadoSolicitud, String> etiquetasDeEstado() {
        Map<EstadoSolicitud, String> etiquetas = new EnumMap<>(EstadoSolicitud.class);
        for (EstadoSolicitud estado : EstadoSolicitud.values()) {
            etiquetas.put(estado, estado.etiqueta());
        }
        return etiquetas;
    }
}
