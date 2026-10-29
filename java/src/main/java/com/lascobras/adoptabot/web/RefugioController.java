package com.lascobras.adoptabot.web;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.lascobras.adoptabot.catalogo.CatalogoService;
import com.lascobras.adoptabot.solicitudes.Estadisticas;
import com.lascobras.adoptabot.solicitudes.EstadoMascota;
import com.lascobras.adoptabot.solicitudes.EstadoSolicitud;
import com.lascobras.adoptabot.solicitudes.Solicitud;
import com.lascobras.adoptabot.solicitudes.SolicitudService;

import jakarta.servlet.http.HttpSession;

/** Panel del refugio protegido con la contraseña ADMIN_PASSWORD. */
@Controller
@RequestMapping("/refugio")
public class RefugioController {

    private static final int MAX_INTENTOS = 5;
    private static final String ADMIN = "admin";
    private static final String INTENTOS = "intentosAdmin";

    private final SolicitudService solicitudes;
    private final CatalogoService catalogo;
    private final String contrasena;

    public RefugioController(SolicitudService solicitudes, CatalogoService catalogo,
            @Value("${adoptabot.admin-password}") String contrasena) {
        this.solicitudes = solicitudes;
        this.catalogo = catalogo;
        this.contrasena = contrasena == null ? "" : contrasena.strip();
    }

    @GetMapping
    public String panel(@RequestParam(name = "estado", required = false) String estado,
            Model modelo, HttpSession sesion) {
        if (!esAdmin(sesion)) {
            return acceder(modelo, sesion);
        }

        EstadoSolicitud filtro = filtrar(estado);
        Estadisticas stats = solicitudes.estadisticas();
        modelo.addAttribute("stats", stats);
        modelo.addAttribute("porRevisar", stats.porEstado().getOrDefault("pendiente", 0));
        modelo.addAttribute("enEntrevista", stats.porEstado().getOrDefault("entrevista", 0));
        modelo.addAttribute("solicitudes", solicitudes.listar(filtro));
        modelo.addAttribute("filtro", filtro == null ? "todas" : filtro.valor());
        modelo.addAttribute("estadosSolicitud", EstadoSolicitud.values());
        modelo.addAttribute("estadosMascota", EstadoMascota.values());
        modelo.addAttribute("mascotas", MascotaVista.listar(catalogo.todas(), solicitudes.estadosMascotas()));
        return "refugio";
    }

    @PostMapping("/entrar")
    public String entrar(@RequestParam(name = "contrasena", required = false) String ingresada,
            Model modelo, HttpSession sesion) {
        int intentos = intentos(sesion);
        if (intentos >= MAX_INTENTOS) {
            return acceder(modelo, sesion);
        }
        if (valida(ingresada)) {
            sesion.setAttribute(ADMIN, true);
            sesion.removeAttribute(INTENTOS);
            return "redirect:/refugio";
        }
        sesion.setAttribute(INTENTOS, intentos + 1);
        modelo.addAttribute("error", "Contraseña incorrecta.");
        return acceder(modelo, sesion);
    }

    @PostMapping("/salir")
    public String salir(HttpSession sesion) {
        sesion.removeAttribute(ADMIN);
        return "redirect:/refugio";
    }

    @PostMapping("/solicitudes/{codigo}")
    public String actualizarSolicitud(@PathVariable("codigo") String codigo,
            @RequestParam(name = "estado", required = false) String estado,
            @RequestParam(name = "nota", required = false) String nota,
            HttpSession sesion, RedirectAttributes redireccion) {
        if (!esAdmin(sesion)) {
            return "redirect:/refugio";
        }
        try {
            solicitudes.actualizarEstado(codigo, EstadoSolicitud.desde(estado), nota);
            redireccion.addFlashAttribute("aviso", "Solicitud " + codigo + " actualizada.");
        } catch (IllegalArgumentException e) {
            redireccion.addFlashAttribute("avisoError", e.getMessage());
        }
        return "redirect:/refugio";
    }

    @PostMapping("/mascotas/{id}")
    public String actualizarMascota(@PathVariable("id") int id,
            @RequestParam(name = "estado", required = false) String estado,
            HttpSession sesion, RedirectAttributes redireccion) {
        if (!esAdmin(sesion)) {
            return "redirect:/refugio";
        }
        EstadoMascota nuevo = EstadoMascota.desde(estado);
        solicitudes.fijarEstadoMascota(id, nuevo);
        redireccion.addFlashAttribute("aviso", "Estado de la mascota actualizado: " + nuevo.etiqueta() + ".");
        return "redirect:/refugio";
    }

    @GetMapping("/exportar.csv")
    public ResponseEntity<byte[]> exportar(HttpSession sesion) {
        if (!esAdmin(sesion)) {
            return ResponseEntity.status(403).build();
        }
        List<Solicitud> filas = solicitudes.listar(null);
        StringBuilder csv = new StringBuilder("\uFEFF");
        csv.append("id,codigo,mascota_id,mascota_nombre,nombre,documento,telefono,email,distrito,"
                + "vivienda,motivo,estado,nota_refugio,creada_en,actualizada_en\n");
        for (Solicitud s : filas) {
            csv.append(String.join(",",
                    campo(String.valueOf(s.id())),
                    campo(s.codigo()),
                    campo(String.valueOf(s.mascotaId())),
                    campo(s.mascotaNombre()),
                    campo(s.nombre()),
                    campo(s.documento()),
                    campo(s.telefono()),
                    campo(s.email()),
                    campo(s.distrito()),
                    campo(s.vivienda()),
                    campo(s.motivo()),
                    campo(s.estado().valor()),
                    campo(s.notaRefugio()),
                    campo(s.creadaEn()),
                    campo(s.actualizadaEn()))).append('\n');
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"solicitudes_las_cobras.csv\"")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    // ---------- Utilidades ----------

    private String acceder(Model modelo, HttpSession sesion) {
        int intentos = intentos(sesion);
        modelo.addAttribute("configurado", !contrasena.isEmpty());
        modelo.addAttribute("bloqueado", intentos >= MAX_INTENTOS);
        return "refugio-login";
    }

    private boolean esAdmin(HttpSession sesion) {
        return Boolean.TRUE.equals(sesion.getAttribute(ADMIN));
    }

    private static int intentos(HttpSession sesion) {
        return sesion.getAttribute(INTENTOS) instanceof Integer n ? n : 0;
    }

    private boolean valida(String ingresada) {
        if (contrasena.isEmpty() || ingresada == null || ingresada.isEmpty()) {
            return false;
        }
        return MessageDigest.isEqual(ingresada.getBytes(StandardCharsets.UTF_8),
                contrasena.getBytes(StandardCharsets.UTF_8));
    }

    private static EstadoSolicitud filtrar(String estado) {
        if (estado == null || estado.isBlank()) {
            return null;
        }
        try {
            return EstadoSolicitud.desde(estado);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /** Escapa una celda CSV y evita que Excel la interprete como fórmula. */
    private static String campo(String valor) {
        String texto = valor == null ? "" : valor;
        if (!texto.isEmpty() && "=+-@".indexOf(texto.charAt(0)) >= 0) {
            texto = "'" + texto;
        }
        if (texto.contains(",") || texto.contains("\"") || texto.contains("\n") || texto.contains("\r")) {
            texto = "\"" + texto.replace("\"", "\"\"") + "\"";
        }
        return texto;
    }
}
