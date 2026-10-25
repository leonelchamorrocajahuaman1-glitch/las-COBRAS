"""AdoptaBot en la terminal.

Ejecutar:  python cli.py
"""

from dotenv import load_dotenv

from adoptabot import MENSAJE_BIENVENIDA, AdoptaBot


def main() -> None:
    load_dotenv()
    bot = AdoptaBot()
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
        for parte in bot.responder_stream(texto):
            print(parte, end="", flush=True)
        print("\n")
    print("¡Hasta pronto! 🐾")


if __name__ == "__main__":
    main()
