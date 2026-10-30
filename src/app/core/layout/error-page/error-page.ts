import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { Location } from '@angular/common'
import { Auth } from '../../auth/services/auth'

export interface DetalleError {
  codigo: number
  badge: string
  badgeClass: string
  titulo: string
  descripcion: string
  sugerencia: string
}

@Component({
  imports: [RouterLink],
  selector: 'app-error-page',
  styleUrl: './error-page.css',
  templateUrl: './error-page.html',
})
export class ErrorPage implements OnInit {
  private route = inject(ActivatedRoute)
  private location = inject(Location)
  private auth = inject(Auth)

  codigo = signal<number>(404)

  private readonly catalogoErrores: Record<number, DetalleError> = {
    404: {
      codigo: 404,
      badge: 'Ruta no encontrada',
      badgeClass: 'bg-brand-indigo/10 text-brand-indigo border-brand-indigo/25',
      titulo: 'No encontramos la página solicitada',
      descripcion: 'La dirección URL ingresada no existe, fue reubicada o el proyecto ya no está disponible.',
      sugerencia: 'Verifica la URL o regresa al catálogo de proyectos para continuar explorando.'
    },
    403: {
      codigo: 403,
      badge: 'Acceso restringido',
      badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/25',
      titulo: 'No tienes permisos para esta sección',
      descripcion: 'Tu rol de cuenta actual no cuenta con las autorizaciones necesarias para visualizar este panel.',
      sugerencia: 'Si crees que esto es un error, verifica la sesión iniciada o cambia de perfil.'
    },
    500: {
      codigo: 500,
      badge: 'Problema técnico',
      badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/25',
      titulo: 'Error inesperado del servidor',
      descripcion: 'Nuestros servicios no pudieron procesar la operación en este momento.',
      sugerencia: 'Intenta recargar en unos instantes. Si el problema persiste, contacta con soporte.'
    }
  }

  readonly errorActual = computed<DetalleError>(() => {
    const cod = this.codigo()
    return this.catalogoErrores[cod] || this.catalogoErrores[404]
  })

  readonly rutaInicio = computed<string>(() => {
    const s = this.auth.session()
    if (!s) return '/'
    if (s.rol === 'EMPRESA') return '/enterprise/dashboard'
    if (s.rol === 'RECRUITER') return '/enterprise/vacantes'
    if (s.rol === 'CLIENTE') return '/freelance/cliente-dashboard'
    return '/freelance/proyectos'
  })

  ngOnInit(): void {
    // 1. Prioriza queryParams (?codigo=403), luego data de la ruta
    const queryCod = this.route.snapshot.queryParamMap.get('codigo')
    const dataCod = this.route.snapshot.data['codigo']

    const codFinal = queryCod ? Number(queryCod) : (dataCod ? Number(dataCod) : 404)
    this.codigo.set(isNaN(codFinal) ? 404 : codFinal)
  }

  volverAtras(): void {
    this.location.back()
  }
}

