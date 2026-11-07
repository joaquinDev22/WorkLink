import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { VacanteCard } from '../../components/vacante-card/vacante-card'
import { PostulacionModal } from '../../components/postulacion-modal/postulacion-modal'
import { VacanteService } from '../../services/vacante'
import { ModalidadTrabajo, PostulacionResponseDTO, VacanteResponseDTO } from '../../models/vacante.models'

@Component({
  imports: [VacanteCard, PostulacionModal],
  selector: 'app-vacante-catalogo',
  styleUrl: './vacante-catalogo.css',
  templateUrl: './vacante-catalogo.html'
})
export class VacanteCatalogo implements OnInit {
  protected vacanteService = inject(VacanteService)
  private destroyRef = inject(DestroyRef)

  // Estados reactivos de filtrado
  readonly searchFilter = signal<string>('')
  readonly modalidadFilter = signal<ModalidadTrabajo | 'TODAS'>('TODAS')
  readonly selectedTag = signal<string | null>(null)

  // Control del modal de postulación
  readonly isModalOpen = signal<boolean>(false)
  readonly selectedVacante = signal<VacanteResponseDTO | null>(null)
  readonly toastMessage = signal<string | null>(null)

  // Subject para debounce reactivo de búsqueda (Escenario 1 - Gherkin WL-24)
  private searchSubject = new Subject<string>()

  // Tags tecnológicas populares para acceso rápido
  readonly popularTags = ['Angular', 'TypeScript', 'Java', 'Spring Boot', 'Figma', 'Go', 'Python', 'AWS']

  // Lista filtrada reactivamente
  readonly vacantesFiltradas = computed(() => {
    const term = this.searchFilter().toLowerCase().trim()
    const modalidad = this.modalidadFilter()
    const tag = this.selectedTag()
    const catalogo = this.vacanteService.catalogoVacantes()

    return catalogo.filter((v) => {
      const matchText =
        !term ||
        v.puesto.toLowerCase().includes(term) ||
        v.nombreEmpresa.toLowerCase().includes(term) ||
        v.descripcion.toLowerCase().includes(term) ||
        v.etiquetas.some((t) => t.toLowerCase().includes(term))

      const matchModalidad =
        modalidad === 'TODAS' || v.tipoUbicacion?.toUpperCase() === modalidad

      const matchTag =
        !tag || v.etiquetas.some((t) => t.toLowerCase() === tag.toLowerCase())

      return matchText && matchModalidad && matchTag
    })
  })

  ngOnInit(): void {
    // Configuración del pipeline reactivo con debounceTime(300) y distinctUntilChanged()
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        this.searchFilter.set(query)
      })

    // Carga inicial del feed de vacantes
    this.vacanteService.getCatalogoVacantes().subscribe()
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement
    this.searchSubject.next(input.value)
  }

  setModalidad(modalidad: ModalidadTrabajo | 'TODAS'): void {
    this.modalidadFilter.set(modalidad)
  }

  toggleTag(tag: string): void {
    this.selectedTag.update((current) => (current === tag ? null : tag))
  }

  abrirModalPostulacion(vacante: VacanteResponseDTO): void {
    this.selectedVacante.set(vacante)
    this.isModalOpen.set(true)
  }

  cerrarModalPostulacion(): void {
    this.isModalOpen.set(false)
    this.selectedVacante.set(null)
  }

  onPostulacionExitosa(nueva: PostulacionResponseDTO): void {
    this.cerrarModalPostulacion()
    this.toastMessage.set(`¡Postulación enviada con éxito para "${nueva.puestoVacante}"!`)
    setTimeout(() => {
      this.toastMessage.set(null)
    }, 4500)
  }

  estaPostulado(vacanteId: number): boolean {
    return this.vacanteService.yaPostulado(vacanteId)
  }
}
