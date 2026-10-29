"""Pruebas unitarias para el calculador de presupuesto de tenencia responsable."""

import unittest
from adoptabot.calculadora import calcular_presupuesto


class TestCalculadoraPresupuesto(unittest.TestCase):
    def test_calculo_basico_perro_mediano(self):
        res = calcular_presupuesto("perro", "mediano", "estándar", incluye_fondo_emergencia=True)
        self.assertEqual(res["especie"], "perro")
        self.assertEqual(res["tamaño"], "mediano")
        self.assertEqual(res["desglose_mensual"]["Alimentación"], 140)
        self.assertGreater(res["total_mensual"], 0)
        self.assertEqual(res["total_anual"], round(res["total_mensual"] * 12, 2))

    def test_calculo_gato_sin_fondo_emergencia(self):
        res = calcular_presupuesto("gato", "pequeño", "premium", incluye_fondo_emergencia=False)
        self.assertEqual(res["especie"], "gato")
        self.assertEqual(res["desglose_mensual"]["Fondo de imprevistos/emergencias"], 0.0)
        self.assertEqual(res["desglose_mensual"]["Alimentación"], 110)

    def test_normalizacion_de_valores_invalidos(self):
        res = calcular_presupuesto("loro", "gigante", "desconocida")
        # Debe normalizar a valores seguros por defecto
        self.assertEqual(res["especie"], "perro")
        self.assertEqual(res["tamaño"], "mediano")
        self.assertEqual(res["calidad_alimento"], "estándar")


if __name__ == "__main__":
    unittest.main()
