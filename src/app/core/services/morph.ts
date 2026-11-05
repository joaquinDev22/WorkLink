import { ApplicationRef, Injectable, inject } from '@angular/core'
import { DOCUMENT } from '@angular/common'

interface VTLike {
  finished: Promise<void>
  skipTransition(): void
}

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => VTLike
}

@Injectable({ providedIn: 'root' })
export class MorphService {
  private readonly doc = inject(DOCUMENT) as DocWithVT
  private readonly appRef = inject(ApplicationRef)

  private prefersReduced(): boolean {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /** Ejecuta update dentro de una View Transition con fallback automático. */
  async run(update: () => void): Promise<void> {
    if (!this.doc.startViewTransition || this.prefersReduced()) {
      update()
      return
    }
    const transition = this.doc.startViewTransition(() => {
      update()
      this.appRef.tick()
    })
    try {
      await transition.finished
    } catch {
      // transición omitida o cancelada
    }
  }

  /** Asigna el nombre al elemento de origen ANTES de capturar el estado viejo. */
  name(el: HTMLElement, value: string): void {
    el.style.viewTransitionName = value
  }

  clear(el: HTMLElement | null): void {
    if (el) el.style.viewTransitionName = ''
  }
}

