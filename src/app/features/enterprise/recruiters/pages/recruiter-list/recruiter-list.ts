import { Component, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RecruiterService } from '../../services/recruiter'
import { RecruiterResponseDTO } from '../../models/recruiter.models'
import { RecruiterFormModal } from '../../components/recruiter-modal/recruiter-form-modal'

@Component({
  selector: 'app-recruiter-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RecruiterFormModal],
  templateUrl: './recruiter-list.html',
  styleUrl: './recruiter-list.css'
})
export class RecruiterList implements OnInit {
  protected recruiterService = inject(RecruiterService)

  readonly recruiters = this.recruiterService.recruiters
  readonly isLoading = this.recruiterService.isLoading
  readonly isMutating = this.recruiterService.isMutating

  isModalOpen = signal<boolean>(false)
  searchTerm = signal<string>('')
  selectedArea = signal<string>('TODAS')
  isMobileFilterOpen = signal<boolean>(false)
  recruiterToDelete = signal<RecruiterResponseDTO | null>(null)
  toastMsg = signal<string | null>(null)

  // Lista calculada y filtrada reactivamente
  readonly filteredRecruiters = computed<RecruiterResponseDTO[]>(() => {
    const term = this.searchTerm().trim().toLowerCase()
    const area = this.selectedArea()
    const list = this.recruiters()

    return list.filter((r) => {
      const matchesTerm = !term ||
        r.nombre.toLowerCase().includes(term) ||
        r.apellido.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        (r.area && r.area.toLowerCase().includes(term))

      const matchesArea = area === 'TODAS' || r.area === area

      return matchesTerm && matchesArea
    })
  })

  // Áreas únicas representadas para chips de filtrado
  readonly availableAreas = computed<string[]>(() => {
    const areas = new Set<string>()
    for (const r of this.recruiters()) {
      if (r.area) areas.add(r.area)
    }
    return Array.from(areas)
  })

  ngOnInit(): void {
    this.recruiterService.getRecruiters().subscribe()
  }

  abrirModal(): void {
    this.isModalOpen.set(true)
  }

  onRecruiterSaved(nuevo: RecruiterResponseDTO): void {
    this.mostrarToast(`¡${nuevo.nombre} ${nuevo.apellido} se ha sumado al equipo de reclutamiento!`)
  }

  solicitarBaja(recruiter: RecruiterResponseDTO): void {
    this.recruiterToDelete.set(recruiter)
  }

  cancelarBaja(): void {
    this.recruiterToDelete.set(null)
  }

  confirmarBaja(): void {
    const target = this.recruiterToDelete()
    if (!target) return

    this.recruiterService.eliminarRecruiter(target.recruiterId).subscribe({
      next: () => {
        this.mostrarToast(`El recruiter ${target.nombre} ${target.apellido} fue desvinculado.`)
        this.recruiterToDelete.set(null)
      },
      error: () => {
        this.mostrarToast('No se pudo desvincular al recruiter. Intenta nuevamente.')
        this.recruiterToDelete.set(null)
      }
    })
  }

  getInitials(nombre: string, apellido: string): string {
    const n = nombre ? nombre[0].toUpperCase() : ''
    const a = apellido ? apellido[0].toUpperCase() : ''
    return `${n}${a}` || 'R'
  }

  private mostrarToast(msg: string): void {
    this.toastMsg.set(msg)
    setTimeout(() => {
      if (this.toastMsg() === msg) {
        this.toastMsg.set(null)
      }
    }, 4000)
  }
}
