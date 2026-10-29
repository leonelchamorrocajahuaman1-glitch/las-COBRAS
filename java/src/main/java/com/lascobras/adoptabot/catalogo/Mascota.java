package com.lascobras.adoptabot.catalogo;

public record Mascota(
        int id,
        String nombre,
        String especie,
        String sexo,
        String edad,
        String tamano,
        String energia,
        String vacunas,
        boolean esterilizado,
        boolean aptoNinos,
        boolean aptoDepartamento,
        boolean convivePerros,
        boolean conviveGatos,
        boolean requiereExperiencia,
        String idealPara,
        String historia) {
}
