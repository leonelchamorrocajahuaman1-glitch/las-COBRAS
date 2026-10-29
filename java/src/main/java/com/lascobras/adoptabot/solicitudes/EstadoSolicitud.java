package com.lascobras.adoptabot.solicitudes;

public enum EstadoSolicitud {
    PENDIENTE("pendiente", "🕒 Pendiente de revisión"),
    ENTREVISTA("entrevista", "📞 Entrevista programada"),
    APROBADA("aprobada", "✅ Aprobada"),
    RECHAZADA("rechazada", "❌ No aprobada");

    private final String valor;
    private final String etiqueta;

    EstadoSolicitud(String valor, String etiqueta) {
        this.valor = valor;
        this.etiqueta = etiqueta;
    }

    public String valor() {
        return valor;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public static EstadoSolicitud desde(String valor) {
        for (EstadoSolicitud estado : values()) {
            if (estado.valor.equals(valor)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado inválido: " + valor);
    }
}
