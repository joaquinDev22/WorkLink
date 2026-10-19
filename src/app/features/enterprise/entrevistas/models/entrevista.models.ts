// Entrevista DTO contracts
// POST /api/v1/recruiter/entrevistas
export interface EntrevistaRequestDTO {
  postulacionId: number
  fecha: string // YYYY-MM-DD (@FutureOrPresent)
  hora: string  // HH:mm:ss
  link?: string
}

// GET /api/v1/recruiter/entrevistas
export interface EntrevistaResponseDTO {
  id: number
  candidateName: string
  vacancyTitle: string
  date: string
  time: string
  link?: string
}
