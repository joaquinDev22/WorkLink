import { Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { VacanteResponseDTO } from '../../models/vacante.models'

@Component({
  imports: [RouterLink],
  selector: 'app-vacante-card',
  styleUrl: './vacante-card.css',
  templateUrl: './vacante-card.html'
})
export class VacanteCard {
  vacante = input.required<VacanteResponseDTO>()
  yaPostulado = input<boolean>(false)
  postular = output<VacanteResponseDTO>()

  onPostular(event: Event): void {
    event.stopPropagation()
    if (!this.yaPostulado()) {
      this.postular.emit(this.vacante())
    }
  }
}
