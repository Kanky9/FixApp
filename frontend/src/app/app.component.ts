import { Component, inject, OnInit } from '@angular/core';
import { UtilsService } from './services/utils.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{

  showSplash = true;
  isVideo = true; // Cambia esto a `false` si quieres usar un GIF en lugar del video

  constructor() {
    // Oculta la pantalla de carga después de que el video termine
    setTimeout(() => {
      this.showSplash = false;
    }, 3800); // Duración del video en milisegundos (ajusta según sea necesario)
  }
}