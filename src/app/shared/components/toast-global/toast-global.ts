import { Component, inject } from '@angular/core'
import { Notificaciones } from '../../../core/services/notificaciones'

@Component({
  selector: 'app-toast-global',
  template: `
    <!-- Región viva siempre presente: los lectores de pantalla anuncian cada mensaje nuevo -->
    <div class="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 z-[70] sm:max-w-sm" aria-live="assertive" role="status">
      @if (notif.actual(); as n) {
        <div
          class="animate-toast-in flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-float bg-white"
          [class.border-rose-200]="n.tipo === 'error'"
          [class.border-amber-200]="n.tipo === 'aviso'"
          [class.border-emerald-200]="n.tipo === 'exito'">
          <span
            class="mt-1.5 w-2 h-2 rounded-full shrink-0"
            [class.bg-rose-500]="n.tipo === 'error'"
            [class.bg-amber-500]="n.tipo === 'aviso'"
            [class.bg-emerald-500]="n.tipo === 'exito'"
            aria-hidden="true"></span>
          <p class="flex-1 text-sm text-slate-800 leading-snug">{{ n.texto }}</p>
          <button
            type="button"
            (click)="notif.cerrar()"
            class="btn-tactile-icon w-9 h-9 shrink-0"
            aria-label="Cerrar notificación">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastGlobal {
  protected notif = inject(Notificaciones)
}
