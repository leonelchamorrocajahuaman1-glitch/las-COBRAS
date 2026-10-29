package com.lascobras.adoptabot.solicitudes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import com.lascobras.adoptabot.catalogo.Mascota;

import jakarta.annotation.PreDestroy;

/** Acceso a solicitudes y estados de mascotas en SQLite. */
@Repository
public class SolicitudRepository {

    private static final String[] ESQUEMA = {
            """
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
            )
            """,
            """
            CREATE UNIQUE INDEX IF NOT EXISTS ux_solicitud_activa
                ON solicitudes (mascota_id, documento) WHERE estado IN ('pendiente', 'entrevista')
            """,
            """
            CREATE TABLE IF NOT EXISTS estado_mascotas (
                mascota_id INTEGER PRIMARY KEY,
                estado TEXT NOT NULL CHECK (estado IN ('disponible', 'en_proceso', 'adoptado'))
            )
            """
    };

    private final Connection conexion;

    @Autowired
    public SolicitudRepository(@Value("${adoptabot.db:data/adoptabot.db}") String ruta) {
        this(Path.of(ruta));
    }

    public SolicitudRepository(Path ruta) {
        try {
            Path absoluta = ruta.toAbsolutePath();
            if (absoluta.getParent() != null) {
                Files.createDirectories(absoluta.getParent());
            }
            conexion = DriverManager.getConnection("jdbc:sqlite:" + absoluta);
            try (Statement sentencia = conexion.createStatement()) {
                for (String sql : ESQUEMA) {
                    sentencia.executeUpdate(sql);
                }
            }
        } catch (SQLException | IOException e) {
            throw new IllegalStateException("No se pudo abrir la base de datos " + ruta.toAbsolutePath(), e);
        }
    }

    @PreDestroy
    public void cerrar() {
        try {
            conexion.close();
        } catch (SQLException ignorada) {
            // la aplicación se está cerrando: no hay nada que recuperar
        }
    }

    // ---------- Estado de las mascotas ----------

    public synchronized EstadoMascota estadoMascota(int mascotaId) {
        try (PreparedStatement ps = conexion.prepareStatement(
                "SELECT estado FROM estado_mascotas WHERE mascota_id = ?")) {
            ps.setInt(1, mascotaId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? EstadoMascota.desde(rs.getString("estado")) : EstadoMascota.DISPONIBLE;
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo leer el estado de la mascota", e);
        }
    }

    public synchronized Map<Integer, EstadoMascota> estadosMascotas() {
        Map<Integer, EstadoMascota> estados = new LinkedHashMap<>();
        try (Statement sentencia = conexion.createStatement();
                ResultSet rs = sentencia.executeQuery("SELECT mascota_id, estado FROM estado_mascotas")) {
            while (rs.next()) {
                estados.put(rs.getInt("mascota_id"), EstadoMascota.desde(rs.getString("estado")));
            }
            return estados;
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudieron leer los estados de las mascotas", e);
        }
    }

    public synchronized void fijarEstadoMascota(int mascotaId, EstadoMascota estado) {
        try (PreparedStatement ps = conexion.prepareStatement(
                "INSERT INTO estado_mascotas (mascota_id, estado) VALUES (?, ?) "
                        + "ON CONFLICT (mascota_id) DO UPDATE SET estado = excluded.estado")) {
            ps.setInt(1, mascotaId);
            ps.setString(2, estado.valor());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo guardar el estado de la mascota", e);
        }
    }

    // ---------- Solicitudes ----------

    public synchronized void insertar(String codigo, Mascota mascota, DatosLimpios datos, String ahora)
            throws SQLException {
        try (PreparedStatement ps = conexion.prepareStatement(
                "INSERT INTO solicitudes (codigo, mascota_id, mascota_nombre, nombre, documento, telefono, "
                        + "email, distrito, vivienda, motivo, creada_en, actualizada_en) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
            ps.setString(1, codigo);
            ps.setInt(2, mascota.id());
            ps.setString(3, mascota.nombre());
            ps.setString(4, datos.nombre());
            ps.setString(5, datos.documento());
            ps.setString(6, datos.telefono());
            ps.setString(7, datos.email());
            ps.setString(8, datos.distrito());
            ps.setString(9, datos.vivienda());
            ps.setString(10, datos.motivo());
            ps.setString(11, ahora);
            ps.setString(12, ahora);
            ps.executeUpdate();
        }
    }

    public synchronized Optional<Solicitud> porCodigo(String codigo) {
        try (PreparedStatement ps = conexion.prepareStatement("SELECT * FROM solicitudes WHERE codigo = ?")) {
            ps.setString(1, codigo.strip().toUpperCase());
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo leer la solicitud", e);
        }
    }

    public synchronized Optional<Solicitud> porCodigoYDocumento(String codigo, String documento) {
        try (PreparedStatement ps = conexion.prepareStatement(
                "SELECT * FROM solicitudes WHERE codigo = ? AND documento = ?")) {
            ps.setString(1, codigo.strip().toUpperCase());
            ps.setString(2, documento.strip().toUpperCase());
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo consultar la solicitud", e);
        }
    }

    public synchronized List<Solicitud> listar(EstadoSolicitud estado) {
        String sql = estado == null
                ? "SELECT * FROM solicitudes ORDER BY id DESC"
                : "SELECT * FROM solicitudes WHERE estado = ? ORDER BY id DESC";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            if (estado != null) {
                ps.setString(1, estado.valor());
            }
            try (ResultSet rs = ps.executeQuery()) {
                List<Solicitud> solicitudes = new ArrayList<>();
                while (rs.next()) {
                    solicitudes.add(mapear(rs));
                }
                return solicitudes;
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudieron listar las solicitudes", e);
        }
    }

    public synchronized Optional<Solicitud> aprobadaDeMascota(int mascotaId, String excluirCodigo) {
        try (PreparedStatement ps = conexion.prepareStatement(
                "SELECT * FROM solicitudes WHERE mascota_id = ? AND estado = 'aprobada' AND codigo <> ?")) {
            ps.setInt(1, mascotaId);
            ps.setString(2, excluirCodigo);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapear(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudieron leer las solicitudes de la mascota", e);
        }
    }

    public synchronized Set<EstadoSolicitud> estadosDeMascota(int mascotaId) {
        Set<EstadoSolicitud> estados = new TreeSet<>();
        try (PreparedStatement ps = conexion.prepareStatement(
                "SELECT estado FROM solicitudes WHERE mascota_id = ?")) {
            ps.setInt(1, mascotaId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    estados.add(EstadoSolicitud.desde(rs.getString("estado")));
                }
            }
            return estados;
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudieron leer los estados de la mascota", e);
        }
    }

    public synchronized void actualizar(String codigo, EstadoSolicitud estado, String nota, String ahora) {
        try (PreparedStatement ps = conexion.prepareStatement(
                "UPDATE solicitudes SET estado = ?, nota_refugio = ?, actualizada_en = ? WHERE codigo = ?")) {
            ps.setString(1, estado.valor());
            ps.setString(2, nota == null ? "" : nota.strip());
            ps.setString(3, ahora);
            ps.setString(4, codigo);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo actualizar la solicitud", e);
        }
    }

    public synchronized Map<EstadoSolicitud, Integer> conteoPorEstado() {
        Map<EstadoSolicitud, Integer> conteo = new LinkedHashMap<>();
        try (Statement sentencia = conexion.createStatement();
                ResultSet rs = sentencia.executeQuery(
                        "SELECT estado, COUNT(*) AS n FROM solicitudes GROUP BY estado")) {
            while (rs.next()) {
                conteo.put(EstadoSolicitud.desde(rs.getString("estado")), rs.getInt("n"));
            }
            return conteo;
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudieron contar las solicitudes", e);
        }
    }

    public synchronized int contarAdoptadas() {
        try (Statement sentencia = conexion.createStatement();
                ResultSet rs = sentencia.executeQuery(
                        "SELECT COUNT(*) AS n FROM estado_mascotas WHERE estado = 'adoptado'")) {
            return rs.next() ? rs.getInt("n") : 0;
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudieron contar las adopciones", e);
        }
    }

    private static Solicitud mapear(ResultSet rs) throws SQLException {
        return new Solicitud(
                rs.getLong("id"),
                rs.getString("codigo"),
                rs.getInt("mascota_id"),
                rs.getString("mascota_nombre"),
                rs.getString("nombre"),
                rs.getString("documento"),
                rs.getString("telefono"),
                rs.getString("email"),
                rs.getString("distrito"),
                rs.getString("vivienda"),
                rs.getString("motivo"),
                EstadoSolicitud.desde(rs.getString("estado")),
                rs.getString("nota_refugio"),
                rs.getString("creada_en"),
                rs.getString("actualizada_en"));
    }
}
