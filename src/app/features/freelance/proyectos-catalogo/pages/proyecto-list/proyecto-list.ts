import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { ProyectoCatalog } from '../../services/proyecto-catalog'
import { EstadoProyecto, ProyectoResponseDTO } from '../../../proyecto-gestion/models/proyecto.models'
import { RouterLink } from '@angular/router'
import { NgTemplateOutlet } from '@angular/common'

@Component({
  imports: [RouterLink, NgTemplateOutlet],
  selector: 'app-proyecto-list',
  styleUrl: './proyecto-list.css',
  templateUrl: './proyecto-list.html',
})
export class ProyectoList implements OnInit {
  protected catalogService = inject(ProyectoCatalog)

  catalogo = signal<ProyectoResponseDTO[]>([])
  filtroArea = signal<string>('TODOS')
  terminoBusqueda = signal('')
  isLoading = signal<boolean>(true)

  mostrarFiltrosModal = signal<boolean>(false)
  mostrarBuscadorMobile = signal<boolean>(false)

  readonly itemsPorPagina = 10
  paginaActual = signal<number>(1)

  readonly totalPaginas = computed(() => 
    Math.ceil(this.proyectosFiltrados().length / this.itemsPorPagina) || 1
  )

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  proyectosPaginados = computed(() => {
    const total = this.totalPaginas()
    const pagina = Math.min(Math.max(1, this.paginaActual()), total)
    const inicio = (pagina - 1) * this.itemsPorPagina
    return this.proyectosFiltrados().slice(inicio, inicio + this.itemsPorPagina)
  })

  readonly estadoConfig: Record<EstadoProyecto, { label: string, badgeClass: string }> = {
    BUSCANDO_TALENTO: {
      label: 'Buscando talento',
      badgeClass: 'bg-emerald-400/40 text-green-600 shadow-sm shadow-emerald-300'
    },
    EN_PROGRESO: {
      label: 'En progreso',
      badgeClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
    },
    FINALIZADO: {
      label: 'Finalizado',
      badgeClass: 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
    },
    CANCELADO: {
      label: 'Cancelado',
      badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
    }
  }

  // Formateador de fecha nativo en español (ej: "28 oct 2026")
  formatFecha(fechaStr?: string): string {
    if (!fechaStr) return ''
    const date = new Date(fechaStr.includes('T') ? fechaStr : `${fechaStr}T00:00:00`)
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  proyectosFiltrados = computed(() => {
    const area = this.filtroArea().toLowerCase()
    const termino = this.terminoBusqueda().toLowerCase().trim()

    return this.catalogo().filter(p => {
      const coincideArea = !area || area === 'todos' || p.area.toLowerCase().includes(area)
      const coincideTexto = !termino || 
        p.nombreProyecto.toLowerCase().includes(termino) || 
        p.descripcion.toLowerCase().includes(termino)

      return coincideArea && coincideTexto
    })
  })

  ngOnInit(): void {
    this.catalogService.getProyectos().subscribe({
      next: (data) => {
        this.catalogo.set(data)
        this.isLoading.set(false)
      },
      error: (e) => {
        console.error('No hay proyectos cargados', e)
        this.isLoading.set(false)
      }
    })
  }

  buscar(texto: string): void {
    this.terminoBusqueda.set(texto)
    this.paginaActual.set(1)
  }
}
