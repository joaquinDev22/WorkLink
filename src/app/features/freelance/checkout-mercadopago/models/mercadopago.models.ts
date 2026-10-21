// MercadoPago & Pagos DTO contracts
export type Moneda = 'PESOS' | 'USD'
export type MedioDePago = 'TARJETA' | 'BILLETERA_VIRTUAL'

// POST /api/v1/freelance/proyectos/{proyectoId}/pagos
export interface PagosRequestDTO {
  moneda: Moneda
  monto: number
  medioDePago: MedioDePago
}

// GET /api/v1/freelance/proyectos/{proyectoId}/pagos
export interface PagosResponseDTO {
  pagoId: number
  moneda: Moneda
  monto: number
  medioDePago: MedioDePago
  proyectoId: number
}

// POST /api/v1/freelance/proyectos/{proyectoId}/pagos/checkout
export interface MercadoPagoPreferenceResponseDTO {
  preferenceId: string
  initPoint: string
  sandboxInitPoint: string
}
