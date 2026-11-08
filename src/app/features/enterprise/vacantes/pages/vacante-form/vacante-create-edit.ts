import { Component, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterLink } from '@angular/router'
import { form, minLength, maxLength, required, validate, FormField } from '@angular/forms/signals'
import { VacanteService } from '../../services/vacante'
import { VacanteFormModel, VacanteRequestDTO, ModalidadTrabajo } from '../../models/vacante.models'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../../../environments/environment'

@Component({
  selector: 'app-vacante-create-edit',
  standalone: true,
  imports: [CommonModule, FormField, RouterLink],
  templateUrl: './vacante-create-edit.html',
  styleUrl: './vacante-create-edit.css'
})
export class VacanteCreateEdit implements OnInit {
  protected vacanteService = inject(VacanteService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private http = inject(HttpClient)

  readonly isMutating = this.vacanteService.isMutating

  vacanteId = signal<number | null>(null)
  isEditMode = computed(() => this.vacanteId() !== null)

  // Fecha mínima permitida (hoy)
  readonly todayDate = new Date().toISOString().split('T')[0]

  // Modelo reactivo para Signal Forms
  vacanteModel = signal<VacanteFormModel>({
    puesto: '',
    descripcion: '',
    finalizacion: '',
    ubicacion: 'Remoto',
    tipoUbicacion: 'REMOTO',
    tipoVacante: 'Full-time',
    salario: ''
  })

  // Etiquetas interactivas de tecnologías y habilidades requeridas
  etiquetas = signal<string[]>(['Angular', 'TypeScript'])
  tagInput = signal<string>('')
  catalogoHabilidades = signal<Array<{ id: number; name: string }>>([])

  // Sugerencias en tiempo real filtradas del catálogo verificado mientras se escribe
  readonly sugerenciasAutocompletado = computed<string[]>(() => {
    const query = this.tagInput().trim().toLowerCase()
    if (!query) return []
    const seleccionadas = this.etiquetas()
    return this.catalogoHabilidades()
      .map(h => h.name)
      .filter(name => name.toLowerCase().includes(query) && !seleccionadas.includes(name))
      .slice(0, 6)
  })

  // Opciones de configuración
  readonly modalidades: { valor: ModalidadTrabajo; label: string; desc: string }[] = [
    { valor: 'REMOTO', label: '100% Remoto', desc: 'Trabajo desde cualquier ubicación geográfica' },
    { valor: 'HIBRIDO', label: 'Híbrido', desc: 'Combinación de presencialidad y días remotos' },
    { valor: 'PRESENCIAL', label: 'Presencial', desc: 'Asistencia obligatoria a oficinas de la empresa' }
  ]

  readonly tiposVacante = [
    'Full-time',
    'Part-time',
    'Freelance / Por Proyecto',
    'Pasantía / Trainee'
  ]

  readonly tecnologiasSugeridas = [
    'Angular',
    'TypeScript',
    'Node.js',
    'Java',
    'Spring Boot',
    'React',
    'Python',
    'Docker',
    'AWS',
    'PostgreSQL',
    'Figma',
    'Tailwind CSS'
  ]

  // Configuración de validaciones mediante Angular Signal Forms
  vacanteForm = form(this.vacanteModel, (f) => {
    required(f.puesto, { message: 'El título del puesto es obligatorio' })
    minLength(f.puesto, 4, { message: 'El puesto debe tener al menos 4 caracteres' })
    maxLength(f.puesto, 90, { message: 'El puesto no debe superar los 90 caracteres' })

    required(f.descripcion, { message: 'La descripción del empleo es obligatoria' })
    minLength(f.descripcion, 20, { message: 'La descripción debe tener al menos 20 caracteres con los requisitos' })
    maxLength(f.descripcion, 2500, { message: 'La descripción no debe superar los 2500 caracteres' })

    required(f.ubicacion, { message: 'La ubicación o zona geográfica es obligatoria' })

    required(f.finalizacion, { message: 'La fecha límite de postulación es obligatoria' })

    // Validador de fecha límite: no puede ser anterior al día de hoy (Criterio de Aceptación Escenario 1)
    validate(f.finalizacion, ({ value }) => {
      const fecha = value()
      if (!fecha) return null
      if (fecha < this.todayDate) {
        return {
          kind: 'minDate',
          message: 'La fecha límite no puede ser anterior al día de hoy'
        }
      }
      return null
    })
  })

  ngOnInit(): void {
    this.cargarCatalogoHabilidades()

    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      const id = Number(idParam)
      if (!isNaN(id)) {
        this.vacanteId.set(id)
        this.cargarVacante(id)
      }
    }
  }

  private cargarCatalogoHabilidades(): void {
    this.http.get<any[]>(`${environment.apiUrl}/habilidades`).subscribe({
      next: (data) => {
        const mapped = (data || []).map((h) => ({
          id: h.habilidadId ?? h.id,
          name: h.nombreHabilidad ?? h.name ?? ''
        }))
        this.catalogoHabilidades.set(mapped)
      },
      error: () => {
        this.catalogoHabilidades.set(
          this.tecnologiasSugeridas.map((name, i) => ({ id: i + 1, name }))
        )
      }
    })
  }

  private cargarVacante(id: number): void {
    this.vacanteService.getVacanteById(id).subscribe((data) => {
      if (data) {
        this.vacanteModel.set({
          puesto: data.puesto,
          descripcion: data.descripcion,
          finalizacion: data.finalizacion,
          ubicacion: data.ubicacion || 'Remoto',
          tipoUbicacion: data.tipoUbicacion || 'REMOTO',
          tipoVacante: data.tipoVacante || 'Full-time',
          salario: data.salario || ''
        })
        this.etiquetas.set(data.etiquetas || [])
      }
    })
  }

  agregarTag(nombreTag?: string): void {
    const raw = (nombreTag || this.tagInput()).trim().replace(/,/g, '')
    if (!raw) return

    // Normalización: si coincide con una habilidad del catálogo oficial, usa su nombre canónico
    const match = this.catalogoHabilidades().find(h => h.name.toLowerCase() === raw.toLowerCase())
    const sanitized = match ? match.name : raw

    if (sanitized && !this.etiquetas().includes(sanitized)) {
      this.etiquetas.update((prev) => [...prev, sanitized])
    }
    this.tagInput.set('')
  }

  agregarTagDesdeInput(): void {
    this.agregarTag()
  }

  onTagKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      this.agregarTag()
    }
  }

  toggleSugerencia(tec: string): void {
    if (this.etiquetas().includes(tec)) {
      this.removerTag(tec)
    } else {
      this.etiquetas.update((prev) => [...prev, tec])
    }
  }

  removerTag(tec: string): void {
    this.etiquetas.update((prev) => prev.filter((t) => t !== tec))
  }

  seleccionarModalidad(mod: ModalidadTrabajo): void {
    this.vacanteModel.update((prev) => ({
      ...prev,
      tipoUbicacion: mod,
      ubicacion: mod === 'REMOTO' && (!prev.ubicacion || prev.ubicacion === 'Buenos Aires, Argentina') ? 'Remoto' : prev.ubicacion
    }))
  }

  onSubmit(e: Event): void {
    e.preventDefault()

    if (this.vacanteForm().invalid()) {
      const formEl = (e.target as HTMLElement).closest('form')
      if (formEl) {
        formEl.classList.remove('input-error')
        void formEl.offsetWidth
        formEl.classList.add('input-error')
      }
      return
    }

    const val = this.vacanteModel()
    const dto: VacanteRequestDTO = {
      puesto: val.puesto.trim(),
      descripcion: val.descripcion.trim(),
      finalizacion: val.finalizacion,
      ubicacion: val.ubicacion.trim(),
      tipoUbicacion: val.tipoUbicacion,
      tipoVacante: val.tipoVacante,
      salario: val.salario.trim() || undefined,
      etiquetas: this.etiquetas()
    }

    const id = this.vacanteId()
    if (id !== null) {
      this.vacanteService.actualizarVacante(id, dto).subscribe({
        next: () => {
          this.router.navigate(['/enterprise/vacantes'])
        }
      })
    } else {
      this.vacanteService.crearVacante(dto).subscribe({
        next: () => {
          this.router.navigate(['/enterprise/vacantes'])
        }
      })
    }
  }
}
