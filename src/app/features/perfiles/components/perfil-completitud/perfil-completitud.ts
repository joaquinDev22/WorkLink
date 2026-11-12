import { Component, input, output } from '@angular/core'
import { ItemFaltantePerfil, PerfilCompletitud } from '../../models/perfil.models'

@Component({
  selector: 'app-perfil-completitud',
  standalone: true,
  host: { class: 'block' },
  template: `
    @if (!completitud().completado) {
      <section
        aria-label="Completitud del perfil"
        class="bg-slate-50/90 rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div class="flex items-center gap-4">
          <div class="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg class="w-16 h-16 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
              <circle
                cx="24" cy="24" r="19"
                class="stroke-indigo-100"
                stroke-width="4"
                fill="transparent"
              />
              <circle
                cx="24" cy="24" r="19"
                class="stroke-brand-indigo transition-[stroke-dashoffset] duration-1000 ease-out"
                stroke-width="4"
                stroke-linecap="round"
                fill="transparent"
                stroke-dasharray="119.38"
                [style.stroke-dashoffset]="119.38 - (119.38 * completitud().porcentaje / 100)"
              />
            </svg>
            <span class="absolute text-sm font-extrabold text-slate-800 tabular-nums">
              {{ completitud().porcentaje }}%
            </span>
          </div>

          <div class="space-y-1">
            <h3 class="text-sm sm:text-base font-bold text-slate-900">
              ¡Tu perfil está al {{ completitud().porcentaje }}%!
            </h3>
            <p class="text-xs sm:text-sm text-slate-600">
              {{ subtitulo() }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          @for (item of completitud().itemsFaltantes; track item.clave) {
            <button
              type="button"
              (click)="itemClick.emit({ item, event: $event })"
              [class.completado]="item.completado"
              [disabled]="item.completado"
              class="btn-tactile-icon inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold text-brand-indigo select-none">
              @if (!item.completado) {
                <span>+ {{ item.label }}</span>
              } @else {
                <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12l5 5L20 7" />
                </svg>
                <span class="text-emerald-700">{{ item.label }}</span>
              }
            </button>
          }
        </div>
      </section>
    }
  `
})
export class PerfilCompletitudBanner {
  readonly completitud = input.required<PerfilCompletitud>()
  readonly subtitulo = input<string>('Completa los datos pendientes de tu perfil para ganar mayor visibilidad.')
  readonly itemClick = output<{ item: ItemFaltantePerfil; event: Event }>()
}
