import { Component, OnInit, computed, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ProyectoAdmin } from '../../../proyecto-gestion/services/proyecto-admin'
import {
  ESTADO_PROYECTO_CONFIG,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'

@Component({
  imports: [RouterLink],
  selector: 'app-freelancer-finances',
  styleUrl: './freelancer-finances.css',
  templateUrl: './freelancer-finances.html'
})
export class FreelancerFinances implements OnInit {
  protected proyectoAdmin = inject(ProyectoAdmin)

  readonly proyectos = this.proyectoAdmin.misProyectos
  readonly isLoading = this.proyectoAdmin.isLoading
  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)

  readonly finalizados = computed(() =>
    this.proyectos().filter((p) => p.estado === 'FINALIZADO').length
  )

  readonly enProgreso = computed(() =>
    this.proyectos().filter((p) => p.estado === 'EN_PROGRESO').length
  )

  readonly totalEstimadoMax = computed(() =>
    this.proyectos()
      .filter((p) => p.estado === 'FINALIZADO' || p.estado === 'EN_PROGRESO')
      .reduce((acc, p) => acc + (p.presupuestoMax || 0), 0)
  )

  ngOnInit(): void {
    this.proyectoAdmin.getMisProyectosAsignados().subscribe()
  }
}
