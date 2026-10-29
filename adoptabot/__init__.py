try:
    from .bot import AdoptaBot, ErrorAdoptaBot, mensaje_de_error
except ImportError:
    AdoptaBot = None  # type: ignore
    ErrorAdoptaBot = None  # type: ignore
    mensaje_de_error = None  # type: ignore

from .calculadora import calcular_presupuesto
from .catalogo import Perfil, cargar_catalogo, compatibilidad, recomendar
from .prompt import MENSAJE_BIENVENIDA, construir_system_prompt
from .solicitudes import Repositorio, SolicitudInvalida

__all__ = [
    "AdoptaBot",
    "ErrorAdoptaBot",
    "MENSAJE_BIENVENIDA",
    "Perfil",
    "Repositorio",
    "SolicitudInvalida",
    "calcular_presupuesto",
    "cargar_catalogo",
    "compatibilidad",
    "construir_system_prompt",
    "mensaje_de_error",
    "recomendar",
]
