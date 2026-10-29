package com.lascobras.adoptabot.web;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.lascobras.adoptabot.catalogo.CatalogoService;
import com.lascobras.adoptabot.catalogo.Mascota;
import com.lascobras.adoptabot.solicitudes.EstadoMascota;

/** Mascota del catálogo con su estado actual, lista para pintar en la web. */
public record MascotaVista(Mascota mascota, EstadoMascota estado) {

    public static List<MascotaVista> listar(List<Mascota> mascotas, Map<Integer, EstadoMascota> estados) {
        return mascotas.stream()
                .map(m -> new MascotaVista(m, estados.getOrDefault(m.id(), EstadoMascota.DISPONIBLE)))
                .toList();
    }

    public String emoji() {
        return CatalogoService.EMOJI_ESPECIE.getOrDefault(mascota.especie(), "🐾");
    }

    public String sexo() {
        return switch (mascota.sexo()) {
            case "macho" -> "♂";
            case "hembra" -> "♀";
            default -> "";
        };
    }

    public String etapa() {
        return capitalizar(CatalogoService.etapa(mascota));
    }

    public String tamano() {
        return capitalizar(CatalogoService.tamanoBase(mascota));
    }

    public String etiquetaEstado() {
        return estado.etiqueta();
    }

    /** Con quién puede convivir, o el aviso de que prefiere ser el único animal. */
    public String convive() {
        List<String> companias = new ArrayList<>();
        if (mascota.aptoNinos()) {
            companias.add("niños");
        }
        if (mascota.convivePerros()) {
            companias.add("perros");
        }
        if (mascota.conviveGatos()) {
            companias.add("gatos");
        }
        return companias.isEmpty() ? "prefiere ser el único" : String.join(", ", companias);
    }

    public boolean adoptado() {
        return estado == EstadoMascota.ADOPTADO;
    }

    public boolean enProceso() {
        return estado == EstadoMascota.EN_PROCESO;
    }

    private static String capitalizar(String texto) {
        if (texto.isEmpty()) {
            return texto;
        }
        return texto.substring(0, 1).toUpperCase(Locale.ROOT) + texto.substring(1);
    }
}
