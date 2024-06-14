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