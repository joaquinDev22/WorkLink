// Entrevista DTO contracts
// POST /api/v1/recruiter/entrevistas
export interface EntrevistaRequestDTO {
  postulacionId: number
  fecha: string // YYYY-MM-DD (@FutureOrPresent)
  hora: string  // HH:mm
  link?: string
  notas?: string
}

// GET /api/v1/recruiter/entrevistas
export interface EntrevistaResponseDTO {
  id: number
  postulacionId: number
  candidateName: string
  candidateEmail?: string
  vacancyTitle: string
  companyName: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  link: string
  notas?: string
  status: 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA'
}
