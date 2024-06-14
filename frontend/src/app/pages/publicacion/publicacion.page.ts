import { Component, inject, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Product } from 'src/app/models/product.model';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.page.html',
  styleUrls: ['./publicacion.page.scss'],
})
export class PublicacionPage implements OnInit {

  publicacionId: string;
  publicacion: Product;
  image: string[] = [];
  selectedIndex = 0;

  touchStartX = 0;
  touchEndX = 0;
  swipeThreshold = 50; // Umbral para considerar un deslizamiento

  mouseStartX = 0;
  mouseEndX = 0;
  isMouseDown = false;


  @Input() indicators = true; 

  route = inject(ActivatedRoute);
  firebaseSvc = inject(FirebaseService);
  sanitizer = inject(DomSanitizer);
  plataform = inject(Platform); 

  ngOnInit() {
    this.publicacionId = this.route.snapshot.paramMap.get('productId');
    this.getPublicacion();
  }

  getPublicacion() {
    this.firebaseSvc.getAllProducts().subscribe({
      next: (res: Product[]) => {
        this.publicacion = res.find(product => product.productId === this.publicacionId);
        if (this.publicacion) {
          this.image = [this.publicacion.imagePrincipal, ...this.publicacion.imagenes];
        }
      },
      error: (error) => {
        console.log('Error al obtener la publicación:', error);
      }
    });
  }

  selectImage(index: number): void {
    this.selectedIndex = index;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchMove(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
  }

  onTouchEnd(): void {
    if (this.touchEndX < this.touchStartX - this.swipeThreshold) {
      this.nextImage();
    } else if (this.touchEndX > this.touchStartX + this.swipeThreshold) {
      this.prevImage();
    }
  }

  nextImage(): void {
    if (this.selectedIndex < this.image.length - 1) {
      this.selectedIndex++;
    }
  }

  prevImage(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.mouseStartX = event.screenX;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.mouseEndX = event.screenX;
    }
  }

  onMouseUp(): void {
    this.isMouseDown = false;
    if (this.mouseEndX < this.mouseStartX - this.swipeThreshold) {
      this.nextImage();
    } else if (this.mouseEndX > this.mouseStartX + this.swipeThreshold) {
      this.prevImage();
    }
  }

  transformNewLinesToBr(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  getSanitizedHtml(text: string) {
    const transformedText = this.transformNewLinesToBr(text);
    return this.sanitizer.sanitize(SecurityContext.HTML, transformedText);
  }

  abrirEnGoogleMaps(ubicacion: string, direccion: string ) {
    const isMobile = this.plataform.is('cordova') || this.plataform.is('capacitor'); 
    const query = encodeURIComponent(`${ubicacion}, ${direccion}`); 
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`; 

    if (isMobile) {
      window.open(`geo:0,0?q=${query}`, '_system'); 
    } else {
      window.open(googleMapsUrl, '_blank');
    }
  }
}