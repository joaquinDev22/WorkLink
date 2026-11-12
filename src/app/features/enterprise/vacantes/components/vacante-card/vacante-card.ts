import { Component, computed, inject, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { VacanteResponseDTO } from '../../models/vacante.models'
import { Auth } from '../../../../../core/auth/services/auth'

@Component({
  imports: [RouterLink],
  selector: 'app-vacante-card',
  styleUrl: './vacante-card.css',
  templateUrl: './vacante-card.html'
})
export class VacanteCard {
  private auth = inject(Auth)

  vacante = input.required<VacanteResponseDTO>()
  yaPostulado = input<boolean>(false)
  postular = output<VacanteResponseDTO>()

  readonly puedePostular = computed(() => {
    const rol = this.auth.session()?.rol
    return rol === 'POSTULANTE' || rol === 'FREELANCER'
  })

  onPostular(event: Event): void {
    event.stopPropagation()
    if (this.puedePostular() && !this.yaPostulado()) {
      this.postular.emit(this.vacante())
    }
  }
}
