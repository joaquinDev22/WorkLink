import { Component, inject, input, output, signal } from '@angular/core'
import { Router } from '@angular/router'
import { environment } from '../../../../../../environments/environment'
import { MercadoPagoPreferenceResponseDTO } from '../../models/mercadopago.models'
import { Mercadopago } from '../../services/mercadopago'

@Component({
  imports: [],
  selector: 'app-mp-checkout-button',
  styleUrl: './mp-checkout-button.css',
  templateUrl: './mp-checkout-button.html'
})
export class MpCheckoutButton {
  private mpService = inject(Mercadopago)
  private router = inject(Router)

  readonly proyectoId = input.required<number>()
  readonly monto = input<number | null>(null)
  readonly disabled = input<boolean>(false)
  readonly label = input<string>('Pagar con MercadoPago')

  readonly checkoutError = output<string>()
  readonly preferenceCreated = output<MercadoPagoPreferenceResponseDTO>()

  readonly isRedirecting = signal<boolean>(false)

  iniciarCheckout(): void {
    if (this.disabled() || this.isRedirecting()) return

    const id = this.proyectoId()
    const montoVal = this.monto()
    if (montoVal !== null && (!Number.isFinite(montoVal) || montoVal <= 0)) {
      this.checkoutError.emit('Ingresá un monto válido mayor a 0 para iniciar el checkout.')
      return
    }

    this.isRedirecting.set(true)
    const backUrl = `${window.location.origin}/freelance`

    this.mpService.crearCheckoutPreference(id, montoVal ?? undefined, backUrl).subscribe({
      next: (pref) => {
        this.preferenceCreated.emit(pref)
        const targetUrl = pref?.initPoint || pref?.sandboxInitPoint

        if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
          this.isRedirecting.set(false)
          this.checkoutError.emit(
            'La pasarela no devolvió una URL válida de pago. Intentá nuevamente o registrá un pago directo.'
          )
          return
        }

        if (environment.bypassAuth) {
          this.isRedirecting.set(false)
          const parsed = new URL(targetUrl)
          this.router.navigateByUrl(`${parsed.pathname}${parsed.search}`)
          return
        }

        // Redirección en la misma pestaña para compatibilidad con autoReturn de Checkout Pro
        window.location.assign(targetUrl)
      },
      error: (err) => {
        this.isRedirecting.set(false)
        const msg = err?.error?.message
        const safeMsg =
          typeof msg === 'string' && msg.trim().length > 0 && !/Exception|Trace|java\./i.test(msg)
            ? msg
            : 'No pudimos conectar con MercadoPago Checkout Pro. Verificá los datos o probá registrar el pago directo.'
        this.checkoutError.emit(safeMsg)
      }
    })
  }
}
