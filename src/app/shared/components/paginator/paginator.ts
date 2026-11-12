import { Component, computed, input, output } from '@angular/core'

@Component({
  selector: 'app-paginator',
  standalone: true,
  host: { class: 'block' },
  template: `
    @if (totalItems() > 0 && totalPages() > 1) {
      <nav
        [attr.aria-label]="'Paginación de ' + itemLabel()"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4"
        [class.pt-2]="compact()">
        <p class="text-xs font-medium text-slate-500 tabular-nums order-2 sm:order-1">
          Mostrando
          <span class="font-bold text-slate-800">{{ rangeStart() }}–{{ rangeEnd() }}</span>
          de
          <span class="font-bold text-slate-800">{{ totalItems() }}</span>
          {{ itemLabel() }}
        </p>

        <div class="flex items-center gap-1.5 order-1 sm:order-2">
          <button
            type="button"
            (click)="goTo(safePage() - 1)"
            [disabled]="safePage() <= 1"
            class="btn-tactile-secondary px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            aria-label="Página anterior">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            @if (!compact()) {
              <span class="hidden sm:inline">Anterior</span>
            }
          </button>

          @if (compact()) {
            <span class="px-2.5 text-xs font-semibold text-slate-700 tabular-nums">
              {{ safePage() }} / {{ totalPages() }}
            </span>
          } @else {
            <div class="flex items-center gap-1">
              @for (item of pageTokens(); track $index) {
                @if (item === '...') {
                  <span class="px-1.5 text-xs font-semibold text-slate-400 select-none">…</span>
                } @else {
                  <button
                    type="button"
                    (click)="goTo(item)"
                    [attr.aria-current]="safePage() === item ? 'page' : null"
                    [class]="safePage() === item ? 'tab-tactile-active text-indigo-700' : 'btn-tactile-icon text-slate-600'"
                    class="w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center tabular-nums cursor-pointer">
                    {{ item }}
                  </button>
                }
              }
            </div>
          }

          <button
            type="button"
            (click)="goTo(safePage() + 1)"
            [disabled]="safePage() >= totalPages()"
            class="btn-tactile-secondary px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            aria-label="Página siguiente">
            @if (!compact()) {
              <span class="hidden sm:inline">Siguiente</span>
            }
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </nav>
    }
  `
})
export class Paginator {
  readonly currentPage = input.required<number>()
  readonly totalItems = input.required<number>()
  readonly pageSize = input<number>(8)
  readonly itemLabel = input<string>('resultados')
  readonly compact = input<boolean>(false)

  readonly pageChange = output<number>()

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())))
  readonly safePage = computed(() => Math.min(Math.max(1, this.currentPage()), this.totalPages()))

  readonly rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.safePage() - 1) * this.pageSize() + 1
  )

  readonly rangeEnd = computed(() =>
    Math.min(this.safePage() * this.pageSize(), this.totalItems())
  )

  readonly pageTokens = computed<Array<number | '...'>>(() => {
    const total = this.totalPages()
    const current = this.safePage()
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const tokens: Array<number | '...'> = [1]
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    if (start > 2) tokens.push('...')
    for (let i = start; i <= end; i++) tokens.push(i)
    if (end < total - 1) tokens.push('...')
    tokens.push(total)
    return tokens
  })

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.safePage()) {
      this.pageChange.emit(page)
    }
  }
}
