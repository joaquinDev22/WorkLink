import { Component, model } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-burger-menu',
  styleUrl: './burger-menu.css',
  templateUrl: './burger-menu.html',
})
export class BurgerMenu {
  isActivo = model<boolean>(false)

  onClick() : void{
    this.isActivo.update(activo => !activo)
  }
}
