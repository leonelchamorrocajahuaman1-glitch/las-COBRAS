package com.lascobras.adoptabot.solicitudes;

import java.util.Map;

public record Estadisticas(int solicitudes, Map<String, Integer> porEstado, int adoptadas) {
}
