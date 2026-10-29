package com.lascobras.adoptabot.web;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.lascobras.adoptabot.catalogo.CatalogoService;

/** Datos que todas las plantillas pueden usar (pasos, filtros, medallas). */
@ControllerAdvice
public class ModeloGlobal {

    @ModelAttribute("pasos")
    public List<Paso> pasos() {
        return Paso.PROCESO;
    }

    @ModelAttribute("tamanos")
    public List<String> tamanos() {
        return CatalogoService.TAMANOS;
    }

    @ModelAttribute("etapas")
    public List<String> etapas() {
        return CatalogoService.ETAPAS;
    }

    @ModelAttribute("niveles")
    public List<String> niveles() {
        return CatalogoService.NIVELES;
    }

    @ModelAttribute("medallas")
    public List<String> medallas() {
        return List.of("🥇", "🥈", "🥉");
    }

    @ModelAttribute("emojiEspecie")
    public Map<String, String> emojiEspecie() {
        return CatalogoService.EMOJI_ESPECIE;
    }
}
