import { Component, inject, Input, OnInit } from '@angular/core';
import { DocumentData } from '@angular/fire/compat/firestore';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
})
export class FavoritosPage  implements OnInit{
  firebaseSvc = inject(FirebaseService); 
  utilsSvc = inject(UtilsService); 

  favoriteProducts: Product[] = [];
  loading: boolean = false; 
  currentUser: any;

  constructor() { }

  async ngOnInit() {
    this.loading = true;
    this.currentUser = await this.firebaseSvc.getCurrentUser();
    if (this.currentUser) {
      const userDoc = await this.firebaseSvc.getUserDocument(this.currentUser.uid);
      const userData = userDoc?.data() as User | undefined;
      if (userData?.favorites) {
        for (const favId of userData.favorites) {
          const product = await this.firebaseSvc.getProduct(favId);
          if (product) {
            this.favoriteProducts.push(product);
          }
        }
      }
    }
    this.loading = false;
  }

  async toggleFavorite(publicationId: string) {
    if (this.currentUser) {
      const userDoc = await this.firebaseSvc.getUserDocument(this.currentUser.uid);
      const userData = userDoc?.data() as User | undefined;
      let updatedFavorites = userData?.favorites || [];

      if (updatedFavorites.includes(publicationId)) {
        const confirm = await this.utilsSvc.presentConfirm('Quitar de favoritos', '¿Deseas quitar esta publicación de tus favoritos?');
        if (confirm) {
          updatedFavorites = updatedFavorites.filter(id => id !== publicationId);
          await this.firebaseSvc.updateUserFavorites(this.currentUser.uid, updatedFavorites);
          this.favoriteProducts = this.favoriteProducts.filter(product => product.productId !== publicationId);
          this.utilsSvc.presentToast({
            message: 'Publicación eliminada de favoritos',
            duration: 2500,
            color: 'danger'
          });
        }
      } else {
        updatedFavorites = [...updatedFavorites, publicationId];
        await this.firebaseSvc.updateUserFavorites(this.currentUser.uid, updatedFavorites);
        const product = await this.firebaseSvc.getProduct(publicationId);
        if (product) {
          this.favoriteProducts.push(product);
        }
        this.utilsSvc.presentToast({
          message: 'Publicación añadida a favoritos',
          duration: 2500,
          color: 'success'
        });
      }
    }
  }

  async doRefresh(event) {
    await this.ngOnInit();
    event.target.complete();
  }

}