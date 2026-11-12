# 📘 Implementation Plan #40: `WL-18` (US-11) — Galería y Diálogo de Proyectos de Portafolio

| Campo | Detalle |
| :--- | :--- |
| **Identificador** | `PLAN-FE-40` |
| **Ticket Jira** | [WL-18](https://joaking102003.atlassian.net/browse/WL-18) (`US-11: Galería y Diálogo de Proyectos de Portafolio`) |
| **Épica Padre** | `WL-13` (ÉPICA 2: Perfil Profesional, Portafolio y Habilidades - UI) |
| **Estado Previo** | `WL-17` Finalizada exitosamente en Jira (Transition 41). |
| **Objetivo** | Implementar la carga y eliminación de proyectos en el portafolio personal del usuario (título, descripción, link opcional y portada opcional con previsualización). |
| **Módulo / Capa** | `Features` / `Perfiles` ([perfil.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/services/perfil.ts), [mi-perfil.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/pages/mi-perfil/mi-perfil.ts), [mi-perfil.html](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/pages/mi-perfil/mi-perfil.html)) |
| **Archivos Involucrados** | <ul><li>`[MODIFY]` [perfil.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/services/perfil.ts)</li><li>`[MODIFY]` [mi-perfil.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/pages/mi-perfil/mi-perfil.ts)</li><li>`[MODIFY]` [mi-perfil.html](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/pages/mi-perfil/mi-perfil.html)</li></ul> |

---

## 1. Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Alta de Proyecto en Portafolio
  Dado que el usuario abre el modal "+ Agregar" en la sección de Proyectos Destacados
  Y completa título, descripción, link opcional y portada opcional
  Cuando pulsa "Agregar Proyecto"
  Entonces se despacha POST /api/v1/perfiles/addMyProject con FormData
  Y se añade reactivamente a la cuadrícula de proyectos con su previsualización
  Y se muestra toast "Proyecto agregado al portafolio".

Escenario: Baja de Proyecto
  Dado que el usuario pulsa el ícono de eliminar (tacho de basura) en una tarjeta de proyecto
  Cuando confirma la eliminación
  Entonces se despacha DELETE /api/v1/perfiles/removeMyProject/{proyectoId}
  Y se remueve reactivamente de la cuadrícula
  Y se muestra toast "Proyecto eliminado del portafolio".
```

---

## 2. Paso a Paso para el Desarrollador

### Paso 1: Métodos de Portafolio en [perfil.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/services/perfil.ts)

Al final de la clase `Perfil`, agrega los métodos `addMyProject` y `removeMyProject` (incluye soporte offline / mock con `bypassAuth`):

```typescript
  // 4. Agregar proyecto al portafolio (WL-18)
  addMyProject(formData: FormData): Observable<PerfilProyectoPortafolioDTO> {
    if (environment.bypassAuth) {
      const nombre = (formData.get('nombre') as string) || 'Proyecto'
      const descripcion = (formData.get('descripcion') as string) || ''
      const link = (formData.get('link') as string) || undefined
      const imageFile = formData.get('imagen') as File | null

      const nuevo: PerfilProyectoPortafolioDTO = {
        id: Date.now(),
        nombre,
        descripcion,
        link: link || undefined,
        imagen: imageFile ? URL.createObjectURL(imageFile) : undefined
      }

      this.perfilActual.update(p => {
        if (!p) return null
        return { ...p, proyectos: [...(p.proyectos || []), nuevo] }
      })
      return of(nuevo).pipe(delay(250))
    }

    return this.client.post<PerfilProyectoPortafolioDTO>(`${this.API_URL}/addMyProject`, formData).pipe(
      tap(nuevo => {
        this.perfilActual.update(p => p ? { ...p, proyectos: [...(p.proyectos || []), nuevo] } : null)
      })
    )
  }

  // 5. Eliminar proyecto del portafolio (WL-18)
  removeMyProject(proyectoId: number): Observable<void> {
    if (environment.bypassAuth) {
      this.perfilActual.update(p => {
        if (!p) return null
        return {
          ...p,
          proyectos: (p.proyectos || []).filter(proj => proj.id !== proyectoId)
        }
      })
      return of(undefined).pipe(delay(150))
    }

    return this.client.delete<void>(`${this.API_URL}/removeMyProject/${proyectoId}`).pipe(
      tap(() => {
        this.perfilActual.update(p => {
          if (!p) return null
          return {
            ...p,
            proyectos: (p.proyectos || []).filter(proj => proj.id !== proyectoId)
          }
        })
      })
    )
  }
```

---

### Paso 2: Signals y Acciones en [mi-perfil.ts](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/pages/mi-perfil/mi-perfil.ts)

Agrega los signals y métodos de control para el modal de proyectos:

```typescript
  // Modal de Proyectos de Portafolio (WL-18)
  isProjectModalOpen = signal(false)
  isSavingProject = signal(false)
  projectNombre = signal('')
  projectDescripcion = signal('')
  projectLink = signal('')
  projectImageFile = signal<File | null>(null)
  projectImagePreview = signal<string | null>(null)
  projectError = signal<string | null>(null)

  abrirProjectModal(): void {
    this.projectNombre.set('')
    this.projectDescripcion.set('')
    this.projectLink.set('')
    this.projectImageFile.set(null)
    this.projectImagePreview.set(null)
    this.projectError.set(null)
    this.isProjectModalOpen.set(true)
  }

  cerrarProjectModal(): void {
    this.isProjectModalOpen.set(false)
  }

  onProjectImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return
    const file = input.files[0]
    if (!file.type.startsWith('image/')) {
      this.projectError.set('El archivo seleccionado debe ser una imagen.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      this.projectError.set('La imagen no puede superar los 5 MB.')
      return
    }
    this.projectError.set(null)
    this.projectImageFile.set(file)
    this.projectImagePreview.set(URL.createObjectURL(file))
  }

  quitarImagenProyecto(): void {
    this.projectImageFile.set(null)
    this.projectImagePreview.set(null)
  }

  guardarProyecto(): void {
    const nombre = this.projectNombre().trim()
    const descripcion = this.projectDescripcion().trim()
    if (!nombre || !descripcion) {
      this.projectError.set('El título y la descripción son obligatorios.')
      return
    }

    const formData = new FormData()
    formData.append('nombre', nombre)
    formData.append('descripcion', descripcion)
    if (this.projectLink().trim()) {
      formData.append('link', this.projectLink().trim())
    }
    if (this.projectImageFile()) {
      formData.append('imagen', this.projectImageFile()!)
    }

    this.isSavingProject.set(true)
    this.perfilService.addMyProject(formData).subscribe({
      next: () => {
        this.isSavingProject.set(false)
        this.cerrarProjectModal()
        this.showToast('Proyecto agregado al portafolio')
      },
      error: (err) => {
        this.isSavingProject.set(false)
        this.projectError.set(err?.message || 'Error al guardar el proyecto')
      }
    })
  }

  eliminarProyecto(proyectoId: number): void {
    this.perfilService.removeMyProject(proyectoId).subscribe({
      next: () => this.showToast('Proyecto eliminado del portafolio'),
      error: () => this.showToast('Error al eliminar el proyecto')
    })
  }

  getProjectImageUrl(imagen?: string): string | null {
    if (!imagen) return null
    if (imagen.startsWith('data:') || imagen.startsWith('http') || imagen.startsWith('blob:')) return imagen
    return `data:image/jpeg;base64,${imagen}`
  }
```

---

### Paso 3: Actualizar Sección de Proyectos y Modal en [mi-perfil.html](file:///c:/Users/joaki/OneDrive/Escritorio/WorkLink/src/app/features/perfiles/pages/mi-perfil/mi-perfil.html)

#### 3.1. Reemplazar la sección 2 (Proyectos Destacados):

```html
        <!-- 2. Sección de Proyectos y Portafolio (WL-18) -->
        @if (perfil()?.rol !== 'EMPRESA') {
          <div class="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Proyectos Destacados</span>
                </h2>
                <span class="text-xs text-slate-400 font-medium">({{ perfil()?.proyectos?.length || 0 }})</span>
              </div>

              <!-- Botón + Agregar Proyecto -->
              <button 
                type="button" 
                (click)="abrirProjectModal()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer">
                <span>+</span>
                <span>Agregar</span>
              </button>
            </div>

            @if (perfil()?.proyectos && perfil()!.proyectos.length > 0) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (proy of perfil()!.proyectos; track proy.id) {
                  <div class="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden transition-all hover:shadow-xs group flex flex-col justify-between">
                    
                    @if (proy.imagen) {
                      <div class="h-36 w-full overflow-hidden bg-slate-200 border-b border-slate-200/80">
                        <img 
                          [src]="getProjectImageUrl(proy.imagen)" 
                          [alt]="proy.nombre" 
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    }

                    <div class="p-4.5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div class="space-y-1.5">
                        <div class="flex items-start justify-between gap-2">
                          <h3 class="font-bold text-slate-900 text-sm group-hover:text-brand-indigo transition-colors line-clamp-1">
                            {{ proy.nombre }}
                          </h3>
                          <div class="flex items-center gap-1 shrink-0">
                            @if (proy.link) {
                              <a [href]="proy.link" target="_blank" rel="noopener" class="p-1 text-slate-400 hover:text-brand-indigo rounded-lg transition-colors" title="Abrir enlace externo">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            }
                            <!-- Botón eliminar proyecto -->
                            <button 
                              type="button" 
                              (click)="eliminarProyecto(proy.id)"
                              class="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar proyecto">
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {{ proy.descripcion }}
                        </p>
                      </div>

                      @if (proy.link) {
                        <div class="pt-2">
                          <a 
                            [href]="proy.link" 
                            target="_blank" 
                            rel="noopener" 
                            class="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-indigo hover:underline">
                            <span>Ver proyecto</span>
                            <span class="text-xs">→</span>
                          </a>
                        </div>
                      }
                    </div>

                  </div>
                }
              </div>
            } @else {
              <p class="text-slate-400 text-xs sm:text-sm py-4 italic text-center">
                Aún no has registrado proyectos en tu portafolio. Agrega tus trabajos previos para demostrar tu experiencia.
              </p>
            }
          </div>
        }
```

#### 3.2. Añadir el Modal de Agregar Proyecto al final del HTML (junto al modal de habilidades):

```html
    <!-- MODAL: Agregar Proyecto al Portafolio (WL-18) -->
    @if (isProjectModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Agregar Proyecto al Portafolio</h3>
            <button type="button" (click)="cerrarProjectModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
          </div>

          @if (projectError()) {
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
              {{ projectError() }}
            </div>
          }

          <!-- Formulario -->
          <div class="space-y-3.5">
            <!-- Título del Proyecto -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 uppercase">Título del Proyecto *</label>
              <input 
                type="text" 
                [value]="projectNombre()"
                (input)="projectNombre.set($any($event.target).value)"
                placeholder="Ej: E-Commerce Platform, API Gateway, etc."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo"
              />
            </div>

            <!-- Descripción -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 uppercase">Descripción *</label>
              <textarea 
                rows="3"
                [value]="projectDescripcion()"
                (input)="projectDescripcion.set($any($event.target).value)"
                placeholder="Describe brevemente el objetivo, tecnologías usadas y tu rol..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo resize-none"
              ></textarea>
            </div>

            <!-- Enlace externo (opcional) -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 uppercase">Enlace Web o Repositorio (Opcional)</label>
              <input 
                type="url" 
                [value]="projectLink()"
                (input)="projectLink.set($any($event.target).value)"
                placeholder="https://github.com/... o https://midemo.app"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo"
              />
            </div>

            <!-- Imagen de Portada (Opcional) -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 uppercase">Imagen de Portada (Opcional)</label>
              
              @if (projectImagePreview()) {
                <div class="relative rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                  <img [src]="projectImagePreview()!" alt="Preview" class="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    (click)="quitarImagenProyecto()"
                    class="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    title="Quitar imagen">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              } @else {
                <label class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-brand-indigo rounded-2xl p-4 cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
                  <svg class="w-7 h-7 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs font-semibold text-slate-600">Subir captura o portada</span>
                  <span class="text-[11px] text-slate-400">PNG, JPG o WebP hasta 5 MB</span>
                  <input type="file" accept="image/*" (change)="onProjectImageSelected($event)" class="hidden" />
                </label>
              }
            </div>

          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              (click)="cerrarProjectModal()" 
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
              Cancelar
            </button>
            <button 
              type="button" 
              (click)="guardarProyecto()"
              [disabled]="!projectNombre().trim() || !projectDescripcion().trim() || isSavingProject()"
              class="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-indigo hover:bg-brand-indigo-dark disabled:opacity-50 cursor-pointer shadow-sm">
              {{ isSavingProject() ? 'Guardando...' : 'Agregar Proyecto' }}
            </button>
          </div>

        </div>
      </div>
    }
```
