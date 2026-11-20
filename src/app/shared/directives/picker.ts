import { Directive, DoCheck, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core'
import flatpickr from 'flatpickr'
import { Spanish } from 'flatpickr/dist/l10n/es'
import { Instance } from 'flatpickr/dist/types/instance'

/**
 * Reemplaza el selector nativo de fecha u hora por flatpickr, con el estilo del sitio.
 * El <input> sigue guardando 'YYYY-MM-DD' o 'HH:mm', así que funciona igual con ngModel,
 * [formField] o [value] + (input): cada cambio dispara 'input' en el elemento original.
 */
@Directive({ selector: 'input[appPicker]' })
export class Picker implements OnInit, DoCheck, OnDestroy {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement

  readonly appPicker = input<'fecha' | 'hora'>('fecha')
  /** Fecha mínima 'YYYY-MM-DD' u hora mínima 'HH:mm'. */
  readonly pickerMin = input<string | null>(null)
  readonly pickerMax = input<string | null>(null)
  readonly soloDiasHabiles = input<boolean>(false)

  private fp?: Instance
  private ultimoValor = ''

  ngOnInit(): void {
    const esHora = this.appPicker() === 'hora'
    const min = this.pickerMin() ?? undefined
    const max = this.pickerMax() ?? undefined

    this.fp = flatpickr(this.el, {
      locale: Spanish,
      disableMobile: true,
      ...(esHora
        ? { enableTime: true, noCalendar: true, time_24hr: true, dateFormat: 'H:i', minuteIncrement: 15, minTime: min, maxTime: max }
        : { dateFormat: 'Y-m-d', altInput: true, altFormat: 'j \\de F \\de Y', minDate: min, maxDate: max }),
      disable: this.soloDiasHabiles() ? [(d: Date) => d.getDay() === 0 || d.getDay() === 6] : [],
      onChange: () => this.avisarCambio(),
      onClose: () => this.el.dispatchEvent(new Event('blur'))
    }) as Instance

    // Con altInput el usuario ve un input nuevo: le pasamos el id para que el <label for> siga apuntando bien
    const visible = this.fp.altInput
    if (visible && this.el.id) {
      visible.id = this.el.id
      this.el.removeAttribute('id')
      const ayuda = this.el.getAttribute('aria-describedby')
      if (ayuda) visible.setAttribute('aria-describedby', ayuda)
    }
    this.ultimoValor = this.el.value
  }

  // El formulario puede cambiar el valor sin evento (por ejemplo, al cargar los datos guardados)
  ngDoCheck(): void {
    if (this.fp && this.el.value !== this.ultimoValor) {
      const nuevo = this.el.value
      this.ultimoValor = nuevo
      this.fp.setDate(nuevo || [], false)
      // Si el valor no está permitido (p. ej. una entrevista vieja en sábado), flatpickr lo descarta:
      // se lo avisamos al formulario para que no quede guardando una fecha que el usuario no ve
      if (nuevo && !this.el.value) this.avisarCambio()
    }
  }

  ngOnDestroy(): void {
    this.fp?.destroy()
  }

  private avisarCambio(): void {
    this.ultimoValor = this.el.value
    this.el.dispatchEvent(new Event('input', { bubbles: true }))
  }
}
