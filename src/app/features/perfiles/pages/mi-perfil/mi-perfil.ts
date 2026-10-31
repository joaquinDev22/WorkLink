import { Component, OnInit, inject, computed, signal, HostListener } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Perfil } from '../../services/perfil'
import { NivelHabilidad } from '../../models/perfil.models'

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  protected perfilService = inject(Perfil)

  readonly perfil = this.perfilService.perfilActual
  readonly isLoading = this.perfilService.isLoading
  readonly completitud = this.perfilService.completitud

  // Modal de edición de perfil (WL-14)
  isEditModalOpen = signal<boolean>(false)
  isSaving = signal<boolean>(false)
  toastMsg = signal<string | null>(null)

  // Modelo de formulario de edición
  editForm = signal<{
    nombre: string
    apellido: string
    descripcion: string
    telefono: string
    ubicacion: string
    sitioWeb: string
  }>({
    nombre: '',
    apellido: '',
    descripcion: '',
    telefono: '',
    ubicacion: '',
    sitioWeb: ''
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
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.perfilService.uploadPhoto(file).subscribe({
        next: () => {
          this.showToast('Foto de perfil actualizada correctamente')
          input.value = ''
        },
        error: (err) => console.error('Error al subir foto', err)
      })
    }
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.perfilService.uploadBanner(file).subscribe({
        next: () => {
          this.showToast('Banner de portada actualizado correctamente')
          input.value = ''
        },
        error: (err) => console.error('Error al subir banner', err)
      })
    }
  }

  toggleEditModal(): void {
    const current = this.perfil()
    if (current) {
      this.editForm.set({
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

  cerrarEditModal(): void {
    this.isEditModalOpen.set(false)
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarEditModal()
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isEditModalOpen()) {
      this.cerrarEditModal()
    }
  }

  isUrlValid(url: string): boolean {
    if (!url || !url.trim()) return true
    try {
      const parsed = new URL(url.trim())
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  isFormValid(): boolean {
    const form = this.editForm()
    return !!form.nombre.trim() && this.isUrlValid(form.sitioWeb)
  }

  guardarCambios(): void {
    const form = this.editForm()
    if (!this.isFormValid()) return

    this.isSaving.set(true)
    this.perfilService.updateProfile({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      descripcion: form.descripcion.trim(),
      telefono: form.telefono.trim(),
      ubicacion: form.ubicacion.trim(),
      sitioWeb: form.sitioWeb.trim()
    }).subscribe({
      next: () => {
        this.isSaving.set(false)
        this.cerrarEditModal()
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
        return { label: 'Intermedio', colorClass: 'bg-sky-50 text-sky-700 border-sky-200', stars: 2 }
      case 3:
        return { label: 'Avanzado', colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', stars: 3 }
      case 4:
        return { label: 'Experto', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', stars: 4 }
      default:
        return { label: 'Nivel no definido', colorClass: 'bg-slate-100 text-slate-600 border-slate-200', stars: 1 }
    }
  }
}
