import { Component } from '@angular/core'
import { Header } from '../header/header'
import { Footer } from '../footer/footer'
import { RouterOutlet } from '@angular/router'

@Component({
  imports: [Header, Footer, RouterOutlet],
  selector: 'app-public-layout',
  styleUrl: './public-layout.css',
  templateUrl: './public-layout.html',
})
export class PublicLayout {}
