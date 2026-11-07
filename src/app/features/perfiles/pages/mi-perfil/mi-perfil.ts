import { Component, OnInit, inject, computed, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Perfil } from '../../services/perfil'
import { EditProfileModel, NivelHabilidad, PerfilUsuarioDTO, ReputacionPerfilDTO } from '../../models/perfil.models'
import { form, maxLength, minLength, pattern, required, validate, FormField } from '@angular/forms/signals'
import { MorphService } from '../../../../core/services/morph'

export const PATTERNS_TELEFONO: Record<string, { regex: RegExp, ejemplo: string }> = {
  AR: {
    regex: /^\+54\s?(9\s?)?\d{2,4}\s?\d{6,8}$/,
    ejemplo: '+54 9 11 1234 5678'
  },
  MX: {
    regex: /^\+52\s?\d{2,3}\s?\d{7,8}$/,
    ejemplo: '+52 55 1234 5678'
  },
  ES: {
    regex: /^\+34\s?[6789]\d{8}$/,
    ejemplo: '+34 612 345 678'
  },
  CO: {
    regex: /^\+57\s?3\d{9}$/,
    ejemplo: '+57 300 123 4567'
  },
  CL: {
    regex: /^\+56\s?9\s?\d{8}$/,
    ejemplo: '+56 9 1234 5678'
  },
  OTRO: {
    regex: /^\+[1-9]\d{6,14}$/,
    ejemplo: '+1 555 123 4567'
  }
}

@Component({
  imports: [CommonModule, FormsModule, FormField],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  protected perfilService = inject(Perfil)
  protected morph = inject(MorphService)
  private triggerEl: HTMLElement | null = null

  readonly perfil = this.perfilService.perfilActual
  readonly isLoading = this.perfilService.isLoading
  readonly completitud = this.perfilService.completitud

  // Modal de edición de perfil (WL-14)
  isEditModalOpen = signal<boolean>(false)
  isSaving = signal<boolean>(false)
  toastMsg = signal<string | null>(null)

  isUploadingCv = signal<boolean>(false)
  cvError = signal<string | null>(null)

  isSkillModalOpen = signal(false)
  skillNombre = signal('')
  skillNivel = signal<NivelHabilidad>(3)
  catalogoHabilidades = signal<Array<{ id: number; name: string }>>([])
  isSavingSkill = signal(false)
  
  // Modal de proyectos (WL-18)
  isProjectModalOpen = signal<boolean>(false)
  isSavingProject = signal<boolean>(false)
  
  // Reputación y Reseñas (WL-19: US-12)
  reputacion = signal<ReputacionPerfilDTO | null>(null)
  isLoadingReputacion = signal<boolean>(false)
  readonly paginaResenas = signal<number>(1)
  readonly pageSizeResenas = 3

  readonly totalPaginasResenas = computed<number>(() => {
    const total = this.reputacion()?.calificaciones?.length || 0
    return Math.max(1, Math.ceil(total / this.pageSizeResenas))
  })

  readonly resenasPaginadas = computed(() => {
    const todas = this.reputacion()?.calificaciones || []
    const inicio = (this.paginaResenas() - 1) * this.pageSizeResenas
    return todas.slice(inicio, inicio + this.pageSizeResenas)
  })

  readonly rangoResenasActual = computed<string>(() => {
    const total = this.reputacion()?.calificaciones?.length || 0
    if (total === 0) return '0 de 0'
    const inicio = (this.paginaResenas() - 1) * this.pageSizeResenas + 1
    const fin = Math.min(inicio + this.pageSizeResenas - 1, total)
    return `${inicio}-${fin} de ${total}`
  })

  deletingProjectId = signal<number | null>(null)
  projectNombre = signal<string>('')
  projectDescripcion = signal<string>('')
  projectLink = signal<string>('')
  projectImagenFile = signal<File | null>(null)
  projectImagenPreview = signal<string | null>(null)


  // Modelo de formulario de edición
  profileModel = signal<EditProfileModel>({
    nombre: '',
    apellido: '',
    descripcion: '',
    telefono: '',
    ubicacion: '',
    sitioWeb: ''
  })

  editForm = form(this.profileModel, (f) => {

    required(f.nombre, { message: 'El nombre es obligatorio' })
    minLength(f.nombre, 2, { message: 'El nombre debe tener al menos 2 caracteres' })
    maxLength(f.nombre, 80, { message: 'El nombre no debe superar los 80 caracteres' })

    validate(f.apellido, ({ value }) => {
      if (this.perfil()?.rol === 'EMPRESA') return null
      const ap = value()?.trim() || ''
      if (!ap) {
        return { kind: 'required', message: 'El apellido es obligatorio' }
      }
      if (ap.length < 2) {
        return { kind: 'minLength', message: 'El apellido debe tener al menos 2 caracteres' }
      }
      if (ap.length > 50) {
        return { kind: 'maxLength', message: 'El apellido no debe superar los 50 caracteres' }
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(ap)) {
        return { kind: 'pattern', message: 'El apellido no puede incluir caracteres especiales' }
      }
      return null
    })

    pattern(f.sitioWeb,/^(https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/,
      {message: 'El sitio web debe comenzar con https:// y tener un dominio válido'}
    )

     validate(f.telefono, ({ value }) => {
      const tel = value()?.trim()
      if (!tel) return null
      const pais = this.profileModel().ubicacion || 'AR'
      const config = PATTERNS_TELEFONO[pais] || PATTERNS_TELEFONO['OTRO']
      const limpio = tel.replace(/[-\s]/g, '')
      if (!config.regex.test(tel) && !config.regex.test(limpio)) {
        return {
          kind: 'pattern',
          message: `Formato requerido para ${pais}: ${config.ejemplo}`
        }
      }
      return null
    })
  })

  readonly initial = computed<string>(() => {
    const p = this.perfil()
    if (!p) return 'U'
    return p.nombre?.charAt(0)?.toUpperCase() || 'U'
  })

  readonly fotoUrl = computed<string | null>(() => {
    const foto = this.perfil()?.fotoPerfil
    if (!foto) return null
    if (foto.startsWith('data:') || foto.startsWith('http')) return foto
    return `data:image/jpeg;base64,${foto}`
  })

  readonly bannerUrl = computed<string | null>(() => {
    const banner = this.perfil()?.bannerPerfil
    if (!banner) return null
    if (banner.startsWith('data:') || banner.startsWith('http')) return banner
    return `data:image/jpeg;base64,${banner}`
  })

  ngOnInit(): void {
    if (!this.perfil()) {
      this.perfilService.cargarPerfil().subscribe()
    }
    this.cargarReputacion()
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.perfilService.uploadPhoto(file).subscribe({
        next: () => this.showToast('Foto de perfil actualizada correctamente'),
        error: (err) => console.error('Error al subir foto', err)
      })
    }
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.perfilService.uploadBanner(file).subscribe({
        next: () => this.showToast('Banner de portada actualizado correctamente'),
        error: (err) => console.error('Error al subir banner', err)
      })
    }
  }

  async abrirEditar(ev: Event): Promise<void> {
    this.triggerEl = ev.currentTarget as HTMLElement
    const current = this.perfil()
    if (current) {
      this.profileModel.set({
        nombre: current.nombre || '',
        apellido: current.apellido || '',
        descripcion: current.descripcion || '',
        telefono: current.telefono || '',
        ubicacion: current.ubicacion || '',
        sitioWeb: current.sitioWeb || ''
      })
    }
    this.morph.name(this.triggerEl, 'edit-surface')
    await this.morph.run(() => {
      if (this.triggerEl) this.triggerEl.style.viewTransitionName = 'none'
      this.isEditModalOpen.set(true)
    })
  }

  async cerrarEditar(): Promise<void> {
    await this.morph.run(() => {
      this.isEditModalOpen.set(false)
      if (this.triggerEl) {
        this.morph.name(this.triggerEl, 'edit-surface')
      }
    })
    this.morph.clear(this.triggerEl)
  }

  toggleEditModal(): void {
    const current = this.perfil()
    if (current) {
      this.profileModel.set({
        nombre: current.nombre || '',
        apellido: current.apellido || '',
        descripcion: current.descripcion || '',
        telefono: current.telefono || '',
        ubicacion: current.ubicacion || '',
        sitioWeb: current.sitioWeb || ''
      })
    }
    this.isEditModalOpen.update(v => !v)
  }

  guardarCambios(): void {
    const form = this.editForm()
    if (!form.value) return

    this.isSaving.set(true)
    this.perfilService.updateProfile(form.value()).subscribe({
      next: () => {
        this.isSaving.set(false)
        this.cerrarEditar()
        this.showToast('Perfil actualizado con éxito')
      },
      error: (err) => {
        this.isSaving.set(false)
        console.error('Error al actualizar perfil', err)
      }
    })
  }

  showToast(msg: string): void {
    this.toastMsg.set(msg)
    setTimeout(() => {
      this.toastMsg.set(null)
    }, 3500)
  }

  getNivelInfo(nivel: NivelHabilidad): { label: string, colorClass: string, stars: number } {
    switch (nivel) {
      case 1:
        return { label: 'Básico', colorClass: 'bg-slate-100 text-slate-700 border-slate-200', stars: 1 }
      case 2:
        return { label: 'Básico / Intermedio', colorClass: 'bg-teal-50 text-teal-700 border-teal-200', stars: 2 }
      case 3:
        return { label: 'Intermedio', colorClass: 'bg-sky-50 text-sky-700 border-sky-200', stars: 3 }
      case 4:
        return { label: 'Intermedio / Avanzado', colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', stars: 4 }
      case 5:
        return { label: 'Avanzado', colorClass: 'bg-purple-50 text-purple-700 border-purple-200', stars: 5 }
      default:
        return { label: 'Básico', colorClass: 'bg-slate-100 text-slate-700 border-slate-200', stars: 1 }
    }
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return
    const file = input.files[0]
    this.cvError.set(null)
    if (file.type !== 'application/pdf') {
      this.cvError.set('El archivo debe ser un documento PDF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      this.cvError.set('El tamaño máximo permitido es de 5 MB.')
      return
    }
    this.isUploadingCv.set(true)
    this.perfilService.uploadCV(file).subscribe({
      next: () => {
        this.isUploadingCv.set(false)
        this.showToast('Currículum Vitae cargado correctamente')
      },
      error: (err) => {
        this.isUploadingCv.set(false)
        this.cvError.set(err?.message || 'Error al subir el CV')
      }
    })
  }
  verCV(): void {
  this.perfilService.descargarMiCV().subscribe({
    next: (blob) => {
      const fileUrl = URL.createObjectURL(blob)
      window.open(fileUrl, '_blank')
    },
    error: () => this.showToast('No se pudo abrir el currículum')
  })
}

  descargarCV(): void {
    this.perfilService.descargarMiCV().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Curriculum_${this.perfil()?.nombre || 'WorkLink'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      },
      error: () => this.showToast('No se pudo descargar el currículum')
    })
  }

  abrirSkillModal(): void {
    this.skillNombre.set('')
    this.skillNivel.set(3)
    this.isSkillModalOpen.set(true)
    this.perfilService.getHabilidadesCatalogo().subscribe({
      next: (skills) => this.catalogoHabilidades.set(skills)
    })
  }
  cerrarSkillModal(): void {
    this.isSkillModalOpen.set(false)
  }
  seleccionarSugerencia(nombre: string): void {
    this.skillNombre.set(nombre)
  }
  guardarSkill(): void {
    const nombre = this.skillNombre().trim()
    if (!nombre) return
    this.isSavingSkill.set(true)
    this.perfilService.addMySkill(nombre, this.skillNivel()).subscribe({
      next: () => {
        this.isSavingSkill.set(false)
        this.cerrarSkillModal()
        this.showToast('Habilidad agregada al perfil')
      },
      error: () => this.isSavingSkill.set(false)
    })
  }
  eliminarSkill(habilidadId: number): void {
    this.perfilService.removeMySkill(habilidadId).subscribe({
      next: () => this.showToast('Habilidad eliminada')
    })
  }

  // Métodos de portafolio y proyectos (WL-18)
  abrirProjectModal(): void {
    this.projectNombre.set('')
    this.projectDescripcion.set('')
    this.projectLink.set('')
    this.projectImagenFile.set(null)
    this.projectImagenPreview.set(null)
    this.isProjectModalOpen.set(true)
  }

  cerrarProjectModal(): void {
    this.isProjectModalOpen.set(false)
  }

  onProjectImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]
      if (!file.type.startsWith('image/')) {
        this.showToast('Solo se permiten imágenes (PNG, JPG, WebP)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('La imagen no debe superar los 5 MB')
        return
      }
      this.projectImagenFile.set(file)
      this.projectImagenPreview.set(URL.createObjectURL(file))
    }
  }

  quitarImagenProyecto(): void {
    this.projectImagenFile.set(null)
    this.projectImagenPreview.set(null)
  }

  guardarProyecto(): void {
    const nombre = this.projectNombre().trim()
    const descripcion = this.projectDescripcion().trim()
    if (!nombre) {
      this.showToast('El título del proyecto es obligatorio')
      return
    }
    if (!descripcion) {
      this.showToast('La descripción del proyecto es obligatoria')
      return
    }

    const formData = new FormData()
    formData.append('nombre', nombre)
    formData.append('descripcion', descripcion)
    if (this.projectLink().trim()) {
      formData.append('link', this.projectLink().trim())
    }
    if (this.projectImagenFile()) {
      formData.append('imagen', this.projectImagenFile()!)
    }

    this.isSavingProject.set(true)
    this.perfilService.addMyProject(formData).subscribe({
      next: () => {
        this.isSavingProject.set(false)
        this.cerrarProjectModal()
        this.showToast('Proyecto agregado exitosamente a tu portafolio')
      },
      error: (err) => {
        this.isSavingProject.set(false)
        console.error('Error al agregar proyecto', err)
        this.showToast('No se pudo guardar el proyecto. Intenta nuevamente')
      }
    })
  }

  eliminarProyecto(proyectoId: number): void {
    this.deletingProjectId.set(proyectoId)
    this.perfilService.removeMyProject(proyectoId).subscribe({
      next: () => {
        this.deletingProjectId.set(null)
        this.showToast('Proyecto eliminado del portafolio')
      },
      error: (err) => {
        this.deletingProjectId.set(null)
        console.error('Error al eliminar proyecto', err)
        this.showToast('Error al eliminar el proyecto')
      }
    })
  }

  cargarReputacion(): void {
    this.isLoadingReputacion.set(true)
    this.perfilService.getCalificaciones().subscribe({
      next: (data) => {
        this.reputacion.set(data)
        this.isLoadingReputacion.set(false)
      },
      error: (err) => {
        console.error('Error al cargar reputación', err)
        this.isLoadingReputacion.set(false)
      }
    })
  }

  cambiarPaginaResenas(deltaOIndice: number, esIndiceDirecto = false): void {
    if (esIndiceDirecto) {
      if (deltaOIndice >= 1 && deltaOIndice <= this.totalPaginasResenas()) {
        this.paginaResenas.set(deltaOIndice)
      }
      return
    }
    const nueva = this.paginaResenas() + deltaOIndice
    if (nueva >= 1 && nueva <= this.totalPaginasResenas()) {
      this.paginaResenas.set(nueva)
    }
  }
}
