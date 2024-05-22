import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  route = inject(ActivatedRoute);
  firebaseSvc = inject(FirebaseService);

  ngOnInit() {
    this.publicacionId = this.route.snapshot.paramMap.get('productId');
    this.getPublicacion();
  }

  getPublicacion() {
    this.firebaseSvc.getAllProducts().subscribe({
      next: (res: any) => {
        this.publicacion = res.find(product => product.productId === this.publicacionId);
      },
      error: (error) => {
        console.log('Error al obtener la publicación:', error);
      }
    });
  }
}
