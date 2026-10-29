package com.lascobras.adoptabot.solicitudes;

/** Datos del formulario ya normalizados y validados. */
public record DatosLimpios(
        String nombre,
        String documento,
        String telefono,
        String email,
        String distrito,
        String vivienda,
        String motivo) {
}
