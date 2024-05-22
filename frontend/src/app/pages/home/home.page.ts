import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  router = inject(Router);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = false;
  currentUser: any;
  favoriteMap: { [key: string]: boolean } = {};
  searchText: string = '';

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
        this.products = res;
        this.filteredProducts = this.products;
        this.loading = false;
      },
      error: (error) => {
        console.log('Error al obtener las publicaciones:', error);
      }
    });
  }

  onSearchChange(event: any) {
    this.searchText = event.target.value.trim().toLowerCase();

    if (this.searchText === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        this.searchText.split(' ').every(keyword =>
          Object.values(product).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(keyword)
          )
        )
      );
    }
  }

  goToPublicacion(productId: string) {
    this.router.navigate(['/publicacion', productId]);
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