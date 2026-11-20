import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { Notificaciones } from '../../services/notificaciones'
import { errorInterceptor } from './error-interceptor'

function responderError(status: number, details: string[]): string | undefined {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()]
  })
  TestBed.inject(HttpClient).post('/api/v1/algo', {}).subscribe({ error: () => undefined })
  TestBed.inject(HttpTestingController).expectOne('/api/v1/algo').flush({ details }, { status, statusText: 'x' })
  return TestBed.inject(Notificaciones).actual()?.texto
}

describe('errorInterceptor', () => {
  it('no muestra el SQL de un error 500', () => {
    const texto = responderError(500, ["Unknown column 're1_0.baja_solicitada_en' in 'field list'"])
    expect(texto).toBe('Algo falló de nuestro lado. Inténtalo de nuevo en unos minutos.')
  })

  it('muestra el mensaje de una regla de negocio', () => {
    const texto = responderError(422, ['Ese horario ya está ocupado por otra entrevista. Elige otro día u hora.'])
    expect(texto).toBe('Ese horario ya está ocupado por otra entrevista. Elige otro día u hora.')
  })

  it('saca el nombre del campo de los errores de validación', () => {
    const texto = responderError(400, [
      'nombreProyecto: El nombre del proyecto no puede superar los 30 caracteres',
      'area: El área no puede superar los 10 caracteres'
    ])
    expect(texto).toBe('El nombre del proyecto no puede superar los 30 caracteres. El área no puede superar los 10 caracteres')
  })
})
