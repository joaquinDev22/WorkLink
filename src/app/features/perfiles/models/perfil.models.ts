// Perfil DTO contracts
export type NivelHabilidad = 1 | 2 | 3 | 4 | 5// 1: Básico, 2: Intermedio, 3: Avanzado, 4: Experto

export interface PerfilHabilidadDTO {
  habilidadId: number
  nombre: string
  nivel: NivelHabilidad
}

export interface HabilidadCatalogoDTO {
  id: number
  name: string
  habilidadId?: number
  nombreHabilidad?: string
}

export interface PerfilProyectoPortafolioDTO {
  id: number
  nombre: string
  descripcion: string
  link?: string
  imagen?: string // byte[] serializado en Base64
}

// GET /api/v1/perfiles/getProfile y PUT /api/v1/perfiles/updateProfile
export interface PerfilUsuarioDTO {
  nombre: string
  apellido?: string
  email: string
  rol: string
  tieneCv?: boolean // <-- Bandera que devuelve el backend
  fechaNacimiento?: string
  telefono?: string
  pais?: string
  descripcion?: string
  ubicacion?: string
  sitioWeb?: string
  logo?: string
  fotoPerfil?: string
  bannerPerfil?: string
  habilidades: PerfilHabilidadDTO[]
  proyectos: PerfilProyectoPortafolioDTO[]
}

export interface EditProfileModel {
  nombre: string
  apellido: string
  telefono: string
  pais: string
  descripcion: string
  ubicacion: string
  sitioWeb: string
  fechaNacimiento: string
  email?: string
  rol?: string
  tieneCv?: boolean
}
export interface ItemFaltantePerfil {
  label: string
  clave: string
  completado: boolean
}

export interface PerfilCompletitud {
  porcentaje: number
  completado: boolean
  itemsFaltantes: ItemFaltantePerfil[]
}

export function calcularFaltantesPorRol(
  rol: string,
  p: Partial<PerfilUsuarioDTO>
): { puntos: number; items: ItemFaltantePerfil[] } {
  const items: ItemFaltantePerfil[] = []
  let puntos = 0

  if (rol === 'EMPRESA') {
    if (p.logo || p.fotoPerfil) puntos += 20
    else items.push({ clave: 'logo', label: 'Logotipo oficial', completado: false })

    if (p.bannerPerfil) puntos += 15
    else items.push({ clave: 'banner', label: 'Portada corporativa', completado: false })

    if (p.descripcion && p.descripcion.trim().length >= 10) puntos += 20
    else items.push({ clave: 'descripcion', label: 'Descripción corporativa', completado: false })

    if (p.ubicacion?.trim() || p.pais?.trim()) puntos += 15
    else items.push({ clave: 'ubicacion', label: 'País o sede principal', completado: false })

    if (p.sitioWeb && p.sitioWeb.trim().length > 4) puntos += 15
    else items.push({ clave: 'sitioWeb', label: 'Sitio web oficial', completado: false })

    if (p.telefono?.trim()) puntos += 15
    else items.push({ clave: 'telefono', label: 'Teléfono corporativo', completado: false })

    return { puntos, items }
  }

  if (rol === 'RECRUITER') {
    if (p.fotoPerfil) puntos += 20
    else items.push({ clave: 'foto', label: 'Foto de perfil', completado: false })

    if (p.bannerPerfil) puntos += 15
    else items.push({ clave: 'banner', label: 'Banner de portada', completado: false })

    if (p.descripcion && p.descripcion.trim().length >= 15) puntos += 25
    else items.push({ clave: 'descripcion', label: 'Resumen de trayectoria', completado: false })

    if (p.telefono?.trim()) puntos += 20
    else items.push({ clave: 'telefono', label: 'Teléfono corporativo', completado: false })

    if (p.ubicacion?.trim() || p.pais?.trim()) puntos += 20
    else items.push({ clave: 'ubicacion', label: 'Ubicación o país', completado: false })

    return { puntos, items }
  }

  if (rol === 'CLIENTE') {
    if (p.fotoPerfil) puntos += 15
    else items.push({ clave: 'foto', label: 'Foto de perfil', completado: false })

    if (p.bannerPerfil) puntos += 15
    else items.push({ clave: 'banner', label: 'Banner de portada', completado: false })

    if (p.telefono?.trim()) puntos += 20
    else items.push({ clave: 'telefono', label: 'Teléfono de contacto', completado: false })

    if (p.pais?.trim() || p.ubicacion?.trim()) puntos += 15
    else items.push({ clave: 'pais', label: 'País o ubicación', completado: false })

    if (p.fechaNacimiento?.trim()) puntos += 15
    else items.push({ clave: 'fechaNacimiento', label: 'Fecha de nacimiento', completado: false })

    if (p.descripcion && p.descripcion.trim().length >= 10) puntos += 20
    else items.push({ clave: 'descripcion', label: 'Biografía o resumen', completado: false })

    return { puntos, items }
  }

  if (rol === 'FREELANCER') {
    if (p.fotoPerfil) puntos += 25
    else items.push({ clave: 'foto', label: 'Foto de perfil', completado: false })

    if (p.bannerPerfil) puntos += 15
    else items.push({ clave: 'banner', label: 'Banner de portada', completado: false })

    if (p.descripcion && p.descripcion.trim().length >= 15) puntos += 25
    else items.push({ clave: 'descripcion', label: 'Biografía profesional freelance', completado: false })

    const cantHabs = p.habilidades?.length ?? 0
    if (cantHabs >= 3) puntos += 20
    else {
      if (cantHabs > 0) puntos += 10
      items.push({ clave: 'habilidades', label: cantHabs > 0 ? 'Agrega al menos 3 habilidades' : 'Habilidades técnicas', completado: false })
    }

    if ((p.proyectos?.length ?? 0) > 0) puntos += 15
    else items.push({ clave: 'proyectos', label: 'Portafolio de proyectos', completado: false })

    return { puntos, items }
  }

  // POSTULANTE / EMPLOYEE
  if (p.tieneCv) puntos += 25
  else items.push({ clave: 'cv', label: 'Adjuntar CV (PDF)', completado: false })

  if (p.fotoPerfil) puntos += 15
  else items.push({ clave: 'foto', label: 'Foto de perfil', completado: false })

  if (p.bannerPerfil) puntos += 10
  else items.push({ clave: 'banner', label: 'Banner de portada', completado: false })

  if (p.descripcion && p.descripcion.trim().length >= 15) puntos += 20
  else items.push({ clave: 'descripcion', label: 'Biografía profesional', completado: false })

  const cantHabs = p.habilidades?.length ?? 0
  if (cantHabs >= 3) puntos += 15
  else {
    if (cantHabs > 0) puntos += 8
    items.push({ clave: 'habilidades', label: cantHabs > 0 ? 'Agrega al menos 3 habilidades' : 'Habilidades técnicas', completado: false })
  }

  if ((p.proyectos?.length ?? 0) > 0) puntos += 15
  else items.push({ clave: 'proyectos', label: 'Proyectos de portafolio', completado: false })

  return { puntos, items }
}

export function calcularCompletitudPorRol(rol: string, p: Partial<PerfilUsuarioDTO>): PerfilCompletitud {
  const { puntos, items } = calcularFaltantesPorRol(rol, p)
  const porcentaje = Math.min(100, Math.max(0, puntos))
  return {
    porcentaje,
    completado: porcentaje === 100 && items.length === 0,
    itemsFaltantes: items
  }
}


// Calificaciones y Reputación (WL-19: US-12)
export interface CalificacionDTO {
  id: number
  autorNombre: string
  autorFoto?: string
  autorRol?: string
  puntuacion: number
  comentario: string
  fecha: string
  proyectoNombre?: string
}

export interface ReputacionPerfilDTO {
  promedio: number
  totalCalificaciones: number
  desglose: {
    estrellas5: number
    estrellas4: number
    estrellas3: number
    estrellas2: number
    estrellas1: number
  }
  calificaciones: CalificacionDTO[]
}
