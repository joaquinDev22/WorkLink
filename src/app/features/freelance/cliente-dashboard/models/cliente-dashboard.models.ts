// ClientDashboard DTO contracts
// GET /api/v1/client/dashboard
export interface ClientDashboardResponseDTO {
  activeProjects: number
  completedProjects: number
  totalSpent: number
  pendingProposals: number
}

// GET / PUT /api/v1/client/me
export interface ClientProfileRequestDTO {
  firstName: string
  lastName: string
  phoneNumber: string
  country: string
  fechaNacimiento: string // YYYY-MM-DD
}

export interface ClientProfileResponseDTO {
  clienteId: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  country: string
  fechaNacimiento: string // YYYY-MM-DD
  perfilId: number
  username: string
}
