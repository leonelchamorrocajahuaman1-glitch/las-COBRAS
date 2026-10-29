package com.lascobras.adoptabot.web;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.lascobras.adoptabot.solicitudes.EstadoSolicitud;
import com.lascobras.adoptabot.solicitudes.Solicitud;
import com.lascobras.adoptabot.solicitudes.SolicitudService;

@Controller
public class MiSolicitudController {

    private static final List<EstadoSolicitud> ORDEN = List.of(
            EstadoSolicitud.PENDIENTE, EstadoSolicitud.ENTREVISTA, EstadoSolicitud.APROBADA);

    private final SolicitudService solicitudes;

    public MiSolicitudController(SolicitudService solicitudes) {
        this.solicitudes = solicitudes;
    }

    @GetMapping("/mi-solicitud")
    public String formulario(@RequestParam(name = "codigo", required = false) String codigo, Model modelo) {
        modelo.addAttribute("codigo", codigo == null ? "" : codigo);
        modelo.addAttribute("documento", "");
        return "mi-solicitud";
    }

    @PostMapping("/mi-solicitud")
    public String consultar(@RequestParam(name = "codigo", required = false) String codigo,
            @RequestParam(name = "documento", required = false) String documento, Model modelo) {
        modelo.addAttribute("codigo", codigo == null ? "" : codigo);
        modelo.addAttribute("documento", documento == null ? "" : documento);

        Optional<Solicitud> encontrada = solicitudes.consultar(codigo, documento);
        if (encontrada.isEmpty()) {
            modelo.addAttribute("error",
                    "No encontramos una solicitud con ese código y documento. Revisa que estén bien escritos.");
            return "mi-solicitud";
        }
        Solicitud solicitud = encontrada.get();
        modelo.addAttribute("solicitud", solicitud);
        modelo.addAttribute("pasoActual", ORDEN.indexOf(solicitud.estado()));
        return "mi-solicitud";
    }
}
