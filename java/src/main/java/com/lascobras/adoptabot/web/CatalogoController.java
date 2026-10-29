package com.lascobras.adoptabot.web;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.lascobras.adoptabot.catalogo.CatalogoService;
import com.lascobras.adoptabot.solicitudes.SolicitudService;

@Controller
public class CatalogoController {

    private final CatalogoService catalogo;
    private final SolicitudService solicitudes;

    public CatalogoController(CatalogoService catalogo, SolicitudService solicitudes) {
        this.catalogo = catalogo;
        this.solicitudes = solicitudes;
    }

    @GetMapping("/catalogo")
    public String catalogo(
            @RequestParam(name = "especie", required = false) String especie,
            @RequestParam(name = "tamano", required = false) List<String> tamanos,
            @RequestParam(name = "etapa", required = false) List<String> etapas,
            @RequestParam(name = "energia", required = false) List<String> energias,
            @RequestParam(name = "ninos", defaultValue = "false") boolean ninos,
            @RequestParam(name = "depa", defaultValue = "false") boolean depa,
            @RequestParam(name = "adoptados", defaultValue = "false") boolean adoptados,
            Model modelo) {

        String especieFiltro = especie != null && CatalogoService.EMOJI_ESPECIE.containsKey(especie) ? especie : null;
        Set<String> tamanosSel = seleccion(tamanos, CatalogoService.TAMANOS);
        Set<String> etapasSel = seleccion(etapas, CatalogoService.ETAPAS);
        Set<String> energiasSel = seleccion(energias, CatalogoService.NIVELES);

        List<MascotaVista> vistas = MascotaVista.listar(catalogo.todas(), solicitudes.estadosMascotas()).stream()
                .filter(v -> especieFiltro == null || v.mascota().especie().equals(especieFiltro))
                .filter(v -> tamanosSel.isEmpty() || tamanosSel.contains(CatalogoService.tamanoBase(v.mascota())))
                .filter(v -> etapasSel.isEmpty() || etapasSel.contains(CatalogoService.etapa(v.mascota())))
                .filter(v -> energiasSel.isEmpty() || energiasSel.contains(v.mascota().energia()))
                .filter(v -> !ninos || v.mascota().aptoNinos())
                .filter(v -> !depa || v.mascota().aptoDepartamento())
                .filter(v -> adoptados || !v.adoptado())
                .toList();

        modelo.addAttribute("vistas", vistas);
        modelo.addAttribute("especie", especieFiltro == null ? "" : especieFiltro);
        modelo.addAttribute("tamanosSel", tamanosSel);
        modelo.addAttribute("etapasSel", etapasSel);
        modelo.addAttribute("energiasSel", energiasSel);
        modelo.addAttribute("ninos", ninos);
        modelo.addAttribute("depa", depa);
        modelo.addAttribute("adoptados", adoptados);
        return "catalogo";
    }

    private static Set<String> seleccion(List<String> valores, List<String> permitidos) {
        if (valores == null) {
            return Set.of();
        }
        return valores.stream().filter(permitidos::contains).collect(Collectors.toSet());
    }
}
