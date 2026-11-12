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

export function formatMontoMoneda(monto: number, moneda: string = 'USD'): string {
  const safeAmount = Number.isFinite(monto) ? monto : 0
  const prefix = moneda === 'PESOS' || moneda === 'ARS' ? 'ARS $' : 'USD $'
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(safeAmount)
  return `${prefix}${formatted}`
}

export function formatTotalesPorMoneda(
  pagos: ReadonlyArray<{ monto: number; moneda?: string }>
): string {
  if (!pagos || pagos.length === 0) return formatMontoMoneda(0, 'USD')

  const totales = new Map<'PESOS' | 'USD', number>()
  for (const p of pagos) {
    const monto = Number(p.monto) || 0
    const key = p.moneda === 'PESOS' || p.moneda === 'ARS' ? 'PESOS' : 'USD'
    totales.set(key, (totales.get(key) ?? 0) + monto)
  }

  return Array.from(totales.entries())
    .map(([moneda, total]) => formatMontoMoneda(total, moneda))
    .join(' · ')
}
