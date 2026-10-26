import { Observable } from 'rxjs';

/**
 * Contrato que debe implementar cualquier componente con formularios
 * o datos que requieran confirmación antes de salir de la pantalla.
 */
export interface HasPendingChanges {
  /**
   * Debe retornar `true` si el usuario tiene cambios pendientes sin guardar.
   * Puede ser sincrónico (boolean) o asincrónico (Observable<boolean>).
   */
  hasPendingChanges(): boolean | Observable<boolean>;
}
