# AdoptaBot · Las Cobras (Java)

Versión Java de la app de adopción responsable: **Spring Boot 4 + Thymeleaf + SQLite**.
Corre en paralelo a la app Python de la raíz del repositorio y **comparte su catálogo**
(`../data/mascotas.json`) y las mismas reglas de negocio (validaciones, estados y puntajes),
así que ambas muestran las mismas mascotas y mensajes.

## Requisitos

- JDK 25
- No hace falta instalar Maven: el proyecto incluye el wrapper (`mvnw` / `mvnw.cmd`)

## Ejecutar

```bash
# Linux / macOS
ADMIN_PASSWORD="cambia-esta-clave" ./mvnw spring-boot:run
```

```powershell
# Windows (PowerShell), desde la carpeta java/
$env:ADMIN_PASSWORD="cambia-esta-clave"; .\mvnw.cmd spring-boot:run
```

Abre <http://localhost:8080>.

`ADMIN_PASSWORD` protege el panel del refugio. Si no se define, el panel queda deshabilitado.

## Páginas

| Ruta | Qué hace |
| --- | --- |
| `/` | Inicio: cifras del refugio, proceso en 4 pasos y mascotas destacadas |
| `/catalogo` | Catálogo con filtros por especie, tamaño, edad, energía y aptitudes |
| `/test` | Test de compatibilidad (8 preguntas, sin IA) y ranking de coincidencias |
| `/solicitud` | Formulario de adopción con validaciones y código de seguimiento `LC-XXXXXX` |
| `/mi-solicitud` | Consulta del estado con código + DNI |
| `/refugio` | Panel del refugio: solicitudes, estados de mascotas y exportación CSV |

El flujo está guiado por una barra de proceso (Conoce → Test → Postula → Entrevista) en
catálogo, test, solicitud y consulta.

## Pruebas

```bash
./mvnw test
```

Cubren el catálogo y el puntaje de compatibilidad, las reglas de las solicitudes
(validaciones, duplicados, cambios de estado, estadísticas) y el render de las páginas.

## Estructura

```
java/
├── src/main/java/com/lascobras/adoptabot/
│   ├── catalogo/      Mascota, Perfil, catálogo y compatibilidad
│   ├── solicitudes/   Validación, SQLite y reglas de estado
│   └── web/           Controladores, filtro de cabeceras y vistas de apoyo
├── src/main/resources/
│   ├── templates/     Plantillas Thymeleaf
│   ├── static/css/    Estilos
│   └── application.properties
└── src/test/java/     Pruebas de catálogo, solicitudes y web
```

## Datos

- Catálogo compartido: `../data/mascotas.json` (lo usa también la app Python).
- Base de datos SQLite propia: `data/adoptabot.db`; se crea sola y está ignorada por git.
  Se puede cambiar con `--adoptabot.db=ruta` o la variable de entorno `ADOPTABOT_DB`.

## Problemas comunes

- **Maven falla en Windows con `PKIX path building failed`**: usa el almacén de
  certificados del sistema.
  `export MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"`
- **El puerto 8080 está ocupado**: detén la app Python/Streamlit u otra instancia y vuelve
  a lanzar, o usa `--server.port=8081`.
- **El panel del refugio dice que falta configurar la contraseña**: define `ADMIN_PASSWORD`
  antes de iniciar la aplicación.
