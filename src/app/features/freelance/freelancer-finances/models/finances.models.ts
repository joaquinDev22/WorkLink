// FreelancerFinances & Transaction DTO contracts
// GET /api/v1/freelancer/finances
export interface FreelancerFinancesResponseDTO {
  balance: number
  pending: number
  withdrawn: number
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
