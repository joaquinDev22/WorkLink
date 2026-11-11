import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ProyectoAdmin } from '../../services/proyecto-admin'
import {
  ESTADO_PROYECTO_CONFIG,
  EstadoProyecto,
  ProyectoResponseDTO,
  formatFechaProyecto
} from '../../models/proyecto.models'
import { ProyectoWorkspacePanel } from '../../components/proyecto-workspace-panel/proyecto-workspace-panel'

@Component({
  imports: [RouterLink, ProyectoWorkspacePanel],
  selector: 'app-mis-proyectos-freelancer',
  styleUrl: './mis-proyectos-freelancer.css',
  templateUrl: './mis-proyectos-freelancer.html'
})
export class MisProyectosFreelancer implements OnInit {
  protected proyectoAdmin = inject(ProyectoAdmin)

  readonly proyectos = this.proyectoAdmin.misProyectos
  readonly isLoading = this.proyectoAdmin.isLoading
  readonly errorCarga = signal<string | null>(null)
  readonly filtroEstado = signal<EstadoProyecto | 'TODOS'>('TODOS')
  readonly proyectoActivoId = signal<number | null>(null)

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly filtrosEstado: Array<EstadoProyecto | 'TODOS'> = [
    'TODOS',
    'EN_PROGRESO',
    'FINALIZADO',
    'CANCELADO'
  ]
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)

  labelEstado(est: EstadoProyecto | 'TODOS'): string {
    return est === 'TODOS' ? 'Todos' : this.estadoConfig[est].label
  }

  readonly proyectosFiltrados = computed<ProyectoResponseDTO[]>(() => {
    const f = this.filtroEstado()
    const list = this.proyectos()
    return f === 'TODOS' ? list : list.filter((p) => p.estado === f)
  })

  readonly proyectoActivo = computed<ProyectoResponseDTO | null>(() => {
    const list = this.proyectosFiltrados()
    if (list.length === 0) return null
    const id = this.proyectoActivoId()
    return list.find((p) => p.proyectoId === id) ?? list[0]
  })

  ngOnInit(): void {
    this.cargarTrabajos()
  }

  cargarTrabajos(): void {
    this.errorCarga.set(null)
    this.proyectoAdmin.getMisProyectosAsignados().subscribe({
      next: (data) => {
        if (data.length > 0 && this.proyectoActivoId() === null) {
          this.proyectoActivoId.set(data[0].proyectoId)
        }
      },
      error: () => {
        this.errorCarga.set('No pudimos cargar tus trabajos freelance asignados.')
      }
    })
  }

  actualizarProyectoEnLista(actualizado: ProyectoResponseDTO): void {
    this.proyectoAdmin.misProyectos.update((list) =>
      list.map((p) => (p.proyectoId === actualizado.proyectoId ? actualizado : p))
    )
  }
}
