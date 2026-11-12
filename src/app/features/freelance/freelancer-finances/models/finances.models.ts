// FreelancerFinances & Transaction DTO contracts
// GET /api/v1/freelancer/finances
export interface FreelancerFinancesResponseDTO {
  balance: number
  pending: number
  withdrawn?: number
  totalEarnings?: number
}

// GET /api/v1/freelancer/transactions
export interface FreelancerTransactionResponseDTO {
  id: number
  currency: string
  amount: number
  paymentMethod: string
  projectId: number
  projectTitle: string
}

// GET / PUT /api/v1/freelancer/medios-cobro (WL-40)
export type TipoMedioCobro = 'TRANSFERENCIA' | 'MERCADOPAGO'

export interface MedioCobroRequestDTO {
  tipo: TipoMedioCobro
  titular: string
  documentoTitular?: string | null
  cbuCvu?: string | null
  alias?: string | null
  mercadoPagoEmail?: string | null
}

export interface MedioCobroResponseDTO {
  id: number
  freelancerId: number
  tipo: TipoMedioCobro
  titular: string
  documentoTitular?: string | null
  cbuCvu?: string | null
  alias?: string | null
  mercadoPagoEmail?: string | null
  updatedAt?: string
}
