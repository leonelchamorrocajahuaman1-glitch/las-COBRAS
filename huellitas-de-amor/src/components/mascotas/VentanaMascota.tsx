import type { Mascota } from '../../types'
import { Modal } from '../ui/Modal'
import { DetalleMascota } from './DetalleMascota'
import { FormularioAdopcion } from './FormularioAdopcion'

export type VistaMascota = 'detalle' | 'formulario'

interface Props {
  mascota: Mascota | null
  vista: VistaMascota
  alCambiarVista: (v: VistaMascota) => void
  alCerrar: () => void
}

/** Una sola ventana para la ficha y el formulario: se puede pasar de uno a otro sin perder el contexto. */
export function VentanaMascota({ mascota, vista, alCambiarVista, alCerrar }: Props) {
  return (
    <Modal
      abierto={Boolean(mascota)}
      alCerrar={alCerrar}
      titulo={mascota ? (vista === 'detalle' ? `Ficha de ${mascota.nombre}` : `Adoptar a ${mascota.nombre}`) : ''}
      ocultarTitulo={vista === 'detalle'}
      claveContenido={mascota ? `${mascota.id}-${vista}` : undefined}
    >
      {mascota &&
        (vista === 'detalle' ? (
          <DetalleMascota mascota={mascota} alAdoptar={() => alCambiarVista('formulario')} />
        ) : (
          <FormularioAdopcion key={mascota.id} mascota={mascota} alVolver={() => alCambiarVista('detalle')} alTerminar={alCerrar} />
        ))}
    </Modal>
  )
}
