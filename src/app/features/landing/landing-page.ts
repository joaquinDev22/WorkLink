import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export type Recorrido = 'POSTULANTE' | 'EMPRESA' | 'FREELANCE'

export interface RecorridoItem {
  readonly id: Recorrido
  readonly etiqueta: string
  readonly titulo: string
  readonly pasos: readonly string[]
}

gsap.registerPlugin(ScrollTrigger)

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements AfterViewInit, OnDestroy {
  private hostEl = inject(ElementRef<HTMLElement>)
  private gsapCtx: gsap.Context | null = null

  // Los tres recorridos reales del MVP (dossier §2.8): sin métricas ni testimonios inventados
  readonly recorridos: readonly RecorridoItem[] = [
    {
      id: 'POSTULANTE',
      etiqueta: 'Postulantes',
      titulo: 'Encuentra tu primer empleo en IT',
      pasos: [
        'Crea tu cuenta con email o Google y elige el rol Postulante.',
        'Completa tu perfil: habilidades, portfolio y CV en PDF.',
        'Filtra vacantes por modalidad y tecnología, y postúlate con una carta.',
        'Sigue el estado de cada postulación y entra a la entrevista por Google Meet.'
      ]
    },
    {
      id: 'EMPRESA',
      etiqueta: 'Empresas',
      titulo: 'Contrata con un proceso ordenado',
      pasos: [
        'Registra la empresa y completá su perfil corporativo.',
        'Da de alta a tus recruiters con el email con el que se registraron.',
        'Publica vacantes y revisa a cada candidato con su CV.',
        'Agenda entrevistas técnicas con fecha, hora y enlace de videollamada.'
      ]
    },
    {
      id: 'FREELANCE',
      etiqueta: 'Freelance',
      titulo: 'Proyectos por hitos, pagados antes de empezar',
      pasos: [
        'El cliente publica un proyecto con su rango de presupuesto.',
        'Los freelancers envían propuestas y el cliente adjudica la que elige.',
        'El monto acordado se divide en partes iguales entre los hitos.',
        'Cada hito se paga con Mercado Pago antes de empezar; el freelancer lo entrega y se habilita el siguiente.'
      ]
    }
  ]

  // Respuestas basadas en lo que el sistema hace hoy (sin promesas de soporte, comisiones ni garantías)
  readonly preguntas: readonly { pregunta: string; respuesta: string }[] = [
    { pregunta: '¿Cuánto cuesta usar WorkLink?', respuesta: 'Crear la cuenta es gratis en cualquier rol. En los proyectos freelance, el cliente paga cada hito por Mercado Pago.' },
    { pregunta: '¿Puedo buscar empleo y hacer freelance con la misma cuenta?', respuesta: 'Sí. Si eres postulante, cambias a modo freelancer desde tu perfil con un clic, sin crear otra cuenta.' },
    { pregunta: '¿Cómo se paga un hito?', respuesta: 'El cliente paga el próximo hito pendiente con Mercado Pago Checkout Pro. Cuando el pago se confirma, el hito pasa a en progreso y el freelancer empieza a trabajar.' },
    { pregunta: '¿WorkLink guarda los datos de mi tarjeta?', respuesta: 'No. El pago se hace en Mercado Pago; WorkLink solo registra el monto y el número de operación para el historial.' },
    { pregunta: '¿Cómo sumo a mi equipo de recruiters?', respuesta: 'Cada recruiter se registra con el rol Recruiter. Después, la empresa lo da de alta desde su panel con el mismo email y ya puede gestionar las vacantes.' }
  ]

  readonly recorridoActivo = signal<Recorrido>('POSTULANTE')
  readonly recorridoSeleccionado = computed(
    () => this.recorridos.find((r) => r.id === this.recorridoActivo()) ?? this.recorridos[0]
  )

  ngAfterViewInit(): void {
    this.iniciarAnimacionesLanding()
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert()
  }

  cambiarRecorrido(id: Recorrido): void {
    if (this.recorridoActivo() === id) return
    this.recorridoActivo.set(id)

    queueMicrotask(() => {
      const scope = gsap.context(() => {
        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.from('.paso-item', {
            y: 12,
            autoAlpha: 0,
            duration: 0.28,
            stagger: 0.04,
            ease: 'power3.out',
            force3D: true,
            clearProps: 'transform,opacity,visibility'
          })
        })
      }, this.hostEl.nativeElement)
      this.gsapCtx?.add(() => scope.revert())
    })
  }

  private iniciarAnimacionesLanding(): void {
    this.gsapCtx?.revert()
    this.gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } })

        heroTl
          .from('.hero-stagger', {
            y: 18,
            autoAlpha: 0,
            duration: 0.48,
            stagger: 0.08,
            clearProps: 'transform,opacity,visibility'
          })
          .from(
            '.hero-showcase',
            {
              y: 22,
              scale: 0.98,
              autoAlpha: 0,
              duration: 0.56,
              clearProps: 'transform,opacity,visibility'
            },
            '-=0.35'
          )

        gsap.from('.pilar-card', {
          y: 20,
          autoAlpha: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: {
            trigger: '.pilares-section',
            start: 'top 84%',
            once: true
          }
        })

        gsap.from('.ciclo-paso', {
          y: 16,
          autoAlpha: 0,
          duration: 0.4,
          stagger: 0.12,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: '.ciclo-section', start: 'top 80%', once: true }
        })

        gsap.from('.cta-slab', {
          y: 18,
          autoAlpha: 0,
          duration: 0.44,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: {
            trigger: '.cta-slab',
            start: 'top 88%',
            once: true
          }
        })
      })
    }, this.hostEl.nativeElement)
  }
}
