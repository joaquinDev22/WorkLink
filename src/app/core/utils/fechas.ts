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
