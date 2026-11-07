import { Component, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { VacanteService } from '../../services/vacante'
import { VacanteResponseDTO } from '../../models/vacante.models'
import { Auth } from '../../../../../core/auth/services/auth'

@Component({
  selector: 'app-vacante-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vacante-admin-list.html',
  styleUrl: './vacante-admin-list.css'
})
export class VacanteAdminList implements OnInit {
  protected vacanteService = inject(VacanteService)
  protected auth = inject(Auth)

  readonly misVacantes = this.vacanteService.misVacantes
  readonly isLoading = this.vacanteService.isLoading
  readonly isMutating = this.vacanteService.isMutating

  // Control de rol: los postulantes solo son gestionados por RECRUITER
  readonly esRecruiter = computed(() => this.auth.session()?.rol === 'RECRUITER')

  searchTerm = signal<string>('')
  selectedModalidad = signal<string>('TODAS')
  isMobileFilterOpen = signal<boolean>(false)
  vacanteToDelete = signal<VacanteResponseDTO | null>(null)
  toastMsg = signal<string | null>(null)

  readonly todayDate = new Date().toISOString().split('T')[0]

  // Lista calculada y filtrada reactivamente
  readonly filteredVacantes = computed<VacanteResponseDTO[]>(() => {
    const term = this.searchTerm().trim().toLowerCase()
    const mod = this.selectedModalidad()
    const list = this.misVacantes()

    return list.filter((v) => {
      const matchesTerm = !term ||
        v.puesto.toLowerCase().includes(term) ||
        (v.ubicacion && v.ubicacion.toLowerCase().includes(term)) ||
        v.etiquetas.some((t) => t.toLowerCase().includes(term))

      const matchesMod = mod === 'TODAS' || v.tipoUbicacion === mod

      return matchesTerm && matchesMod
    })
  })

  // Conteo de vacantes activas según fecha de finalización
  readonly vacantesActivasCount = computed<number>(() => {
    return this.misVacantes().filter((v) => v.finalizacion >= this.todayDate).length
  })

  // Paginación reactiva
  readonly currentPage = signal<number>(1)
  readonly pageSize = signal<number>(5)

  readonly totalPages = computed<number>(() => {
    return Math.max(1, Math.ceil(this.filteredVacantes().length / this.pageSize()))
  })

  readonly paginatedVacantes = computed<VacanteResponseDTO[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize()
    return this.filteredVacantes().slice(start, start + this.pageSize())
  })

  readonly rangeStart = computed<number>(() => {
    return this.filteredVacantes().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  })

  readonly rangeEnd = computed<number>(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredVacantes().length)
  })

  readonly pagesList = computed<number[]>(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  })

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1)
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1)
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(size)
    this.currentPage.set(1)
  }

  onFilterChange(): void {
    this.currentPage.set(1)
  }

  ngOnInit(): void {
    this.vacanteService.getMisVacantes().subscribe()
  }

  isActiva(finalizacion: string): boolean {
    return finalizacion >= this.todayDate
  }

  solicitarBaja(v: VacanteResponseDTO): void {
    this.vacanteToDelete.set(v)
  }

  cancelarBaja(): void {
    this.vacanteToDelete.set(null)
  }

  confirmarBaja(): void {
    const target = this.vacanteToDelete()
    if (!target) return

    this.vacanteService.eliminarVacante(target.vacanteId).subscribe({
      next: () => {
        this.mostrarToast(`La vacante "${target.puesto}" fue dada de baja.`)
        this.vacanteToDelete.set(null)
      },
      error: () => {
        this.mostrarToast('No se pudo eliminar la vacante. Intenta nuevamente.')
        this.vacanteToDelete.set(null)
      }
    })
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
