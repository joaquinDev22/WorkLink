import { Component, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { EmpresaService } from '../../../empresa-perfil/services/empresa'
import { VacanteService } from '../../../vacantes/services/vacante'
import { RecruiterService } from '../../../recruiters/services/recruiter'
import { DashboardStatsResponseDTO, EmpresaResponseDTO } from '../../../empresa-perfil/models/empresa.models'
import { VacanteResponseDTO } from '../../../vacantes/models/vacante.models'
import { RecruiterResponseDTO } from '../../../recruiters/models/recruiter.models'

@Component({
  selector: 'app-empresa-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empresa-dashboard.html',
  styleUrl: './empresa-dashboard.css'
})
export class EmpresaDashboard implements OnInit {
  protected empresaService = inject(EmpresaService)
  protected vacanteService = inject(VacanteService)
  protected recruiterService = inject(RecruiterService)

  readonly empresa = this.empresaService.empresaActual
  readonly misVacantes = this.vacanteService.misVacantes
  readonly recruiters = this.recruiterService.recruiters

  readonly stats = signal<DashboardStatsResponseDTO | null>(null)
  readonly isLoading = signal<boolean>(true)

  readonly todayDate = new Date().toISOString().split('T')[0]

  // Vacantes activas según fecha límite
  readonly vacantesActivas = computed<VacanteResponseDTO[]>(() => {
    return this.misVacantes().filter(v => v.finalizacion >= this.todayDate)
  })

  // Conteo de distribución por modalidad
  readonly distribucionModalidad = computed(() => {
    const total = this.misVacantes().length || 1
    const remoto = this.misVacantes().filter(v => v.tipoUbicacion === 'REMOTO').length
    const hibrido = this.misVacantes().filter(v => v.tipoUbicacion === 'HIBRIDO').length
    const presencial = this.misVacantes().filter(v => v.tipoUbicacion === 'PRESENCIAL').length

    return {
      remoto,
      remotoPct: Math.round((remoto / total) * 100),
      hibrido,
      hibridoPct: Math.round((hibrido / total) * 100),
      presencial,
      presencialPct: Math.round((presencial / total) * 100)
    }
  })

  // Últimas 3 vacantes para el panel de actividad
  readonly ultimasVacantes = computed<VacanteResponseDTO[]>(() => {
    return this.misVacantes().slice(0, 3)
  })

  ngOnInit(): void {
    this.cargarDatos()
  }

  cargarDatos(): void {
    this.isLoading.set(true)
    this.empresaService.getMiEmpresa().subscribe()
    this.vacanteService.getMisVacantes().subscribe()
    this.recruiterService.getRecruiters().subscribe()

    this.empresaService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data)
        this.isLoading.set(false)
      },
      error: () => {
        this.isLoading.set(false)
      }
    })
  }

  isActiva(finalizacion: string): boolean {
    return finalizacion >= this.todayDate
  }
}
