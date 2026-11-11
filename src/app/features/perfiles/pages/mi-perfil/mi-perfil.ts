import { Component, OnInit, inject, computed, signal, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { Perfil } from '../../services/perfil'
import { EditProfileModel, ItemFaltantePerfil, NivelHabilidad, PerfilUsuarioDTO, ReputacionPerfilDTO } from '../../models/perfil.models'
import { form, maxLength, minLength, pattern, required, validate, FormField } from '@angular/forms/signals'
import { MorphService } from '../../../../core/services/morph'
import { Auth } from '../../../../core/auth/services/auth'
import { TokenStorage } from '../../../../core/auth/services/token-storage'
import { UserRole } from '../../../../core/models/user-role'
import { ProyectoAdmin } from '../../../freelance/proyecto-gestion/services/proyecto-admin'
import { ProyectoResponseDTO } from '../../../freelance/proyecto-gestion/models/proyecto.models'
import { EmpresaService } from '../../../enterprise/empresa-perfil/services/empresa'
import { DashboardStatsResponseDTO } from '../../../enterprise/empresa-perfil/models/empresa.models'
import { Cliente } from '../../../freelance/cliente-dashboard/services/cliente'
import { PerfilCompletitudBanner } from '../../components/perfil-completitud/perfil-completitud'
import { catchError, forkJoin, map, Observable, of } from 'rxjs'

export interface HistorialEmpresaRecruiter {
  id: number
  empresa: string
  rolPuesto: string
  periodo: string
  esActual: boolean
  ubicacion: string
  tipoUbicacion: 'HÍBRIDO' | 'REMOTO' | 'PRESENCIAL'
  descripcion: string
  logros: string[]
  perfilesReclutados: string[]
}

function cargarHistorialPersistido(): HistorialEmpresaRecruiter[] {
  try {
    const raw = localStorage.getItem('worklink_recruiter_historial')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

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
  imports: [CommonModule, FormsModule, FormField, RouterLink, PerfilCompletitudBanner],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {

  protected perfilService = inject(Perfil)
  protected morph = inject(MorphService)
  protected auth = inject(Auth)
  protected tokenStorage = inject(TokenStorage)
  protected proyectoAdmin = inject(ProyectoAdmin)
  protected clienteService = inject(Cliente)
  private triggerEl: HTMLElement | null = null

  readonly perfil = this.perfilService.perfilActual
  readonly isLoading = this.perfilService.isLoading
  readonly completitud = this.perfilService.completitud

  // Rol activo derivado reactivamente del modo en sesión o del perfil cargado
  readonly rolActivo = computed<UserRole>(() => {
    return this.auth.session()?.rol || (this.perfil()?.rol as UserRole) || 'POSTULANTE'
  })
  
  readonly esFreelancer = computed(() => this.rolActivo() === 'FREELANCER')
  readonly esPostulante = computed(() => this.rolActivo() === 'POSTULANTE')
  readonly esEmpresa = computed(() => this.rolActivo() === 'EMPRESA')
  readonly esRecruiter = computed(() => this.rolActivo() === 'RECRUITER')
  readonly esCliente = computed(() => this.rolActivo() === 'CLIENTE')
  readonly esCandidato = computed(() => this.esFreelancer() || this.esPostulante())

  readonly subtituloCompletitud = computed<string>(() => {
    const rol = this.rolActivo()
    if (rol === 'CLIENTE') return 'Completa tus datos de contacto y resumen para generar confianza con freelancers.'
    if (rol === 'RECRUITER') return 'Completa tu identidad y contacto corporativo para destacar ante candidatos.'
    if (rol === 'EMPRESA') return 'Completa la identidad de tu empresa para mejorar tus búsquedas.'
    return 'Sube tus imágenes y datos para completar el 100% y ganar mayor visibilidad.'
  })

  readonly proyectosPublicadosCliente = this.proyectoAdmin.misProyectos
  readonly isLoadingProyectosCliente = this.proyectoAdmin.isLoading

  // Histórico de proyectos freelance asignados / en los que trabajó
  readonly proyectosAsignados = signal<ProyectoResponseDTO[]>([])
  readonly isLoadingProyectosAsignados = signal<boolean>(false)

  // Modal de edición de perfil (WL-14)
  isEditModalOpen = signal<boolean>(false)
  isSaving = signal<boolean>(false)
  toastMsg = signal<string | null>(null)
  toastError = signal<boolean>(false)

  isUploadingCv = signal<boolean>(false)
  cvError = signal<string | null>(null)

  isSkillModalOpen = signal(false)
  skillNombre = signal('')
  skillNivel = signal<NivelHabilidad>(3)
  catalogoHabilidades = signal<Array<{ id: number; name: string }>>([])
  isSavingSkill = signal(false)
  mostrarDropdownSkills = signal(false)
  
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

  // Datos reales del recruiter: empresa vinculada, métricas y trayectoria
  protected empresaService = inject(EmpresaService)
  readonly empresa = this.empresaService.empresaActual
  readonly statsEmpresa = signal<DashboardStatsResponseDTO | null>(null)

  // Histórico de empresas del Recruiter con persistencia real en localStorage
  readonly historialRecruiter = signal<HistorialEmpresaRecruiter[]>(cargarHistorialPersistido())

  readonly metricasRecruiter = computed(() => {
    const stats = this.statsEmpresa()
    return {
      contratacionesTotales: stats?.contratacionesEfectuadas ?? 0,
      vacantesActivas: stats?.totalVacantes ?? 0,
      postulacionesTotales: stats?.totalPostulaciones ?? 0,
      entrevistasPendientes: stats?.entrevistasPendientes ?? 0,
      empresasHistorico: this.historialRecruiter().length
    }
  })

  // Modal para agregar/editar experiencia en el histórico
  isHistorialModalOpen = signal<boolean>(false)
  isEditingHistorial = signal<boolean>(false)
  editingHistorialId = signal<number | null>(null)

  empresaHistorialNombre = signal('')
  empresaHistorialPuesto = signal('')
  empresaHistorialPeriodo = signal('')
  empresaHistorialUbicacion = signal('')
  empresaHistorialTipo = signal<'HÍBRIDO' | 'REMOTO' | 'PRESENCIAL'>('REMOTO')
  empresaHistorialEsActual = signal(false)
  empresaHistorialDescripcion = signal('')
  empresaHistorialLogrosText = signal('')
  empresaHistorialTagsText = signal('')



  // Modelo de formulario de edición
  profileModel = signal<EditProfileModel>({
    nombre: '',
    apellido: '',
    descripcion: '',
    telefono: '',
    ubicacion: '',
    pais: '',
    sitioWeb: '',
    fechaNacimiento: '',
    email: '',
    rol: ''
  })

  editForm = form(this.profileModel, (f) => {

    required(f.nombre, { message: 'El nombre es obligatorio' })
    minLength(f.nombre, 2, { message: 'El nombre debe tener al menos 2 caracteres' })
    maxLength(f.nombre, 80, { message: 'El nombre no debe superar los 80 caracteres' })

    required(f.pais, { message: 'El país es obligatorio' })

    validate(f.fechaNacimiento, ({ value }) => {
      if (this.esEmpresa()) return null
      const fecha = value()?.trim() || ''
      if (!fecha) {
        return { kind: 'required', message: 'La fecha de nacimiento es obligatoria' }
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return { kind: 'pattern', message: 'Formato requerido: AAAA-MM-DD' }
      }
      return null
    })

    validate(f.apellido, ({ value }) => {
      if (this.esEmpresa()) return null
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
    if (!this.perfil() || (this.esCliente() && !this.clienteService.perfil())) {
      this.perfilService.cargarPerfil().subscribe()
    }
    if (this.esFreelancer()) {
      this.cargarReputacion()
      this.cargarProyectosAsignados()
    }
    if (this.esRecruiter()) {
      this.cargarDatosRecruiter()
    }
    if (this.esCliente()) {
      this.proyectoAdmin.getMisProyectosPublicados().pipe(catchError(() => of([]))).subscribe()
    }
  }

  toggleModoPostulanteFreelancer(): void {
    const nuevoRol: UserRole = this.rolActivo() === 'POSTULANTE' ? 'FREELANCER' : 'POSTULANTE'
    const actual = this.auth.session()
    if (actual) {
      const updated = { ...actual, rol: nuevoRol }
      this.tokenStorage.saveSession(updated)
      this.auth.session.set(updated)
    }
    this.perfilService.perfilActual.update(p => p ? { ...p, rol: nuevoRol } : null)
    if (nuevoRol === 'FREELANCER') {
      this.cargarReputacion()
      this.cargarProyectosAsignados()
    }
    this.showToast(`Modo cambiado a ${nuevoRol === 'FREELANCER' ? 'Freelancer' : 'Postulante'}`)
  }

  cargarProyectosAsignados(): void {
    this.isLoadingProyectosAsignados.set(true)
    this.proyectoAdmin.getMisProyectosAsignados().subscribe({
      next: (proys) => {
        this.proyectosAsignados.set(Array.isArray(proys) ? proys : [])
        this.isLoadingProyectosAsignados.set(false)
      },
      error: () => {
        this.proyectosAsignados.set([])
        this.isLoadingProyectosAsignados.set(false)
      }
    })
  }

  ejecutarActividad(item: ItemFaltantePerfil, ev: Event): void {
    if (item.completado) return

    if (item.clave === 'foto') {
      const input = document.getElementById('fotoInput') as HTMLInputElement || document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement
      if (input) input.click()
    } else if (item.clave === 'banner') {
      const input = document.getElementById('bannerInput') as HTMLInputElement || document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement
      if (input) input.click()
    } else if (item.clave === 'cv') {
      const input = document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement
      if (input) input.click()
    } else if (item.clave === 'habilidades') {
      this.abrirSkillModal()
    } else if (item.clave === 'proyectos') {
      this.abrirProjectModal()
    } else {
      this.abrirEditar(ev)
    }
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

  async abrirEditar(ev?: Event): Promise<void> {
    this.triggerEl = (ev?.currentTarget as HTMLElement | null) || null
    const current = this.perfil()
    if (current) {
      this.profileModel.set({
        nombre: current.nombre || '',
        apellido: current.apellido || '',
        descripcion: current.descripcion || '',
        telefono: current.telefono || '',
        ubicacion: current.ubicacion || '',
        pais: current.pais || '',
        sitioWeb: current.sitioWeb || '',
        fechaNacimiento: current.fechaNacimiento || '',
        email: current.email || '',
        rol: this.rolActivo()
      })
    }
    if (this.triggerEl) {
      this.morph.name(this.triggerEl, 'edit-surface')
    }
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
        pais: current.pais || 'Argentina',
        sitioWeb: current.sitioWeb || '',
        fechaNacimiento: current.fechaNacimiento || '1998-01-01',
        email: current.email || '',
        rol: this.rolActivo()
      })
    }
    this.isEditModalOpen.update(v => !v)
  }

  guardarCambios(): void {
    const form = this.editForm()
    if (!form.value) return

    this.isSaving.set(true)
    const datos = { ...form.value(), rol: this.rolActivo() }
    const save$: Observable<unknown> = this.esCliente()
      ? forkJoin([
          this.clienteService.actualizarPerfilCliente({
            firstName: (datos.nombre || '').trim(),
            lastName: (datos.apellido || '').trim(),
            phoneNumber: (datos.telefono || '').trim(),
            country: (datos.pais || '').trim(),
            fechaNacimiento: (datos.fechaNacimiento || '').trim()
          }),
          this.perfilService.updateProfile(datos).pipe(catchError(() => of(null)))
        ]).pipe(map(() => null))
      : this.perfilService.updateProfile(datos)

    save$.subscribe({
      next: () => {
        if (this.esCliente()) {
          this.perfilService.perfilActual.update((p) => p ? {
            ...p,
            nombre: (datos.nombre || '').trim(),
            apellido: (datos.apellido || '').trim(),
            telefono: (datos.telefono || '').trim(),
            pais: (datos.pais || '').trim(),
            fechaNacimiento: (datos.fechaNacimiento || '').trim(),
            descripcion: (datos.descripcion || '').trim(),
            ubicacion: (datos.ubicacion || '').trim(),
            sitioWeb: (datos.sitioWeb || '').trim()
          } : p)
        }
        this.isSaving.set(false)
        this.cerrarEditar().finally(() => this.isEditModalOpen.set(false))
        this.showToast('Perfil actualizado con éxito')
      },
      error: (err: any) => {
        this.isSaving.set(false)
        console.error('Error al actualizar perfil (Detalle técnico backend):', err)

        // Mensaje limpio y amigable para el usuario: evitar volcar código o excepciones de deserialización en la UI
        let userMsg = 'No se pudo actualizar el perfil. Revisa los datos ingresados.'
        const backendMsg = err.error?.message || err.error?.mensaje
        const rawDetails = Array.isArray(err.error?.details) ? err.error.details.join(', ') : ''
        const candidate = rawDetails || backendMsg || ''

        const isTechnicalNoise = /Exception|JSON|parsear|StreamReadFeature|DeserializationFeature|byte offset|reference chain|com\.example|FAIL_ON_NULL/i.test(candidate)

        if (candidate && !isTechnicalNoise) {
          userMsg = candidate
        }

        this.showToast(userMsg, true)
      }
    })
  }

  showToast(msg: string, esError = false): void {
    this.toastError.set(esError)
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

  // Sugerencias reactivas filtradas del catálogo verificado mientras se escribe
  readonly sugerenciasSkill = computed<Array<{ id: number; name: string }>>(() => {
    const q = this.skillNombre().trim().toLowerCase()
    const actuales = (this.perfil()?.habilidades || []).map(h => h.nombre.toLowerCase())
    const catalogo = this.catalogoHabilidades().filter(h => !actuales.includes(h.name.toLowerCase()))

    if (!q) {
      return catalogo.slice(0, 8)
    }
    return catalogo.filter(h => h.name.toLowerCase().includes(q)).slice(0, 8)
  })

  abrirSkillModal(): void {
    this.skillNombre.set('')
    this.skillNivel.set(3)
    this.mostrarDropdownSkills.set(false)
    this.isSkillModalOpen.set(true)
    this.perfilService.getHabilidadesCatalogo().subscribe({
      next: (skills) => this.catalogoHabilidades.set(skills)
    })
  }
  cerrarSkillModal(): void {
    this.isSkillModalOpen.set(false)
    this.mostrarDropdownSkills.set(false)
  }
  seleccionarSugerencia(nombre: string): void {
    this.skillNombre.set(nombre)
    this.mostrarDropdownSkills.set(false)
  }
  guardarSkill(): void {
    const raw = this.skillNombre().trim()
    if (!raw) return

    // Normalización: si coincide con una habilidad del catálogo oficial, usa su nombre canónico
    const match = this.catalogoHabilidades().find(h => h.name.toLowerCase() === raw.toLowerCase())
    const nombre = match ? match.name : raw

    this.isSavingSkill.set(true)
    this.perfilService.addMySkill(nombre, this.skillNivel()).subscribe({
      next: () => {
        this.isSavingSkill.set(false)
        this.cerrarSkillModal()
        this.showToast('Habilidad agregada al perfil')
      },
      error: () => {
        this.isSavingSkill.set(false)
        this.showToast('No se pudo agregar la habilidad', true)
      }
    })
  }
  eliminarSkill(habilidadId: number): void {
    this.perfilService.removeMySkill(habilidadId).subscribe({
      next: () => this.showToast('Habilidad eliminada'),
      error: () => this.showToast('No se pudo eliminar la habilidad', true)
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
        this.showToast('Solo se permiten imágenes (PNG, JPG, WebP)', true)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('La imagen no debe superar los 5 MB', true)
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
      this.showToast('El título del proyecto es obligatorio', true)
      return
    }
    if (!descripcion) {
      this.showToast('La descripción del proyecto es obligatoria', true)
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
        this.showToast('No se pudo guardar el proyecto. Intenta nuevamente', true)
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
        this.showToast('Error al eliminar el proyecto', true)
      }
    })
  }

  cargarReputacion(): void {
    this.isLoadingReputacion.set(true)
    this.perfilService.getCalificaciones().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.calificaciones)) {
          this.reputacion.set(data)
        }
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

  // --- MÉTODOS DE HISTORIAL Y MÉTRICAS DE RECRUITER ---
  private cargarDatosRecruiter(): void {
    this.empresaService.getMiEmpresa().pipe(catchError(() => of(null))).subscribe()
    this.empresaService.getDashboardStats().pipe(catchError(() => of(null))).subscribe(s => {
      if (s) this.statsEmpresa.set(s)
    })
  }

  private persistirHistorial(items: HistorialEmpresaRecruiter[]): void {
    try {
      localStorage.setItem('worklink_recruiter_historial', JSON.stringify(items))
    } catch {}
  }

  abrirHistorialModal(item?: HistorialEmpresaRecruiter): void {
    if (item) {
      this.isEditingHistorial.set(true)
      this.editingHistorialId.set(item.id)
      this.empresaHistorialNombre.set(item.empresa)
      this.empresaHistorialPuesto.set(item.rolPuesto)
      this.empresaHistorialPeriodo.set(item.periodo)
      this.empresaHistorialUbicacion.set(item.ubicacion)
      this.empresaHistorialTipo.set(item.tipoUbicacion)
      this.empresaHistorialEsActual.set(item.esActual)
      this.empresaHistorialDescripcion.set(item.descripcion)
      this.empresaHistorialLogrosText.set(item.logros.join('\n'))
      this.empresaHistorialTagsText.set(item.perfilesReclutados.join(', '))
    } else {
      this.isEditingHistorial.set(false)
      this.editingHistorialId.set(null)
      this.empresaHistorialNombre.set('')
      this.empresaHistorialPuesto.set('')
      this.empresaHistorialPeriodo.set('')
      this.empresaHistorialUbicacion.set('')
      this.empresaHistorialTipo.set('REMOTO')
      this.empresaHistorialEsActual.set(false)
      this.empresaHistorialDescripcion.set('')
      this.empresaHistorialLogrosText.set('')
      this.empresaHistorialTagsText.set('')
    }
    this.isHistorialModalOpen.set(true)
  }

  cerrarHistorialModal(): void {
    this.isHistorialModalOpen.set(false)
  }

  guardarHistorial(): void {
    const nombre = this.empresaHistorialNombre().trim()
    const puesto = this.empresaHistorialPuesto().trim()
    if (!nombre || !puesto) {
      this.showToast('Por favor completa el nombre de la empresa y el puesto')
      return
    }

    const logros = this.empresaHistorialLogrosText()
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)

    const tags = this.empresaHistorialTagsText()
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (this.isEditingHistorial()) {
      const id = this.editingHistorialId()
      this.historialRecruiter.update(items => {
        const actualizados = items.map(item => item.id === id ? {
          ...item,
          empresa: nombre,
          rolPuesto: puesto,
          periodo: this.empresaHistorialPeriodo().trim() || item.periodo,
          ubicacion: this.empresaHistorialUbicacion().trim() || item.ubicacion,
          tipoUbicacion: this.empresaHistorialTipo(),
          esActual: this.empresaHistorialEsActual(),
          descripcion: this.empresaHistorialDescripcion().trim() || item.descripcion,
          logros: logros.length > 0 ? logros : item.logros,
          perfilesReclutados: tags.length > 0 ? tags : item.perfilesReclutados
        } : item)
        this.persistirHistorial(actualizados)
        return actualizados
      })
      this.showToast('Experiencia laboral actualizada con éxito')
    } else {
      const nuevo: HistorialEmpresaRecruiter = {
        id: Date.now(),
        empresa: nombre,
        rolPuesto: puesto,
        periodo: this.empresaHistorialPeriodo().trim() || '2024 - Presente',
        ubicacion: this.empresaHistorialUbicacion().trim() || 'Buenos Aires, Argentina',
        tipoUbicacion: this.empresaHistorialTipo(),
        esActual: this.empresaHistorialEsActual(),
        descripcion: this.empresaHistorialDescripcion().trim() || 'Gestión y coordinación de talento técnico IT.',
        logros: logros.length > 0 ? logros : ['Cobertura integral de posiciones técnicas'],
        perfilesReclutados: tags.length > 0 ? tags : ['IT Recruiting', 'Talent Acquisition']
      }
      this.historialRecruiter.update(items => {
        const actualizados = [nuevo, ...items]
        this.persistirHistorial(actualizados)
        return actualizados
      })
      this.showToast('Nueva empresa agregada al historial de reclutamiento')
    }
    this.cerrarHistorialModal()
  }

  eliminarHistorial(id: number): void {
    this.historialRecruiter.update(items => {
      const actualizados = items.filter(item => item.id !== id)
      this.persistirHistorial(actualizados)
      return actualizados
    })
    this.showToast('Empresa eliminada del historial')
  }
}
