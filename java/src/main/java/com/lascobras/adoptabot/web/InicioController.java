package com.lascobras.adoptabot.web;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.lascobras.adoptabot.catalogo.CatalogoService;
import com.lascobras.adoptabot.solicitudes.Estadisticas;
import com.lascobras.adoptabot.solicitudes.SolicitudService;

@Controller
public class InicioController {

    private final CatalogoService catalogo;
    private final SolicitudService solicitudes;

    public InicioController(CatalogoService catalogo, SolicitudService solicitudes) {
        this.catalogo = catalogo;
        this.solicitudes = solicitudes;
    }

    @GetMapping("/")
    public String inicio(Model modelo) {
        List<MascotaVista> vistas = MascotaVista.listar(catalogo.todas(), solicitudes.estadosMascotas());
        List<MascotaVista> disponibles = vistas.stream().filter(v -> !v.adoptado()).toList();
        Estadisticas stats = solicitudes.estadisticas();
        modelo.addAttribute("disponibles", disponibles.size());
        modelo.addAttribute("adoptadas", stats.adoptadas());
        modelo.addAttribute("solicitudes", stats.solicitudes());
        modelo.addAttribute("destacadas", disponibles.stream().limit(3).toList());
        return "inicio";
    }
}
