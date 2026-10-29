package com.lascobras.adoptabot.web;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.lascobras.adoptabot.catalogo.CatalogoService;
import com.lascobras.adoptabot.catalogo.Perfil;
import com.lascobras.adoptabot.catalogo.Resultado;
import com.lascobras.adoptabot.solicitudes.EstadoMascota;
import com.lascobras.adoptabot.solicitudes.SolicitudService;

import jakarta.servlet.http.HttpSession;

@Controller
public class TestController {

    private final CatalogoService catalogo;
    private final SolicitudService solicitudes;

    public TestController(CatalogoService catalogo, SolicitudService solicitudes) {
        this.catalogo = catalogo;
        this.solicitudes = solicitudes;
    }

    @GetMapping("/test")
    public String formulario(Model modelo, HttpSession sesion) {
        Perfil perfil = sesion.getAttribute("perfil") instanceof Perfil guardado ? guardado : new Perfil();
        modelo.addAttribute("perfil", perfil);
        return "test";
    }

    @PostMapping("/test")
    public String resultados(@ModelAttribute("perfil") Perfil perfil, Model modelo, HttpSession sesion) {
        depurar(perfil);
        sesion.setAttribute("perfil", perfil);

        Set<Integer> adoptadas = solicitudes.estadosMascotas().entrySet().stream()
                .filter(entrada -> entrada.getValue() == EstadoMascota.ADOPTADO)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        modelo.addAttribute("resultados", catalogo.recomendar(perfil, 3, adoptadas));
        modelo.addAttribute("perfil", perfil);
        return "test";
    }

    private static void depurar(Perfil perfil) {
        if (!CatalogoService.VIVIENDAS.contains(perfil.getVivienda())) {
            perfil.setVivienda("departamento");
        }
        if (!CatalogoService.NIVELES.contains(perfil.getActividad())) {
            perfil.setActividad("media");
        }
        if (!Set.of("perro", "gato", "cualquiera").contains(String.valueOf(perfil.getEspecie()))) {
            perfil.setEspecie("cualquiera");
        }
        perfil.setHorasFuera(Math.max(0, Math.min(12, perfil.getHorasFuera())));
    }
}
