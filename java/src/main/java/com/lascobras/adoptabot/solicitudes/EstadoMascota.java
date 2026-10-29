package com.lascobras.adoptabot.solicitudes;

public enum EstadoMascota {
    DISPONIBLE("disponible", "Disponible"),
    EN_PROCESO("en_proceso", "En proceso de adopción"),
    ADOPTADO("adoptado", "Adoptado ❤️");

    private final String valor;
    private final String etiqueta;

    EstadoMascota(String valor, String etiqueta) {
        this.valor = valor;
        this.etiqueta = etiqueta;
    }

    public String valor() {
        return valor;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public static EstadoMascota desde(String valor) {
        for (EstadoMascota estado : values()) {
            if (estado.valor.equals(valor)) {
                return estado;
            }
        }
        return DISPONIBLE;
    }
}
