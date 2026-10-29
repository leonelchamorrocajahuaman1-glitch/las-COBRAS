package com.lascobras.adoptabot.solicitudes;

/** Datos del formulario de adopción, tal como llegan de la web. */
public class DatosSolicitud {

    private String nombre = "";
    private String documento = "";
    private String telefono = "";
    private String email = "";
    private String distrito = "";
    private String vivienda = "";
    private String motivo = "";
    private boolean aceptaCompromiso;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDistrito() {
        return distrito;
    }

    public void setDistrito(String distrito) {
        this.distrito = distrito;
    }

    public String getVivienda() {
        return vivienda;
    }

    public void setVivienda(String vivienda) {
        this.vivienda = vivienda;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public boolean isAceptaCompromiso() {
        return aceptaCompromiso;
    }

    public void setAceptaCompromiso(boolean aceptaCompromiso) {
        this.aceptaCompromiso = aceptaCompromiso;
    }
}
