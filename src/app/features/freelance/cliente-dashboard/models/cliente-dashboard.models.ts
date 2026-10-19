// ClientDashboard DTO contracts
// GET /api/v1/client/dashboard
export interface ClientDashboardResponseDTO {
  activeProjects: number
  completedProjects: number
  totalSpent: number
  pendingProposals: number
}
