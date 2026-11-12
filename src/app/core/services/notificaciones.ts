import { Service, signal } from '@angular/core'

export type TipoNotificacion = 'error' | 'aviso' | 'exito'

export interface Notificacion {
  readonly tipo: TipoNotificacion
  readonly texto: string
}

// WL-45: un único punto para avisar al usuario de fallos globales (lo usa el errorInterceptor)
@Service()
export class Notificaciones {
  readonly actual = signal<Notificacion | null>(null)
  private timer: ReturnType<typeof setTimeout> | undefined

  mostrar(texto: string, tipo: TipoNotificacion = 'error'): void {
    this.actual.set({ texto, tipo })
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.actual.set(null), 6000)
  }

  cerrar(): void {
    clearTimeout(this.timer)
    this.actual.set(null)
  }
}
