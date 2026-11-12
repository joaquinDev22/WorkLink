import { Component, ElementRef, OnDestroy, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import gsap from 'gsap'
import { EmpresaService } from '../../../empresa-perfil/services/empresa'
import { VacanteService } from '../../../vacantes/services/vacante'
import { RecruiterService } from '../../../recruiters/services/recruiter'
import { DashboardStatsResponseDTO } from '../../../empresa-perfil/models/empresa.models'
import { VacanteResponseDTO } from '../../../vacantes/models/vacante.models'

@Component({
  selector: 'app-empresa-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empresa-dashboard.html',
  styleUrl: './empresa-dashboard.css'
})
export class EmpresaDashboard implements OnInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>)
  private gsapCtx?: gsap.Context
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

  // Vacantes prioritarias ordenadas por urgencia de fecha límite
  readonly vacantesPrioritarias = computed<VacanteResponseDTO[]>(() => {
    return this.vacantesActivas()
      .slice()
      .sort((a, b) => a.finalizacion.localeCompare(b.finalizacion))
      .slice(0, 3)
  })

  // Tecnologías más demandadas en las búsquedas laborales
  readonly topTecnologias = computed<{ nombre: string; count: number; pct: number }[]>(() => {
    const counts: Record<string, number> = {}
    const vacs = this.misVacantes()
    let totalTags = 0

    for (const v of vacs) {
      for (const tag of v.etiquetas) {
        counts[tag] = (counts[tag] || 0) + 1
        totalTags++
      }
    }

    return Object.entries(counts)
      .map(([nombre, count]) => ({
        nombre,
        count,
        pct: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  })

  // Distribución por modalidad
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

  // Ratios de eficiencia únicos
  readonly ratioCarga = computed<string>(() => {
    const recs = this.recruiters().length
    const vacs = this.vacantesActivas().length
    if (recs === 0) return '0.0'
    return (vacs / recs).toFixed(1)
  })

  readonly postulacionesRecibidas = computed<number>(() => this.stats()?.totalPostulaciones ?? 0)
  readonly entrevistasProgramadas = computed<number>(() => this.stats()?.entrevistasPendientes ?? 0)
  readonly contratacionesRealizadas = computed<number>(() => this.stats()?.contratacionesEfectuadas ?? 0)
  readonly filtroTecnico = computed<number>(() => Math.round(this.postulacionesRecibidas() * 0.5))

  readonly tasaEfectividad = computed<string>(() => {
    const post = this.postulacionesRecibidas()
    const cont = this.contratacionesRealizadas()
    if (post === 0) return '0.0'
    return ((cont / post) * 100).toFixed(1)
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
        this.animateKpis()
      },
      error: () => {
        this.isLoading.set(false)
      }
    })
  }

  private animateKpis(): void {
    requestAnimationFrame(() => {
      this.gsapCtx?.revert()
      this.gsapCtx = gsap.context(() => {
        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.from('.dash-kpi', {
            y: 12,
            opacity: 0,
            duration: 0.35,
            stagger: 0.06,
            ease: 'power3.out',
            clearProps: 'transform,opacity'
          })
        })
      }, this.host.nativeElement)
    })
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  diasRestantes(finalizacion: string): number {
    const diff = new Date(finalizacion).getTime() - new Date(this.todayDate).getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }
}
