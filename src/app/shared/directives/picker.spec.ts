import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { describe, expect, it } from 'vitest'
import { Picker } from './picker'

@Component({
  imports: [FormsModule, Picker],
  template: `<input id="f" type="text" appPicker="fecha" pickerMin="2026-01-01" [soloDiasHabiles]="true"
               [ngModel]="fecha()" (ngModelChange)="fecha.set($event)" />`
})
class Host {
  fecha = signal('')
}

async function crear(valor: string) {
  const fixture = TestBed.createComponent(Host)
  fixture.componentInstance.fecha.set(valor)
  fixture.detectChanges()
  await fixture.whenStable()
  fixture.detectChanges()
  return fixture
}

describe('Picker', () => {
  it('muestra el valor del formulario y le devuelve lo que se elige', async () => {
    const fixture = await crear('2026-11-25') // miércoles
    const visible = fixture.nativeElement.querySelector('#f') as HTMLInputElement
    expect(visible.value).toContain('2026')

    const fp = (fixture.nativeElement.querySelector('input[type=hidden]') as HTMLInputElement & { _flatpickr: { setDate(d: string, t: boolean): void } })._flatpickr
    fp.setDate('2026-11-27', true)
    expect(fixture.componentInstance.fecha()).toBe('2026-11-27')
  })

  it('descarta una fecha no permitida y se lo avisa al formulario', async () => {
    const fixture = await crear('2026-11-21') // sábado
    expect(fixture.componentInstance.fecha()).toBe('')
  })
})
