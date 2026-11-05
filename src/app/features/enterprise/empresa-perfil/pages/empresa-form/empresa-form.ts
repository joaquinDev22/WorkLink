import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { form, minLength, maxLength, pattern, required, FormField } from '@angular/forms/signals'
import { EmpresaService } from '../../services/empresa'
import { EmpresaFormModel, EmpresaRequestDTO } from '../../models/empresa.models'

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './empresa-form.html',
  styleUrl: './empresa-form.css'
})
export class EmpresaForm implements OnInit {
  protected empresaService = inject(EmpresaService)

  readonly empresaActual = this.empresaService.empresaActual
  readonly isLoading = this.empresaService.isLoading

  isSaving = signal<boolean>(false)
  isUploadingLogo = signal<boolean>(false)
  isUploadingBanner = signal<boolean>(false)
  toastMsg = signal<string | null>(null)

  // Modelo reactivo de la empresa tipado sin propiedades opcionales para Signal Forms
  empresaModel = signal<EmpresaFormModel>({
    nombre: '',
    descripcion: '',
    sitio_web: '',
    ubicacion: '',
    direccion: '',
    telefono: '',
    rubro: 'Tecnología y Software',
    logo: '',
    banner: ''
  })

  // Formulario con validaciones mediante Angular Signal Forms
  empresaForm = form(this.empresaModel, (f) => {
    required(f.nombre, { message: 'El nombre comercial de la empresa es obligatorio' })
    minLength(f.nombre, 3, { message: 'El nombre debe tener al menos 3 caracteres' })
    maxLength(f.nombre, 80, { message: 'El nombre no debe superar los 80 caracteres' })

    required(f.descripcion, { message: 'La descripción corporativa es obligatoria' })
    minLength(f.descripcion, 10, { message: 'La descripción debe tener al menos 10 caracteres' })
    maxLength(f.descripcion, 1000, { message: 'La descripción no debe superar los 1000 caracteres' })

    required(f.ubicacion, { message: 'La sede o ciudad principal es obligatoria' })

    pattern(
      f.sitio_web,
      /^(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))?$/,
      { message: 'Debe ser una URL válida (ej: https://tuempresa.com)' }
    )
  })

  rubrosDisponibles = [
    'Tecnología y Software',
    'Finanzas y Fintech',
    'Salud y Biotecnología',
    'E-Commerce y Retail',
    'Educación y EdTech',
    'Consultoría y Servicios',
    'Diseño y Creatividad',
    'Industria y Logística'
  ]

  ngOnInit(): void {
    this.empresaService.getMiEmpresa().subscribe({
      next: (emp) => {
        if (emp) {
          this.empresaModel.set({
            nombre: emp.nombre || '',
            descripcion: emp.descripcion || '',
            sitio_web: emp.sitio_web || '',
            ubicacion: emp.ubicacion || '',
            direccion: emp.direccion || '',
            telefono: emp.telefono || '',
            rubro: emp.rubro || 'Tecnología y Software',
            logo: emp.logo || '',
            banner: emp.banner || ''
          })
        }
      },
      error: (err) => console.error('Error al cargar datos de empresa', err)
    })
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]
      if (!file.type.startsWith('image/')) {
        this.showToast('Solo se permiten imágenes (PNG, JPG, WebP)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('El logotipo no debe superar los 5 MB')
        return
      }

      this.isUploadingLogo.set(true)
      this.empresaService.uploadLogo(file).subscribe({
        next: (res) => {
          this.isUploadingLogo.set(false)
          this.empresaModel.update((m) => ({ ...m, logo: res.logoUrl }))
          this.showToast('Logotipo actualizado correctamente')
        },
        error: (err) => {
          this.isUploadingLogo.set(false)
          console.error('Error al subir logotipo', err)
          this.showToast('No se pudo subir el logotipo')
        }
      })
    }
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]
      if (!file.type.startsWith('image/')) {
        this.showToast('Solo se permiten imágenes (PNG, JPG, WebP)')
        return
      }
      if (file.size > 8 * 1024 * 1024) {
        this.showToast('El banner no debe superar los 8 MB')
        return
      }

      this.isUploadingBanner.set(true)
      this.empresaService.uploadBanner(file).subscribe({
        next: (res) => {
          this.isUploadingBanner.set(false)
          this.empresaModel.update((m) => ({ ...m, banner: res.bannerUrl }))
          this.showToast('Banner de portada corporativa actualizado')
        },
        error: (err) => {
          this.isUploadingBanner.set(false)
          console.error('Error al subir banner', err)
          this.showToast('No se pudo subir la portada')
        }
      })
    }
  }

  guardar(): void {
    if (this.empresaForm().invalid()) {
      this.showToast('Por favor corrige los campos con error antes de continuar')
      return
    }

    const current = this.empresaModel()
    const requestData: EmpresaRequestDTO = {
      nombre: current.nombre.trim(),
      descripcion: current.descripcion.trim(),
      sitio_web: current.sitio_web.trim() || undefined,
      ubicacion: current.ubicacion.trim(),
      direccion: current.direccion.trim() || undefined,
      telefono: current.telefono.trim() || undefined,
      rubro: current.rubro || undefined,
      logo: current.logo || undefined,
      banner: current.banner || undefined
    }

    this.isSaving.set(true)
    this.empresaService.guardarEmpresa(requestData).subscribe({
      next: () => {
        this.isSaving.set(false)
        this.showToast('Perfil comercial y branding corporativo guardados con éxito')
      },
      error: (err) => {
        this.isSaving.set(false)
        console.error('Error al guardar empresa', err)
        this.showToast('Error al guardar los datos de la empresa. Reintente')
      }
    })
  }

  showToast(msg: string): void {
    this.toastMsg.set(msg)
    setTimeout(() => this.toastMsg.set(null), 3500)
  }
}
