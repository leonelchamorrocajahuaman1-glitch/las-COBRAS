package com.lascobras.adoptabot.catalogo;

public class Perfil {

    private String vivienda = "departamento";
    private String actividad = "media";
    private int horasFuera = 8;
    private boolean ninos;
    private boolean otrosPerros;
    private boolean otrosGatos;
    private boolean experiencia;
    private String especie = "cualquiera";

    public Perfil() {
    }

    public Perfil(String vivienda, String actividad, int horasFuera) {
        this.vivienda = vivienda;
        this.actividad = actividad;
        this.horasFuera = horasFuera;
    }

    public String getVivienda() {
        return vivienda;
    }

    public void setVivienda(String vivienda) {
        this.vivienda = vivienda;
    }

    public String getActividad() {
        return actividad;
    }

    public void setActividad(String actividad) {
        this.actividad = actividad;
    }

    public int getHorasFuera() {
        return horasFuera;
    }

    public void setHorasFuera(int horasFuera) {
        this.horasFuera = horasFuera;
    }

    public boolean isNinos() {
        return ninos;
    }

    public void setNinos(boolean ninos) {
        this.ninos = ninos;
    }

    public boolean isOtrosPerros() {
        return otrosPerros;
    }

    public void setOtrosPerros(boolean otrosPerros) {
        this.otrosPerros = otrosPerros;
    }

    public boolean isOtrosGatos() {
        return otrosGatos;
    }

    public void setOtrosGatos(boolean otrosGatos) {
        this.otrosGatos = otrosGatos;
    }

    public boolean isExperiencia() {
        return experiencia;
    }

    public void setExperiencia(boolean experiencia) {
        this.experiencia = experiencia;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }
}
