package com.lascobras.adoptabot.web;

import java.util.List;

/** Un paso del proceso de adopción que se muestra en la barra de guía. */
public record Paso(String numero, String titulo, String detalle) {

    public static final List<Paso> PROCESO = List.of(
            new Paso("1", "Conoce", "Catálogo e historias"),
            new Paso("2", "Test", "Tu compatibilidad"),
            new Paso("3", "Postula", "Envía tu solicitud"),
            new Paso("4", "Entrevista", "Visita y entrega"));
}
