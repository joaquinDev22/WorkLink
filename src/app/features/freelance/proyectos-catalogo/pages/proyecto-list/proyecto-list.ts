import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal
} from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { RouterLink } from '@angular/router'
import { gsap } from 'gsap'
import { ProyectoCatalog } from '../../services/proyecto-catalog'
import {
  ESTADO_PROYECTO_CONFIG,
  ProyectoResponseDTO,
  formatFechaProyecto
} from '../../../proyecto-gestion/models/proyecto.models'
import { Paginator } from '../../../../../shared/components/paginator/paginator'

@Component({
  imports: [RouterLink, NgTemplateOutlet, Paginator],
  selector: 'app-proyecto-list',
  styleUrl: './proyecto-list.css',
  templateUrl: './proyecto-list.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'areaDropdownOpen.set(false)'
  }
})
export class ProyectoList implements OnInit, OnDestroy {
  private hostEl = inject(ElementRef<HTMLElement>)
  protected catalogService = inject(ProyectoCatalog)

  readonly catalogo = this.catalogService.proyectos
  readonly isLoading = this.catalogService.isLoading
  readonly errorCarga = signal<string | null>(null)

  readonly filtroArea = signal<string>('TODOS')
  readonly terminoBusqueda = signal<string>('')
  readonly presupuestoMinFiltro = signal<number | null>(null)
  readonly presupuestoMaxFiltro = signal<number | null>(null)
  readonly skillsSeleccionadas = signal<string[]>([])

  readonly mostrarFiltrosModal = signal<boolean>(false)
  readonly mostrarBuscadorMobile = signal<boolean>(false)
  readonly areaDropdownOpen = signal<boolean>(false)

  readonly itemsPorPagina = 8
  readonly paginaActual = signal<number>(1)

  readonly estadoConfig = ESTADO_PROYECTO_CONFIG
  readonly formatFecha = (f?: string) => formatFechaProyecto(f, false)

  private gsapCtx: gsap.Context | null = null
  private animado = false

  readonly areasDisponibles = computed<string[]>(() => {
    const base = ['Desarrollo Web', 'Backend & APIs', 'Diseño UX/UI', 'Mobile & Cloud', 'Data & IA']
    const delCatalogo = this.catalogo().map((p) => p.area).filter(Boolean)
    return Array.from(new Set([...delCatalogo, ...base]))
  })

  readonly stacksDisponibles = computed<string[]>(() => {
    const counts = new Map<string, number>()
    for (const p of this.catalogo()) {
      for (const s of p.habilidades ?? []) {
        counts.set(s, (counts.get(s) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 12)
  })

  readonly hayFiltrosActivos = computed<boolean>(
    () =>
      this.filtroArea() !== 'TODOS' ||
      this.terminoBusqueda().trim() !== '' ||
      this.presupuestoMinFiltro() !== null ||
      this.presupuestoMaxFiltro() !== null ||
      this.skillsSeleccionadas().length > 0
  )

  readonly proyectosFiltrados = computed<ProyectoResponseDTO[]>(() => {
    const area = this.filtroArea().toLowerCase()
    const termino = this.terminoBusqueda().toLowerCase().trim()
    const minP = this.presupuestoMinFiltro()
    const maxP = this.presupuestoMaxFiltro()
    const reqSkills = this.skillsSeleccionadas().map((s) => s.toLowerCase())

    return this.catalogo().filter((p) => {
      const coincideArea = area === 'todos' || p.area.toLowerCase() === area
      const coincideTexto =
        !termino ||
        (p.nombreProyecto ?? '').toLowerCase().includes(termino) ||
        p.area.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        (p.habilidades ?? []).some((h) => h.toLowerCase().includes(termino))

      const coincideMin = minP === null || p.presupuestoMax >= minP
      const coincideMax = maxP === null || p.presupuestoMin <= maxP

      const projectSkills = (p.habilidades ?? []).map((s) => s.toLowerCase())
      const coincideSkills =
        reqSkills.length === 0 || reqSkills.every((s) => projectSkills.includes(s))

      return coincideArea && coincideTexto && coincideMin && coincideMax && coincideSkills
    })
  })

  readonly totalPaginas = computed(
    () => Math.ceil(this.proyectosFiltrados().length / this.itemsPorPagina) || 1
  )

  readonly proyectosPaginados = computed<ProyectoResponseDTO[]>(() => {
    const pagina = Math.min(Math.max(1, this.paginaActual()), this.totalPaginas())
    const inicio = (pagina - 1) * this.itemsPorPagina
    return this.proyectosFiltrados().slice(inicio, inicio + this.itemsPorPagina)
  })

  constructor() {
    effect(() => {
      const loading = this.isLoading()
      const items = this.proyectosPaginados()
      if (loading || items.length === 0 || this.animado) return

      this.animado = true
      queueMicrotask(() => this.animarTarjetas())
    })
  }

  ngOnInit(): void {
    this.cargarCatalogo()
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  cargarCatalogo(): void {
    this.errorCarga.set(null)
    this.catalogService.getProyectos().subscribe({
      error: () => {
        this.errorCarga.set('No pudimos cargar el catálogo de proyectos. Intenta nuevamente.')
      }
    })
  }

  private animarTarjetas(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.proyecto-card', {
          y: 16,
          autoAlpha: 0,
          duration: 0.38,
          stagger: { amount: 0.24, from: 'start' },
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility'
        })
      })
    }, this.hostEl.nativeElement)
  }

  buscar(valor: string): void {
    this.terminoBusqueda.set(valor.trim())
    this.paginaActual.set(1)
  }

  seleccionarArea(area: string): void {
    this.filtroArea.set(area)
    this.areaDropdownOpen.set(false)
    this.paginaActual.set(1)
  }

  onDocumentClick(event: Event): void {
    if (!this.areaDropdownOpen()) return
    const target = event.target as HTMLElement | null
    if (!target?.closest('[data-area-dropdown]')) {
      this.areaDropdownOpen.set(false)
    }
  }

  actualizarMinPresupuesto(raw: string): void {
    const n = Number(raw)
    this.presupuestoMinFiltro.set(raw === '' || Number.isNaN(n) || n < 0 ? null : n)
    this.paginaActual.set(1)
  }

  actualizarMaxPresupuesto(raw: string): void {
    const n = Number(raw)
    this.presupuestoMaxFiltro.set(raw === '' || Number.isNaN(n) || n <= 0 ? null : n)
    this.paginaActual.set(1)
  }

  toggleSkill(skill: string): void {
    this.skillsSeleccionadas.update((curr) =>
      curr.includes(skill) ? curr.filter((s) => s !== skill) : [...curr, skill]
    )
    this.paginaActual.set(1)
  }

  limpiarFiltros(): void {
    this.filtroArea.set('TODOS')
    this.areaDropdownOpen.set(false)
    this.terminoBusqueda.set('')
    this.presupuestoMinFiltro.set(null)
    this.presupuestoMaxFiltro.set(null)
    this.skillsSeleccionadas.set([])
    this.paginaActual.set(1)
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
