export type Especie = 'perro' | 'gato' | 'conejo'
export type Sexo = 'macho' | 'hembra'
export type Tamano = 'pequeño' | 'mediano' | 'grande'
export type EstadoAdopcion = 'disponible' | 'adoptado'
export type Etapa = 'cachorro' | 'joven' | 'adulto' | 'senior'

export interface Foto {
  /** Identificador de la foto en Unsplash (images.unsplash.com/<id>) */
  unsplashId: string
  alt: string
}

export interface Mascota {
  id: string
  nombre: string
  especie: Especie
  sexo: Sexo
  /** Edad en meses: permite ordenar y filtrar por etapa de vida */
  edadMeses: number
  tamano: Tamano
  ubicacion: string
  descripcion: string
  historia: string
  personalidad: string
  rasgos: string[]
  vacunas: string
  esterilizado: boolean
  desparasitado: boolean
  requisitos: string[]
  estado: EstadoAdopcion
  destacada?: boolean
  foto: Foto
}

export interface Historia {
  id: string
  mascota: string
  familia: string
  ciudad: string
  fecha: string
  texto: string
  foto: Foto
}

export interface Testimonio {
  nombre: string
  ciudad: string
  adopto: string
  texto: string
}
