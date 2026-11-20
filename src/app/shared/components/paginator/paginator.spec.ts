import { paginar } from './paginator'

describe('paginar', () => {
  const items = [1, 2, 3, 4, 5, 6, 7]

  it('devuelve la página pedida', () => {
    expect(paginar(items, 2, 3)).toEqual([4, 5, 6])
    expect(paginar(items, 3, 3)).toEqual([7])
  })

  it('ajusta páginas fuera de rango a la primera o la última', () => {
    expect(paginar(items, 0, 3)).toEqual([1, 2, 3])
    expect(paginar(items, 9, 3)).toEqual([7])
    expect(paginar([], 4, 3)).toEqual([])
  })
})
