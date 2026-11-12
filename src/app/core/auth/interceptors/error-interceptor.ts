import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { Auth } from '../services/auth'
import { Notificaciones } from '../../services/notificaciones'

const SIN_CONEXION = 'No pudimos conectar con el servidor. Revisa tu conexión o intenta de nuevo en unos minutos.'
const ERROR_SERVIDOR = 'El servidor no pudo procesar la solicitud. Intenta de nuevo en unos minutos.'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth)
  const notificaciones = inject(Notificaciones)

  return next(req).pipe(
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error)

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

      // WL-45: aviso global. /auth lo muestra su propio formulario; un 404 en una consulta GET suele ser
      // "no hay datos todavía", pero en una acción (POST/PUT/DELETE) es un error real y se avisa
      const esAuth = req.url.includes('/auth/')
      const consultaSinDatos = error.status === 404 && req.method === 'GET'
      if (error.status === 401 && !esAuth) {
        auth.logout()
        notificaciones.mostrar('Tu sesión caducó. Inicia sesión de nuevo para continuar.', 'aviso')
      } else if (!esAuth && !consultaSinDatos) {
        notificaciones.mostrar(mensaje)
      }

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
