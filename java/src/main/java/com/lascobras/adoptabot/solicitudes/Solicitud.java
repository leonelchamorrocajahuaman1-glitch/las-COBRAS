package com.lascobras.adoptabot.solicitudes;

public record Solicitud(
        long id,
        String codigo,
        int mascotaId,
        String mascotaNombre,
        String nombre,
        String documento,
        String telefono,
        String email,
        String distrito,
        String vivienda,
        String motivo,
        EstadoSolicitud estado,
        String notaRefugio,
        String creadaEn,
        String actualizadaEn) {
}
