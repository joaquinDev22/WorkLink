import { esFinDeSemana, fechaLegible, proximoDiaHabilISO } from './fechas'

describe('fechas', () => {
  it('detecta sábados y domingos en hora local', () => {
    expect(esFinDeSemana('2026-11-21')).toBe(true) // sábado
    expect(esFinDeSemana('2026-11-22')).toBe(true) // domingo
    expect(esFinDeSemana('2026-11-23')).toBe(false) // lunes
  })

  it('el próximo día hábil nunca es fin de semana ni hoy', () => {
    const proximo = proximoDiaHabilISO()
    expect(esFinDeSemana(proximo)).toBe(false)
    expect(proximo > new Date().toLocaleDateString('sv')).toBe(true)
  })
})

describe('fechaLegible', () => {
  it('muestra el día de la semana y el mes en palabras', () => {
    expect(fechaLegible('2026-11-25')).toBe('miércoles, 25 de noviembre')
  })
})
