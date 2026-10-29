package com.lascobras.adoptabot.solicitudes;

public class SolicitudInvalidaException extends RuntimeException {

    public SolicitudInvalidaException(String mensaje) {
        super(mensaje);
    }
}
