import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { Auth } from '../services/auth'

const SIN_CONEXION = 'No pudimos conectar con el servidor. Revisa tu conexión o intenta de nuevo en unos minutos.'
const ERROR_SERVIDOR = 'El servidor no pudo procesar la solicitud. Intenta de nuevo en unos minutos.'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth)

  return next(req).pipe(
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error)

      // 401 = sesión vencida o inválida; en /auth es un login fallido y el formulario muestra el error
      if (error.status === 401 && !req.url.includes('/auth/')) {
        auth.logout()
      }

      // ErrorResponseDTO del backend: el detalle útil viene en details[]; se usa como message
      const body = error.error
      const detalles = body?.details
      const mensajeBackend = Array.isArray(detalles) && detalles.length > 0 ? detalles.join('. ') : body?.message

      // Sin respuesta legible (servidor caído = "Failed to fetch", HTML de un proxy, Blob): nunca mostrar el texto técnico
      const mensaje = error.status === 0
        ? SIN_CONEXION
        : typeof mensajeBackend === 'string' && mensajeBackend.trim() && !/Exception|java\.|SQL|\.java:/i.test(mensajeBackend)
          ? mensajeBackend
          : ERROR_SERVIDOR

      return throwError(() => new HttpErrorResponse({
        error: { ...(typeof body === 'object' && body !== null ? body : {}), message: mensaje },
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? undefined
      }))
    })
  )
}
