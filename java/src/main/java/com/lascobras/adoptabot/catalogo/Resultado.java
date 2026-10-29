package com.lascobras.adoptabot.catalogo;

import java.util.List;

public record Resultado(Mascota mascota, int puntaje, List<String> razones, List<String> alertas) {
}
