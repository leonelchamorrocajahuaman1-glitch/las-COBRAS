"""AdoptaBot en la terminal.

Ejecutar:  python cli.py
"""

from dotenv import load_dotenv

from adoptabot import MENSAJE_BIENVENIDA, AdoptaBot, Repositorio, mensaje_de_error


def main() -> None:
    load_dotenv()
    bot = AdoptaBot(estado_de=Repositorio().estado_mascota)
    print(f"\nAdoptaBot: {MENSAJE_BIENVENIDA}\n")
    print("(escribe 'salir' para terminar)\n")
    while True:
        try:
            texto = input("Tú: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not texto:
            continue
        if texto.lower() in {"salir", "exit", "quit"}:
            break
        print("AdoptaBot: ", end="", flush=True)
        try:
            for tipo, dato in bot.conversar(texto):
                print(dato if tipo == "texto" else f"\n  ({dato})\n", end="", flush=True)
        except Exception as e:
            print(mensaje_de_error(e), end="")
        print("\n")
    print("¡Hasta pronto! 🐾")


if __name__ == "__main__":
    main()
