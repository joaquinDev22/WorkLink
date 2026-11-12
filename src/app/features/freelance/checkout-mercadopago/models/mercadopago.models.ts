// MercadoPago & Pagos DTO contracts
export type Moneda = 'PESOS' | 'USD'
export type MedioDePago = 'TARJETA' | 'BILLETERA_VIRTUAL'

// POST /api/v1/freelance/proyectos/{proyectoId}/pagos
// GET /api/v1/freelance/proyectos/{proyectoId}/pagos
export interface PagosResponseDTO {
  pagoId: number
  moneda: Moneda
  monto: number
  medioDePago: MedioDePago
  proyectoId: number
  mpPaymentId: string | null   // id de la operación en Mercado Pago (RF31)
}

// POST /api/v1/freelance/proyectos/{proyectoId}/pagos/checkout
export interface MercadoPagoPreferenceResponseDTO {
  preferenceId: string
  initPoint: string
  sandboxInitPoint: string
}

export const MEDIO_PAGO_CONFIG: Record<
  MedioDePago,
  { label: string; description: string; badgeClass: string }
> = {
  BILLETERA_VIRTUAL: {
    label: 'MercadoPago / Billetera virtual',
    description: 'Checkout Pro con dinero en cuenta, débito o crédito.',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200'
  },
  TARJETA: {
    label: 'Tarjeta de crédito o débito',
    description: 'Registro directo de pago con tarjeta habilitada.',
    badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200'
  }
}

// D6: WorkLink opera solo en pesos (Mercado Pago Checkout Pro cobra en ARS). La moneda guardada se ignora
// a propósito: registros viejos con 'USD' se muestran en pesos para no mezclar monedas en pantalla.
export function formatMontoMoneda(monto: number, _moneda?: string): string {
  const safeAmount = Number.isFinite(Number(monto)) ? Number(monto) : 0
  return `$ ${new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(safeAmount)}`
}

export function formatTotalesPorMoneda(pagos: ReadonlyArray<{ monto: number; moneda?: string }>): string {
  return formatMontoMoneda((pagos ?? []).reduce((acc, p) => acc + (Number(p.monto) || 0), 0))
}
