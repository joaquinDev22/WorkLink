import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter, withViewTransitions } from '@angular/router'
import { routes } from './app.routes'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { authInterceptor } from './core/auth/interceptors/auth-interceptor'
import { errorInterceptor } from './core/auth/interceptors/error-interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({ skipInitialTransition: true })
    ),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
}
