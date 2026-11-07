import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { VacanteService } from '../../services/vacante'
import { PostulacionResponseDTO, VacanteResponseDTO } from '../../models/vacante.models'
import { PostulacionModal } from '../../components/postulacion-modal/postulacion-modal'
import { Auth } from '../../../../../core/auth/services/auth'

@Component({
  imports: [RouterLink, PostulacionModal],
  selector: 'app-vacante-detail',
  styleUrl: './vacante-detail.css',
  templateUrl: './vacante-detail.html'
})
export class VacanteDetail implements OnInit {
  private route = inject(ActivatedRoute)
  protected vacanteService = inject(VacanteService)
  private auth = inject(Auth)

  readonly vacante = signal<VacanteResponseDTO | null>(null)
  readonly isCargando = signal<boolean>(true)
  readonly noEncontrada = signal<boolean>(false)

  readonly isModalOpen = signal<boolean>(false)
  readonly toastMessage = signal<string | null>(null)

  readonly puedePostular = computed(() => {
    const rol = this.auth.session()?.rol
    return rol === 'POSTULANTE' || rol === 'FREELANCER'
  })

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id')
    const id = idParam ? parseInt(idParam, 10) : NaN

    if (isNaN(id)) {
      this.noEncontrada.set(true)
      this.isCargando.set(false)
      return
    }

    this.vacanteService.getVacanteById(id).subscribe({
      next: (data) => {
        if (data) {
          this.vacante.set(data)
        } else {
          this.noEncontrada.set(true)
        }
        this.isCargando.set(false)
      },
      error: () => {
        this.noEncontrada.set(true)
        this.isCargando.set(false)
      }
    })
  }

  estaPostulado(): boolean {
    if (!this.puedePostular()) return false
    const v = this.vacante()
    return v ? this.vacanteService.yaPostulado(v.vacanteId) : false
  }

  abrirModal(): void {
    if (!this.puedePostular()) return
    this.isModalOpen.set(true)
  }

  cerrarModal(): void {
    this.isModalOpen.set(false)
  }

  onPostulado(nueva: PostulacionResponseDTO): void {
    this.cerrarModal()
    this.toastMessage.set(`¡Te has postulado con éxito a "${nueva.puestoVacante}"!`)
    setTimeout(() => {
      this.toastMessage.set(null)
    }, 4500)
  }
}
