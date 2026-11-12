import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, OnInit, computed, inject, input, model, output, signal } from '@angular/core'
import { Observable, catchError, map, of, shareReplay } from 'rxjs'
import { environment } from '../../../../environments/environment'

interface SkillOption {
  name: string
  oficial: boolean
}

const CATALOGO_BASE: readonly string[] = [
  'Angular', 'Angular 22', 'Angular 19', 'Angular 17', 'Angular CLI', 'TypeScript', 'JavaScript',
  'RxJS', 'NgRx', 'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Svelte', 'HTML5', 'CSS3',
  'Tailwind CSS', 'SASS', 'Bootstrap', 'Vite', 'Webpack',
  'Java', 'Spring Boot', 'Spring Security', 'Hibernate', 'Node.js', 'Express', 'NestJS',
  'Python', 'Django', 'FastAPI', 'Flask', 'Go', 'Rust', 'C#', '.NET', 'ASP.NET Core',
  'PHP', 'Laravel', 'Ruby on Rails', 'GraphQL', 'REST API', 'Microservicios',
  'PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'MongoDB', 'Redis', 'Firebase', 'Supabase',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud (GCP)', 'Terraform', 'Linux',
  'Git', 'GitHub Actions', 'CI/CD', 'Nginx', 'Jenkins',
  'React Native', 'Flutter', 'Dart', 'Kotlin', 'Swift', 'Android', 'iOS', 'Ionic',
  'Figma', 'Adobe XD', 'UX/UI Design', 'Jest', 'Vitest', 'Cypress', 'Playwright',
  'JUnit', 'Selenium', 'SQL', 'Power BI', 'Pandas', 'TensorFlow', 'PyTorch', 'Scrum'
]

let cachedCatalogo$: Observable<SkillOption[]> | null = null

function mergeCatalogo(apiItems: Array<{ name: string }>): SkillOption[] {
  const seen = new Set<string>()
  const merged: SkillOption[] = []

  for (const item of apiItems) {
    const clean = item.name.trim()
    const key = clean.toLowerCase()
    if (clean && !seen.has(key)) {
      seen.add(key)
      merged.push({ name: clean, oficial: true })
    }
  }

  for (const base of CATALOGO_BASE) {
    const key = base.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      merged.push({ name: base, oficial: false })
    }
  }

  return merged
}

function getCatalogoShared(http: HttpClient): Observable<SkillOption[]> {
  if (!cachedCatalogo$) {
    if (environment.bypassAuth) {
      cachedCatalogo$ = of(mergeCatalogo([])).pipe(shareReplay(1))
    } else {
      cachedCatalogo$ = http.get<any[]>(`${environment.apiUrl}/habilidades`).pipe(
        map((items) =>
          mergeCatalogo(
            (items || []).map((h) => ({ name: h.nombreHabilidad ?? h.name ?? '' }))
          )
        ),
        catchError(() => of(mergeCatalogo([]))),
        shareReplay(1)
      )
    }
  }
  return cachedCatalogo$
}

@Component({
  selector: 'app-skill-autocomplete',
  standalone: true,
  host: {
    class: 'block relative',
    '(document:click)': 'onDocumentClick($event)'
  },
  template: `
    <div class="flex gap-2 items-center">
      <div class="relative flex-1 min-w-0">
        <input
          [attr.id]="inputId() || null"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          role="combobox"
          aria-autocomplete="list"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-label]="ariaLabel()"
          [value]="value()"
          [placeholder]="placeholder()"
          (focus)="abrir()"
          (input)="onInput($any($event.target).value)"
          (keydown)="onKeyDown($event)"
          class="w-full px-3.5 py-2.5 min-h-[44px] text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus:border-brand-indigo transition-[background-color,border-color,box-shadow]"
        />

        @if (isOpen()) {
          <div
            role="listbox"
            [attr.aria-label]="ariaLabel()"
            class="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden animate-popover-in">
            <div class="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{{ headerLabel() }}</span>
              <button
                type="button"
                (click)="isOpen.set(false)"
                class="text-slate-400 hover:text-slate-700 px-1 py-0.5 rounded cursor-pointer"
                aria-label="Cerrar sugerencias">
                ✕
              </button>
            </div>

            <div class="max-h-56 overflow-y-auto divide-y divide-slate-100">
              @for (sug of suggestions(); track sug.name; let i = $index) {
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="activeIndex() === i"
                  (click)="seleccionar(sug.name)"
                  [class.bg-indigo-50]="activeIndex() === i"
                  [class.text-brand-indigo]="activeIndex() === i"
                  class="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-indigo-50/70 hover:text-brand-indigo flex items-center justify-between gap-2 transition-colors cursor-pointer">
                  <span class="flex items-center gap-2 truncate">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-indigo shrink-0"></span>
                    <span class="truncate">{{ sug.name }}</span>
                  </span>
                  @if (sug.oficial) {
                    <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold shrink-0">
                      Catálogo
                    </span>
                  }
                </button>
              } @empty {
                <div class="px-4 py-3 text-xs text-slate-500 text-center">
                  @if (value().trim()) {
                    Sin coincidencias exactas. Puedes agregar <strong class="text-slate-700">"{{ value().trim() }}"</strong> manualmente.
                  } @else {
                    Todas las tecnologías sugeridas ya están agregadas.
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      @if (showAddButton()) {
        <button
          type="button"
          (click)="enviarActual()"
          [class]="addButtonClass()">
          {{ addButtonLabel() }}
        </button>
      }
    </div>
  `
})
export class SkillAutocomplete implements OnInit {
  private http = inject(HttpClient)
  private elRef = inject(ElementRef<HTMLElement>)

  readonly value = model<string>('')
  readonly selected = input<string[]>([])
  readonly placeholder = input<string>('Buscar tecnología (ej: Angular, Docker, Spring Boot)...')
  readonly ariaLabel = input<string>('Tecnología o habilidad')
  readonly inputId = input<string>('')
  readonly showAddButton = input<boolean>(false)
  readonly addButtonLabel = input<string>('Agregar')
  readonly addButtonClass = input<string>('btn-tactile-secondary px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold shrink-0 cursor-pointer')
  readonly clearOnSelect = input<boolean>(true)

  readonly optionSelected = output<string>()
  readonly submitted = output<string>()

  readonly catalogo = signal<SkillOption[]>(mergeCatalogo([]))
  readonly isOpen = signal(false)
  readonly activeIndex = signal(-1)

  readonly suggestions = computed<SkillOption[]>(() => {
    const q = this.value().trim().toLowerCase()
    const yaSeleccionadas = new Set(this.selected().map((s) => s.trim().toLowerCase()))
    const disponibles = this.catalogo().filter((opt) => !yaSeleccionadas.has(opt.name.toLowerCase()))

    if (!q) {
      return disponibles.slice(0, 12)
    }

    const prefix: SkillOption[] = []
    const contains: SkillOption[] = []
    for (const opt of disponibles) {
      const lower = opt.name.toLowerCase()
      if (lower.startsWith(q)) {
        prefix.push(opt)
      } else if (lower.includes(q)) {
        contains.push(opt)
      }
    }
    return [...prefix, ...contains]
  })

  readonly headerLabel = computed(() =>
    this.value().trim()
      ? `Tecnologías (${this.suggestions().length})`
      : 'Tecnologías sugeridas'
  )

  ngOnInit(): void {
    getCatalogoShared(this.http).subscribe((opts) => this.catalogo.set(opts))
  }

  abrir(): void {
    this.isOpen.set(true)
    this.activeIndex.set(-1)
  }

  onInput(raw: string): void {
    this.value.set(raw)
    this.isOpen.set(true)
    this.activeIndex.set(-1)
  }

  seleccionar(nombre: string): void {
    this.isOpen.set(false)
    this.activeIndex.set(-1)
    if (this.clearOnSelect()) {
      this.value.set('')
    } else {
      this.value.set(nombre)
    }
    this.optionSelected.emit(nombre)
  }

  enviarActual(): void {
    const raw = this.value().trim().replace(/,/g, '')
    if (!raw) return
    const canonical = this.catalogo().find((o) => o.name.toLowerCase() === raw.toLowerCase())?.name ?? raw
    this.isOpen.set(false)
    this.activeIndex.set(-1)
    if (this.clearOnSelect()) {
      this.value.set('')
    } else {
      this.value.set(canonical)
    }
    this.submitted.emit(canonical)
  }

  onKeyDown(event: KeyboardEvent): void {
    const list = this.suggestions()

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!this.isOpen()) this.isOpen.set(true)
      if (list.length > 0) {
        this.activeIndex.update((idx) => (idx + 1) % list.length)
      }
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (list.length > 0) {
        this.activeIndex.update((idx) => (idx <= 0 ? list.length - 1 : idx - 1))
      }
      return
    }

    if (event.key === 'Escape') {
      this.isOpen.set(false)
      this.activeIndex.set(-1)
      return
    }

    if (event.key === 'Enter' || (this.showAddButton() && event.key === ',')) {
      event.preventDefault()
      const idx = this.activeIndex()
      if (this.isOpen() && idx >= 0 && idx < list.length) {
        this.seleccionar(list[idx].name)
        return
      }
      this.enviarActual()
    }
  }

  onDocumentClick(event: Event): void {
    if (!this.isOpen()) return
    const target = event.target as Node | null
    if (target && !this.elRef.nativeElement.contains(target)) {
      this.isOpen.set(false)
      this.activeIndex.set(-1)
    }
  }
}
