// Fechas en formato YYYY-MM-DD según la hora LOCAL del usuario.
// No usar toISOString(): devuelve la fecha en UTC y en Argentina, después de las 21 hs, ya da el día siguiente.

export function fechaLocalISO(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function hoyISO(): string {
  return fechaLocalISO(new Date())
}

export function mananaISO(): string {
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  return fechaLocalISO(manana)
}

// 'YYYY-MM-DD' como fecha local (new Date('YYYY-MM-DD') la toma en UTC y en Argentina da el día anterior)
export function esFinDeSemana(iso: string): boolean {
  const [y, m, d] = iso.split('-').map(Number)
  const dia = new Date(y, m - 1, d).getDay()
  return dia === 0 || dia === 6
}

// 'YYYY-MM-DD' -> "miércoles 25 de noviembre", para mostrarle la fecha a una persona
export function fechaLegible(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Mañana, o el lunes siguiente si mañana cae en fin de semana
export function proximoDiaHabilISO(): string {
  const fecha = new Date()
  do fecha.setDate(fecha.getDate() + 1)
  while (fecha.getDay() === 0 || fecha.getDay() === 6)
  return fechaLocalISO(fecha)
}
