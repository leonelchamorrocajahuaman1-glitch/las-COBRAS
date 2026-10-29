# Requerimientos del proyecto: AdoptaBot · Las Cobras

## 1. Objetivo del proyecto

Desarrollar una plataforma web de adopción responsable de mascotas para el refugio "Las Cobras", con foco en:
- facilitar la adopción de animales rescatados,
- mejorar la experiencia del usuario al decidir qué mascota adoptar,
- digitalizar el proceso de adopción,
- generar confianza en el refugio,
- apoyar la toma de decisiones con recomendaciones inteligentes,
- crear una experiencia emocional, visual y guiada.

## 2. Alcance del producto

### 2.1 MVP (mínimo viable)
El MVP ya cuenta con funcionalidades clave:
- página de inicio,
- catálogo de mascotas,
- filtros por especie, tamaño y energía,
- test de compatibilidad,
- chat con AdoptaBot,
- solicitud de adopción,
- consulta del estado de la solicitud,
- panel del refugio.

### 2.2 Mejoras v2
Se priorizan las funciones que aumentan conversión y profesionalismo:
- guía interactiva,
- historias de adopciones,
- tarjetas deslizables / match cards,
- autenticación administrativa más robusta,
- digitalización de documentos y consentimiento,
- mejor personalización visual,
- integraciones de seguimiento post-adopción.

## 3. Usuarios objetivo

### 3.1 Adoptantes potenciales
- personas o familias que desean adoptar una mascota,
- personas con poco conocimiento sobre adopción responsable,
- personas que buscan un animal según su estilo de vida,
- personas que necesitan guía, confianza y apoyo emocional.

### 3.2 Personal del refugio
- administradores del refugio,
- personal que revisa solicitudes,
- equipo que mantiene el catálogo y estados,
- personal que necesita exportar información y gestionar adopciones.

## 4. Requerimientos funcionales

### RF-01: Inicio
- El sistema debe mostrar una bienvenida institucional del refugio.
- Debe mostrar estadísticas relevantes del refugio.
- Debe explicar el proceso de adopción en pasos claros.
- Debe promocionar mascotas destacadas.

### RF-02: Catálogo de mascotas
- El sistema debe listar las mascotas disponibles.
- Debe permitir filtrar por especie, edad, tamaño, energía, aptitud para niños y aptitud para departamento.
- Debe mostrar el estado de cada mascota: disponible, en proceso o adoptado.
- Debe mostrar información básica de cada mascota: nombre, edad, historia breve, salud y compatibilidad.

### RF-03: Test de compatibilidad
- El sistema debe permitir responder 8 preguntas sobre estilo de vida.
- Debe calcular una compatibilidad porcentual por mascota.
- Debe mostrar las mejores coincidencias.
- Debe explicar por qué una mascota encaja o no encaja.
- Debe permitir continuar con la solicitud desde el resultado.

### RF-04: Chat con AdoptaBot
- El sistema debe ofrecer una conversación natural con el asistente.
- Debe responder preguntas sobre mascotas, compatibilidad y proceso.
- Debe consultar el catálogo de manera inteligente.
- Debe mostrar pasos o acciones que el usuario está realizando.
- Debe responder con mensajes claros y no inventar información.

### RF-05: Solicitud de adopción
- El usuario debe poder completar un formulario de adopción.
- Debe validar datos obligatorios.
- Debe generar un código de seguimiento único.
- Debe asociar la solicitud con una mascota.
- Debe indicar el estado inicial de la solicitud.

### RF-06: Consulta de mi solicitud
- El usuario debe consultar su solicitud usando código y DNI.
- Debe ver el estado actual de la solicitud.
- Debe ver mensajes o comentarios del refugio.
- Debe entender qué sigue en el proceso.

### RF-07: Panel del refugio
- El administrador debe iniciar sesión con contraseña.
- Debe ver todas las solicitudes.
- Debe revisar el estado de cada solicitud.
- Debe cambiar el estado: recibida, en proceso, aprobada, rechazada, adoptada.
- Debe dejar comentarios al adoptante.
- Debe marcar mascotas como adoptadas.
- Debe exportar solicitudes a CSV.

### RF-08: Historial de adopciones
- El sistema debe mostrar historias de adopciones exitosas.
- Debe presentar algunas fotos y testimonios.
- Debe reforzar la confianza del usuario.

### RF-09: Personaje guía interactivo
- El sistema debe contar con un avatar o personaje guía.
- Debe explicar cada botón y cada paso clave.
- Debe cambiar de expresión según el estado del proceso.
- Debe invitar al usuario a continuar.

### RF-10: Matching visual
- El sistema debe mostrar tarjetas de mascotas con flujo tipo swipe o match.
- Debe permitir marcar opciones como me interesa / no me interesa / guardar.
- Debe permitir comparar algún conjunto de mascotas elegidas.

### RF-11: Documentación digital
- El sistema debe poder registrar un compromiso de adopción.
- Debe permitir guardar documentos y consentimientos.
- Debe ofrecer firma digital o firma aceptada por el usuario.

### RF-12: Seguimiento post-adopción
- El sistema debe registrar el seguimiento después de la adopción.
- Debe permitir enviar mensajes de bienvenida al nuevo hogar.
- Debe permitir registrar seguimiento de salud o adaptación.

## 5. Requerimientos no funcionales

### RNF-01: Seguridad
- Las credenciales del refugio deben protegerse con variables de entorno.
- La app debe evitar exponer contraseñas o claves en el código fuente.
- El panel del refugio debe estar protegido por contraseña.
- Los datos sensibles deben manejarse con criterio.

### RNF-02: Usabilidad
- La app debe ser clara para personas sin experiencia tecnológica.
- Los botones deben tener texto explicativo.
- Las pantallas deben ser legibles, ordenadas y con flujo claro.

### RNF-03: Accesibilidad
- El contenido debe tener contrastes adecuados.
- Debe ser usable en móvil y escritorio.
- Debe respetar tamaños legibles de texto.

### RNF-04: Rendimiento
- Las vistas deben cargarse rápidamente.
- Las acciones del catálogo deben responder sin demoras visibles.
- El chat debe ser fluido y con feedback al usuario.

### RNF-05: Mantenibilidad
- El código debe estar modularizado por páginas, lógica y datos.
- La lógica de compatibilidad debe estar separada de la UI.
- Los datos de mascotas deben estar centralizados.

### RNF-06: Escalabilidad
- El sistema debe permitir crecer en cantidad de mascotas, solicitudes y usuarios.
- La solución debe ser compatible con más datos sin romper la experiencia.

## 6. Requerimientos de UX/UI

### UX-01: Brand y empatía
- La app debe reflejar una marca confiable y cálida.
- Debe sentirse humana, responsable y profesional.

### UX-02: Flujo emocional
- El usuario debe entender que adoptar no es comprar, sino asumir un compromiso serio.
- Debe sentirse guiado, no presionado.

### UX-03: Feedback visual
- Cada acción debe generar una respuesta clara visual.
- Ejemplo: confirmación, progreso, cambio de estado, éxito.

### UX-04: Jerarquía visual
- La información relevante debe destacarse más que la decorativa.
- Debe existir un orden claro de lectura.

### UX-05: Onboarding
- El usuario debe recibir una primera guía útil al entrar a la app.
- Debe entender qué hace cada botón y qué le ofrece el sistema.

## 7. Requerimientos de negocio

### NB-01: Proceso de adopción responsable
- La app debe fomentar adopción consciente y no impulsiva.
- Debe reflejar que la mascota necesita un hogar adecuado.

### NB-02: Diferenciación institucional
- La app debe posicionar al refugio como un espacio serio, responsable y cercano.

### NB-03: Mejora de conversión
- Debe ayudar a convertir visitantes en adoptantes y adoptar en un flujo claro.

### NB-04: Reducción de fricción
- Debe simplificar el proceso de postulación para que no se sienta burocrático ni pesado.

## 8. Historias de usuario

### HU-01: Adoptante encuentra una mascota adecuada
- Como usuario, quiero ver mascotas con información clara para evaluar si encajan con mi hogar.

### HU-02: Adoptante conoce su compatibilidad
- Como usuario, quiero responder un test para saber qué mascota es más compatible conmigo.

### HU-03: Adoptante conversa con la plataforma
- Como usuario, quiero preguntar a la IA sobre la mascota y el proceso sin perder el contexto.

### HU-04: Adoptante postula
- Como usuario, quiero enviar mi solicitud con datos válidos para iniciar el proceso de adopción.

### HU-05: Adoptante consulta estado
- Como usuario, quiero saber en qué etapa va mi solicitud para no sentir incertidumbre.

### HU-06: Administrador gestiona solicitudes
- Como administrador, quiero revisar y actualizar el estado de cada solicitud para gestionar adopciones.

### HU-07: Administrador exporta información
- Como administrador, quiero exportar las solicitudes para trabajar de manera organizada.

### HU-08: Usuario quiere apoyo emocional
- Como usuario, quiero una guía clara que me explique cada paso y me ayude a decidir con seguridad.

## 9. Priorización sugerida

### Prioridad alta
- sesión de test de compatibilidad,
- catálogo de mascotas,
- proceso de solicitud y seguimiento,
- panel del refugio,
- seguridad y variables de entorno,
- flujo básico de chat con IA.

### Prioridad media
- historias de adopción,
- personaje guía interactivo,
- tarjetas tipo match,
- mejor UX visual,
- digitalización de documentos,
- seguimiento post-adopción.

### Prioridad baja
- sonidos,
- animaciones complejas,
- integración social muy avanzada,
- expansión de contenido multimedia.

## 10. Recomendaciones técnicas

### 10.1 Tecnologías recomendadas para seguir desarrollando
- GitHub para control de versiones y trabajo colaborativo,
- Visual Studio Code o Cursor como editor principal,
- GitHub Copilot para acelerar generación de código,
- Streamlit para la interfaz web,
- SQLite para base de datos de demo,
- Python para toda la lógica y datos.

### 10.2 Recomendación de flujo de trabajo
1. Crear una rama por funcionalidad.
2. Mantener un archivo de requisitos actualizado.
3. Trabajar por historias de usuario.
4. Hacer PRs pequeños y revisables.
5. Probar antes de integrar.
6. Documentar cambios en cada entrega.

## 11. Errores a evitar
- construir sin empezar por la experiencia de usuario,
- sumar funciones sin validar la necesidad real,
- hacer un chat IA sin control de seguridad,
- dejar la app sin flujo claro de adopción,
- mezclar documentación, código y diseño sin orden,
- no cuidar la confianza del usuario durante el proceso.

## 12. Conclusión

El proyecto ya tiene una base sólida y funcional, pero la diferencia entre un MVP y una solución profesional está en la experiencia, la confianza y la narración emocional. La prioridad debe ser: mejorar la UX, digitalizar el proceso de adopción, dar una guía hacia el usuario y aumentar la sensación de transparencia y cuidado.

## 13. Siguiente paso recomendado

Crear un backlog organizado en 3 niveles:
- front-end UX/UI,
- lógica del proceso de adopción,
- backend / almacenamiento / seguimiento.

Esto permitirá trabajar el proyecto con disciplina, dividirlo en tareas y hacerlo sostenible para la rama de colaboración.

## 14. Aprobación

Este documento sirve como base de requerimientos para iniciar el desarrollo de la siguiente fase del proyecto.

Fecha de preparación: 2026-10-29
Proyecto: AdoptaBot · Las Cobras
Rama de trabajo: Mayuri
