import { Component, inject, Input, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit{

  firebaseSvc = inject(FirebaseService); 
  utilsSvc = inject(UtilsService); 

  products: Product[] = [];
  loading: boolean = false; 
  currentUser: any;
  favoriteMap: { [key: string]: boolean } = {}; // Mapa para gestionar favoritos

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getAllProducts();
      event.target.complete();
    }, 1000);
  }
  
  async ngOnInit() {
    this.getAllProducts();
    
    await this.getAllProducts();
    this.currentUser = await this.firebaseSvc.getCurrentUser();
    if (this.currentUser) {
      const userDoc = await this.firebaseSvc.getUserDocument(this.currentUser.uid);
      const userData = userDoc?.data() as User | undefined;
      if (userData?.favorites) {
        // Inicializa el mapa de favoritos
        userData.favorites.forEach(favId => {
          this.favoriteMap[favId] = true;
        });
      }
    }
  }

  ionViewWillEnter() {
    this.getAllProducts();
  }

  getAllProducts() {
    this.loading = true;
    
    this.firebaseSvc.getAllProducts().subscribe({
      next: (res: any) => {
        console.log(res);
        this.products = res; 

        this.loading = false;
      },
      error: (error) => {
        console.log('Error al obtener las publicaciones:', error);
      }
    });
  }

  async toggleFavorite(publicacionId: string) {
    if (this.currentUser) {
      const userDoc = await this.firebaseSvc.getUserDocument(this.currentUser.uid);
      const userData = userDoc?.data() as User | undefined;
      let updatedFavorites = userData?.favorites || [];

      if (this.favoriteMap[publicacionId]) {
        const confirm = await this.utilsSvc.presentConfirm('Quitar de favoritos', '¿Deseas quitar esta publicación de tus favoritos?');
        if (confirm) {
          updatedFavorites = updatedFavorites.filter(id => id !== publicacionId);
          await this.firebaseSvc.updateUserFavorites(this.currentUser.uid, updatedFavorites);
          this.favoriteMap[publicacionId] = false;
          this.utilsSvc.presentToast({
            message: 'Publicación eliminada de favoritos',
            duration: 2500,
            color: 'danger'
          });
        }
      } else {
        updatedFavorites = [...updatedFavorites, publicacionId];
        await this.firebaseSvc.updateUserFavorites(this.currentUser.uid, updatedFavorites);
        this.favoriteMap[publicacionId] = true;
        this.utilsSvc.presentToast({
          message: 'Publicación añadida a favoritos',
          duration: 2500,
          color: 'success'
        });
      }
    }
  }
}