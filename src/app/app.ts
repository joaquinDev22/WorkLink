import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastGlobal } from './shared/components/toast-global/toast-global';

@Component({
  imports: [RouterOutlet, ToastGlobal],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
