package com.lascobras.adoptabot.catalogo;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Catálogo de mascotas: carga, filtros y cálculo de compatibilidad. */
@Service
public class CatalogoService {

    public static final List<String> TAMANOS = List.of("pequeño", "mediano", "grande");
    public static final List<String> ETAPAS = List.of("cachorro", "adulto", "senior");
    public static final List<String> NIVELES = List.of("baja", "media", "alta");
    public static final List<String> VIVIENDAS = List.of("departamento", "casa", "casa_patio");
    public static final Map<String, String> EMOJI_ESPECIE = Map.of("perro", "🐶", "gato", "🐱");

    private static final Map<String, Integer> NIVEL = Map.of("baja", 0, "media", 1, "alta", 2);
    private static final Pattern EDAD = Pattern.compile("(\\d+)\\s*(año|mes)");

    private final List<Mascota> mascotas;

    @Autowired
    public CatalogoService(@Value("${adoptabot.catalogo:../data/mascotas.json}") String ruta) {
        this(Path.of(ruta));
    }

    public CatalogoService(Path ruta) {
        this.mascotas = cargar(ruta);
    }

    public static List<Mascota> cargar(Path ruta) {
        try (Reader lector = Files.newBufferedReader(ruta, StandardCharsets.UTF_8)) {
            JsonNode raiz = new JsonMapper().readTree(lector);
            List<Mascota> lista = new ArrayList<>();
            for (JsonNode nodo : raiz.values()) {
                lista.add(new Mascota(
                        nodo.get("id").asInt(),
                        texto(nodo, "nombre"),
                        texto(nodo, "especie"),
                        texto(nodo, "sexo"),
                        texto(nodo, "edad"),
                        texto(nodo, "tamaño"),
                        texto(nodo, "energia"),
                        texto(nodo, "vacunas"),
                        bool(nodo, "esterilizado"),
                        bool(nodo, "apto_ninos"),
                        bool(nodo, "apto_departamento"),
                        bool(nodo, "convive_perros"),
                        bool(nodo, "convive_gatos"),
                        bool(nodo, "requiere_experiencia"),
                        texto(nodo, "ideal_para"),
                        texto(nodo, "historia")));
            }
            return List.copyOf(lista);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer el catálogo en " + ruta.toAbsolutePath(), e);
        }
    }

    private static String texto(JsonNode nodo, String campo) {
        JsonNode valor = nodo.get(campo);
        return valor == null || valor.isNull() ? "" : valor.asString();
    }

    private static boolean bool(JsonNode nodo, String campo) {
        JsonNode valor = nodo.get(campo);
        return valor != null && valor.asBoolean(false);
    }

    public List<Mascota> todas() {
        return mascotas;
    }

    public Optional<Mascota> porId(int id) {
        return mascotas.stream().filter(m -> m.id() == id).findFirst();
    }

    /** Minúsculas y sin tildes, para comparar nombres escritos de cualquier forma. */
    public static String normalizar(String texto) {
        if (texto == null) {
            return "";
        }
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .strip()
                .toLowerCase(Locale.ROOT);
    }

    /** Convierte textos como "2 años", "1 año" o "4 meses" a meses. */
    public static int edadEnMeses(String edad) {
        Matcher coincidencia = EDAD.matcher(normalizar(edad).replace("ano", "año"));
        if (!coincidencia.find()) {
            return 0;
        }
        int cantidad = Integer.parseInt(coincidencia.group(1));
        return "año".equals(coincidencia.group(2)) ? cantidad * 12 : cantidad;
    }

    public static String etapa(Mascota mascota) {
        int meses = edadEnMeses(mascota.edad());
        if (meses < 12) {
            return "cachorro";
        }
        return meses >= 84 ? "senior" : "adulto";
    }

    /** "grande (de adulto)" -> "grande". */
    public static String tamanoBase(Mascota mascota) {
        String[] partes = normalizar(mascota.tamano()).split("\\s+");
        return partes[0].replace("pequeno", "pequeño");
    }

    public Optional<Mascota> buscarPorNombre(String nombre) {
        String objetivo = normalizar(nombre);
        return mascotas.stream().filter(m -> normalizar(m.nombre()).equals(objetivo)).findFirst();
    }

    /** Devuelve las mascotas que cumplen todos los filtros indicados (null = sin filtro). */
    public static List<Mascota> filtrar(
            List<Mascota> catalogo,
            String especie,
            String tamano,
            String energia,
            String etapaVida,
            Boolean aptoNinos,
            Boolean aptoDepartamento) {
        List<Mascota> resultado = new ArrayList<>();
        for (Mascota m : catalogo) {
            if (especie != null && !especie.equals(m.especie())) {
                continue;
            }
            if (tamano != null && !tamano.equals(tamanoBase(m))) {
                continue;
            }
            if (energia != null && !energia.equals(m.energia())) {
                continue;
            }
            if (etapaVida != null && !etapaVida.equals(etapa(m))) {
                continue;
            }
            if (aptoNinos != null && m.aptoNinos() != aptoNinos) {
                continue;
            }
            if (aptoDepartamento != null && m.aptoDepartamento() != aptoDepartamento) {
                continue;
            }
            resultado.add(m);
        }
        return resultado;
    }

    /** Puntaje de 0 a 100 de qué tan bien encaja una mascota con un perfil, con sus motivos. */
    public static Resultado compatibilidad(Mascota mascota, Perfil perfil) {
        int puntaje = 100;
        List<String> razones = new ArrayList<>();
        List<String> alertas = new ArrayList<>();
        boolean esPerro = "perro".equals(mascota.especie());
        String tam = tamanoBase(mascota);
        int energia = NIVEL.getOrDefault(mascota.energia(), 1);
        int actividad = NIVEL.getOrDefault(perfil.getActividad(), 1);

        if (EMOJI_ESPECIE.containsKey(perfil.getEspecie()) && !mascota.especie().equals(perfil.getEspecie())) {
            return new Resultado(mascota, 0, List.of(), List.of("Buscas un " + perfil.getEspecie()));
        }

        // Espacio
        if ("departamento".equals(perfil.getVivienda())) {
            if (mascota.aptoDepartamento()) {
                razones.add("Se adapta bien a vivir en departamento");
            } else {
                puntaje -= "grande".equals(tam) ? 35 : 20;
                alertas.add("Necesita más espacio que un departamento");
            }
        } else if ("casa_patio".equals(perfil.getVivienda()) && esPerro && energia >= 1) {
            razones.add("Tendrá un patio para correr y jugar");
        }

        // Energía vs. estilo de vida
        int diferencia = Math.abs(energia - actividad);
        if (diferencia == 0) {
            razones.add("Su energía (" + mascota.energia() + ") coincide con tu ritmo de vida");
        } else {
            puntaje -= 15 * diferencia;
            if (energia > actividad) {
                alertas.add("Tiene más energía de la que tu rutina le permitiría gastar");
            } else {
                alertas.add("Es más tranquilo que tu ritmo: quizá no te acompañe en todo");
            }
        }

        // Tiempo a solas
        if (esPerro && perfil.getHorasFuera() >= 8) {
            puntaje -= energia == 2 ? 20 : 10;
            alertas.add("Pasaría " + perfil.getHorasFuera()
                    + " h solo: los perros necesitan compañía y paseos");
        }
        if ("cachorro".equals(etapa(mascota)) && perfil.getHorasFuera() >= 6) {
            puntaje -= 15;
            alertas.add("Es cachorro: necesita mucha atención y educación diaria");
        }
        if (!esPerro && perfil.getHorasFuera() >= 8) {
            razones.add("Los gatos toleran mejor quedarse solos durante la jornada");
        }

        // Convivencia
        if (perfil.isNinos()) {
            if (mascota.aptoNinos()) {
                razones.add("Convive bien con niños");
            } else {
                puntaje -= 30;
                alertas.add("No es ideal para un hogar con niños");
            }
        }
        if (perfil.isOtrosPerros()) {
            if (mascota.convivePerros()) {
                razones.add("Se lleva bien con otros perros");
            } else {
                puntaje -= 30;
                alertas.add("No convive bien con perros");
            }
        }
        if (perfil.isOtrosGatos()) {
            if (mascota.conviveGatos()) {
                razones.add("Se lleva bien con otros gatos");
            } else {
                puntaje -= 30;
                alertas.add("No convive bien con gatos");
            }
        }

        // Experiencia
        if (mascota.requiereExperiencia() && !perfil.isExperiencia()) {
            puntaje -= 20;
            alertas.add("Conviene que lo adopte alguien con experiencia");
        } else if (!mascota.requiereExperiencia() && !perfil.isExperiencia()) {
            razones.add("Es ideal para quien adopta por primera vez");
        }

        // Información médica (no resta puntos, solo informa)
        if (!normalizar(mascota.vacunas()).contains("completa")) {
            alertas.add("Vacunas: " + mascota.vacunas());
        }

        return new Resultado(mascota, Math.max(0, Math.min(100, puntaje)), List.copyOf(razones),
                List.copyOf(alertas));
    }

    public List<Resultado> recomendar(Perfil perfil, int n, Set<Integer> excluirIds) {
        return recomendar(mascotas, perfil, n, excluirIds);
    }

    /** Las `n` mascotas más compatibles con el perfil, de mayor a menor puntaje. */
    public static List<Resultado> recomendar(
            List<Mascota> catalogo, Perfil perfil, int n, Set<Integer> excluirIds) {
        Set<Integer> excluidos = excluirIds == null ? Set.of() : excluirIds;
        return catalogo.stream()
                .filter(m -> !excluidos.contains(m.id()))
                .map(m -> compatibilidad(m, perfil))
                .filter(r -> r.puntaje() > 0)
                .sorted(Comparator.comparingInt(Resultado::puntaje).reversed()
                        .thenComparing(r -> r.mascota().nombre()))
                .limit(n)
                .toList();
    }
}
