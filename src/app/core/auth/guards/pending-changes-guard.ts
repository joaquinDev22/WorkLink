import { CanDeactivateFn } from '@angular/router';
import { HasPendingChanges } from '../../models/pending-changes.model';

/**
 * Guard funcional CanDeactivateFn.
 * Se ejecuta automáticamente cada vez que el usuario intenta salir de una ruta protegida.
 */
export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (component) => {
  // 1. Verificamos si el componente implementa la interfaz y si tiene cambios sin guardar
  if (component.hasPendingChanges && component.hasPendingChanges()) {
    // 2. Mostramos advertencia al usuario. Si elige "Cancelar", el router cancela la navegación
    return confirm(
      'Tienes cambios sin guardar en el formulario. ¿Estás seguro de que deseas salir? Los cambios se perderán.'
    );
  }

  // 3. Si no hay cambios pendientes (o el formulario ya se guardó), permite salir libremente
  return true;
};