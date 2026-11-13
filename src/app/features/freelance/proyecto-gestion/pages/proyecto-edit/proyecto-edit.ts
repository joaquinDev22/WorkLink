import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { FormField, form, maxLength, minLength, required, validate } from '@angular/forms/signals'
import { gsap } from 'gsap'
import { ProyectoAdmin } from '../../services/proyecto-admin'
import { ProyectoCatalog } from '../../../proyectos-catalogo/services/proyecto-catalog'
import { ProyectoRequestDTO } from '../../models/proyecto.models'
import { SkillAutocomplete } from '../../../../../shared/components/skill-autocomplete/skill-autocomplete'

interface ProyectoFormModel {
  nombreProyecto: string
  area: string
  descripcion: string
  presupuestoMin: number
  presupuestoMax: number
  duracion: string
  tipoPago: string
}

@Component({
  imports: [RouterLink, FormField, SkillAutocomplete],
  selector: 'app-proyecto-edit',
  styleUrl: './proyecto-edit.css',
  templateUrl: './proyecto-edit.html'
})
export class ProyectoEdit implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private hostEl = inject(ElementRef<HTMLElement>)
  protected proyectoAdmin = inject(ProyectoAdmin)
  private catalogService = inject(ProyectoCatalog)

  readonly isMutating = this.proyectoAdmin.isMutating
  readonly proyectoId = signal<number | null>(null)
  readonly isEditMode = computed(() => this.proyectoId() !== null)
  readonly isLoadingProyecto = signal<boolean>(false)

  readonly errorMsg = signal<string | null>(null)
  readonly habilidades = signal<string[]>([])
  readonly skillInput = signal<string>('')

  readonly areasSugeridas = [
    'Desarrollo Web',
    'Backend & APIs',
    'Diseño UX/UI',
    'Mobile & Cloud',
    'Data & IA',
    'QA & Testing'
  ]

  readonly duracionesSugeridas = [
    'Menos de 1 mes',
    '1 a 3 meses',
    '3 a 6 meses',
    'Más de 6 meses'
  ]

  readonly modalidadesPago = ['Por Hitos', 'Precio Fijo']

  readonly tecnologiasSugeridas = [
    'Angular',
    'TypeScript',
    'Java',
    'Spring Boot',
    'React',
    'Node.js',
    'PostgreSQL',
    'Docker',
    'Tailwind CSS',
    'Figma',
    'Python',
    'AWS'
  ]

  readonly proyectoModel = signal<ProyectoFormModel>({
    nombreProyecto: '',
    area: 'Desarrollo Web',
    descripcion: '',
    presupuestoMin: 0,
    presupuestoMax: 0,
    duracion: '1 a 3 meses',
    tipoPago: 'Por Hitos'
  })

  readonly proyectoForm = form(this.proyectoModel, (f) => {
    required(f.nombreProyecto, { message: 'El título del proyecto es obligatorio' })
    minLength(f.nombreProyecto, 5, { message: 'El título debe tener al menos 5 caracteres' })
    maxLength(f.nombreProyecto, 120, { message: 'El título no debe superar los 120 caracteres' })

    required(f.area, { message: 'Selecciona o ingresa un área de especialidad' })

    required(f.descripcion, { message: 'La descripción técnica es obligatoria' })
    minLength(f.descripcion, 20, {
      message: 'Describe el alcance del proyecto en al menos 20 caracteres'
    })
    maxLength(f.descripcion, 3000, {
      message: 'La descripción no debe superar los 3000 caracteres'
    })

    validate(f.presupuestoMin, ({ value }) => {
      const min = Number(value())
      if (Number.isNaN(min) || min < 0) {
        return { kind: 'minBudget', message: 'El presupuesto mínimo debe ser 0 o mayor' }
      }
      return null
    })

    validate(f.presupuestoMax, ({ value }) => {
      const max = Number(value())
      const min = Number(this.proyectoForm.presupuestoMin().value())
      if (Number.isNaN(max) || max <= 0) {
        return { kind: 'maxBudget', message: 'El presupuesto máximo debe ser mayor a 0' }
      }
      if (!Number.isNaN(min) && min > max) {
        return {
          kind: 'budgetRange',
          message: 'El presupuesto máximo debe ser mayor o igual al presupuesto mínimo'
        }
      }
      return null
    })
  })

  private gsapCtx: gsap.Context | null = null

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      this.isLoadingProyecto.set(true)
      this.catalogService.getProyectoById(idParam).subscribe({
        next: (p) => {
          this.proyectoId.set(p.proyectoId)
          this.proyectoModel.set({
            nombreProyecto: p.nombreProyecto ?? p.area,
            area: p.area,
            descripcion: p.descripcion,
            presupuestoMin: p.presupuestoMin,
            presupuestoMax: p.presupuestoMax,
            duracion: p.duracion ?? '1 a 3 meses',
            tipoPago: p.tipoPago ?? 'Por Hitos'
          })
          this.habilidades.set(Array.isArray(p.habilidades) ? [...p.habilidades] : [])
          this.isLoadingProyecto.set(false)
          queueMicrotask(() => this.animarFormulario())
        },
        error: () => {
          this.errorMsg.set('No pudimos cargar el proyecto para editar.')
          this.isLoadingProyecto.set(false)
        }
      })
    } else {
      queueMicrotask(() => this.animarFormulario())
    }
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  private animarFormulario(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.edit-section', {
          y: 12,
          autoAlpha: 0,
          duration: 0.34,
          stagger: 0.06,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility'
        })
      })
    }, this.hostEl.nativeElement)
  }

  agregarSkill(raw?: string): void {
    const clean = (raw ?? this.skillInput()).trim()
    if (!clean) return
    if (!this.habilidades().some((h) => h.toLowerCase() === clean.toLowerCase())) {
      this.habilidades.update((list) => [...list, clean])
    }
    if (!raw) {
      this.skillInput.set('')
    }
  }

  quitarSkill(skill: string): void {
    this.habilidades.update((list) => list.filter((s) => s !== skill))
  }

  onSubmit(event: Event): void {
    event.preventDefault()
    this.errorMsg.set(null)

    if (this.proyectoForm().invalid()) {
      this.errorMsg.set('Revisa los campos marcados antes de publicar el proyecto.')
      return
    }

    const m = this.proyectoModel()
    const min = Number(m.presupuestoMin)
    const max = Number(m.presupuestoMax)
    if (min > max) {
      this.errorMsg.set('El presupuesto mínimo no puede superar al presupuesto máximo.')
      return
    }

    const payload: ProyectoRequestDTO = {
      nombreProyecto: m.nombreProyecto.trim(),
      area: m.area.trim(),
      descripcion: m.descripcion.trim(),
      presupuestoMin: min,
      presupuestoMax: max,
      duracion: m.duracion,
      tipoPago: m.tipoPago,
      habilidades: this.habilidades()
    }

    const editId = this.proyectoId()
    const req$ =
      editId !== null
        ? this.proyectoAdmin.actualizarProyecto(editId, payload)
        : this.proyectoAdmin.publicarProyecto(payload)

    req$.subscribe({
      next: (res) => {
        this.router.navigate(['/freelance/proyecto', res.uuid || res.proyectoId])
      },
      error: (err) => {
        this.errorMsg.set(
          err.error?.message ||
            'Ocurrió un error al guardar el proyecto. Verifica los datos e intenta nuevamente.'
        )
      }
    })
  }
}
