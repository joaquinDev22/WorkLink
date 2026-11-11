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
import { Paginator } from '../../../../../shared/components/paginator/paginator'

@Component({
  imports: [RouterLink, ProyectoWorkspacePanel, Paginator],
  selector: 'app-mis-proyectos-cliente',
  styleUrl: './mis-proyectos-cliente.css',
  templateUrl: './mis-proyectos-cliente.html'
})
export class MisProyectosCliente implements OnInit {
  protected proyectoAdmin = inject(ProyectoAdmin)

  readonly proyectos = this.proyectoAdmin.misProyectos
  readonly isLoading = this.proyectoAdmin.isLoading
  readonly errorCarga = signal<string | null>(null)
  readonly filtroEstado = signal<EstadoProyecto | 'TODOS'>('TODOS')
  readonly proyectoActivoId = signal<number | null>(null)
  readonly itemsPorPagina = 6
  readonly paginaActual = signal<number>(1)

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly filtrosEstado: Array<EstadoProyecto | 'TODOS'> = [
    'TODOS',
    'BUSCANDO_TALENTO',
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

  readonly proyectosPaginados = computed<ProyectoResponseDTO[]>(() => {
    const list = this.proyectosFiltrados()
    const total = Math.max(1, Math.ceil(list.length / this.itemsPorPagina))
    const page = Math.min(Math.max(1, this.paginaActual()), total)
    const start = (page - 1) * this.itemsPorPagina
    return list.slice(start, start + this.itemsPorPagina)
  })

  seleccionarFiltro(est: EstadoProyecto | 'TODOS'): void {
    this.filtroEstado.set(est)
    this.paginaActual.set(1)
  }

  readonly proyectoActivo = computed<ProyectoResponseDTO | null>(() => {
    const list = this.proyectosFiltrados()
    if (list.length === 0) return null
    const id = this.proyectoActivoId()
    return list.find((p) => p.proyectoId === id) ?? list[0]
  })

  ngOnInit(): void {
    this.cargarProyectos()
  }

  cargarProyectos(): void {
    this.errorCarga.set(null)
    this.proyectoAdmin.getMisProyectosPublicados().subscribe({
      next: (data) => {
        if (data.length > 0 && this.proyectoActivoId() === null) {
          this.proyectoActivoId.set(data[0].proyectoId)
        }
      },
      error: () => {
        this.errorCarga.set('No pudimos cargar tus proyectos publicados.')
      }
    })
  }

  actualizarProyectoEnLista(actualizado: ProyectoResponseDTO): void {
    this.proyectoAdmin.misProyectos.update((list) =>
      list.map((p) => (p.proyectoId === actualizado.proyectoId ? actualizado : p))
    )
  }
}
