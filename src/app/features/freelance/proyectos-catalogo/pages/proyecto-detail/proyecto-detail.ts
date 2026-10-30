import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { ProyectoCatalog } from '../../services/proyecto-catalog'
import { EstadoProyecto, ProyectoResponseDTO } from '../../../proyecto-gestion/models/proyecto.models'
import { PropuestaModal } from '../../components/propuesta-modal/propuesta-modal'

@Component({
  imports: [RouterLink, PropuestaModal],
  selector: 'app-proyecto-detail',
  styleUrl: './proyecto-detail.css',
  templateUrl: './proyecto-detail.html',
})
export class ProyectoDetail implements OnInit {
  private route = inject(ActivatedRoute)
  private catalogService = inject(ProyectoCatalog)

  proyecto = signal<ProyectoResponseDTO | null>(null)
  isLoading = signal<boolean>(true)
  error = signal<string | null>(null)

  mostrarModalPropuesta = signal<boolean>(false)

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

  formatFecha(fechaStr?: string): string {
    if (!fechaStr) return ''
    const date = new Date(fechaStr.includes('T') ? fechaStr : `${fechaStr}T00:00:00`)
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id')
    if (!idParam) {
      this.error.set('No se especificó un identificador de proyecto.')
      this.isLoading.set(false)
      return
    }

    this.catalogService.getProyectoById(idParam).subscribe({
      next: (data) => {
        if (data) {
          this.proyecto.set(data)
        } else {
          this.error.set('El proyecto solicitado no fue encontrado o ya no está disponible.')
        }
        this.isLoading.set(false)
      },
      error: (err) => {
        console.error('Error al cargar proyecto:', err)
        this.error.set('Ocurrió un error al cargar la información del proyecto.')
        this.isLoading.set(false)
      }
    })
  }
}
