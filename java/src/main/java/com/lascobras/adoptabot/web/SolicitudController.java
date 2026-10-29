package com.lascobras.adoptabot.web;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.lascobras.adoptabot.catalogo.CatalogoService;
import com.lascobras.adoptabot.catalogo.Mascota;
import com.lascobras.adoptabot.catalogo.Perfil;
import com.lascobras.adoptabot.solicitudes.DatosSolicitud;
import com.lascobras.adoptabot.solicitudes.SolicitudInvalidaException;
import com.lascobras.adoptabot.solicitudes.SolicitudService;

import jakarta.servlet.http.HttpSession;

@Controller
public class SolicitudController {

    private final CatalogoService catalogo;
    private final SolicitudService solicitudes;

    public SolicitudController(CatalogoService catalogo, SolicitudService solicitudes) {
        this.catalogo = catalogo;
        this.solicitudes = solicitudes;
    }

    @GetMapping("/solicitud")
    public String formulario(@RequestParam(name = "mascotaId", required = false) Integer mascotaId,
            Model modelo, HttpSession sesion) {
        List<MascotaVista> opciones = disponibles();
        if (opciones.isEmpty()) {
            modelo.addAttribute("sinMascotas", true);
            modelo.addAttribute("datos", new DatosSolicitud());
            return "solicitud";
        }

        int seleccion = mascotaId != null && opciones.stream()
                .anyMatch(v -> v.mascota().id() == mascotaId)
                        ? mascotaId
                        : opciones.get(0).mascota().id();

        DatosSolicitud datos = new DatosSolicitud();
        if (sesion.getAttribute("perfil") instanceof Perfil perfil) {
            datos.setVivienda(etiquetaVivienda(perfil.getVivienda()));
        }
        preparar(modelo, opciones, seleccion, datos);
        return "solicitud";
    }

    @PostMapping("/solicitud")
    public String enviar(@RequestParam("mascotaId") int mascotaId,
            @ModelAttribute("datos") DatosSolicitud datos, Model modelo) {
        Mascota mascota = catalogo.porId(mascotaId).orElse(null);
        if (mascota == null) {
            modelo.addAttribute("error", "Esa mascota ya no está en el catálogo. Elige otra, por favor.");
            preparar(modelo, disponibles(), 0, datos);
            return "solicitud";
        }
        try {
            String codigo = solicitudes.crear(mascota, datos);
            return "redirect:/solicitud/enviada?codigo=" + codigo;
        } catch (SolicitudInvalidaException e) {
            modelo.addAttribute("error", e.getMessage());
            preparar(modelo, disponibles(), mascotaId, datos);
            return "solicitud";
        }
    }

    @GetMapping("/solicitud/enviada")
    public String enviada(@RequestParam("codigo") String codigo, Model modelo) {
        modelo.addAttribute("codigo", codigo);
        return "solicitud-enviada";
    }

    private List<MascotaVista> disponibles() {
        return MascotaVista.listar(catalogo.todas(), solicitudes.estadosMascotas()).stream()
                .filter(v -> !v.adoptado())
                .toList();
    }

    private void preparar(Model modelo, List<MascotaVista> opciones, int seleccion, DatosSolicitud datos) {
        modelo.addAttribute("opciones", opciones);
        modelo.addAttribute("seleccion", seleccion);
        modelo.addAttribute("datos", datos);
        modelo.addAttribute("seleccionada", opciones.stream()
                .filter(v -> v.mascota().id() == seleccion)
                .findFirst()
                .orElse(null));
    }

    private static String etiquetaVivienda(String vivienda) {
        return switch (vivienda) {
            case "casa" -> "Casa sin patio";
            case "casa_patio" -> "Casa con patio";
            default -> "Departamento";
        };
    }
}
