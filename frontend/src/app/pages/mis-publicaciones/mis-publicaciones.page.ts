import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AgregarPublicacionComponent } from 'src/app/shared/components/agregar-publicacion/agregar-publicacion.component';

@Component({
  selector: 'app-mis-publicaciones',
  templateUrl: './mis-publicaciones.page.html',
  styleUrls: ['./mis-publicaciones.page.scss'],
})
export class MisPublicacionesPage implements OnInit {
  user: any; // Define una variable para almacenar el usuario actual
  myProducts: any[] = []; // Define una variable para almacenar las publicaciones del usuario

  loading: boolean = false;

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user'); // Obtiene el usuario actual
    this.getMyProducts(); // Obtiene las publicaciones del usuario actual
  }

  getMyProducts() {
    if (this.user && this.user.uid) {
      
      this.loading = true;
      
      this.firebaseSvc
        .getCollectiondata('products', (ref) =>
          ref.where('userId', '==', this.user.uid)
        )
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.myProducts = res;

            this.loading = false;
          },
          error: (error) => {
            console.log('Error al obtener mis publicaciones:', error);
          },
        });
    }
  }

  editProduct(productId: string) {
    this.router.navigate(['/editar-publicacion', productId]);
  }

  async confirmDelete(product: Product) {
    const confirm = await this.utilsSvc.presentAlert({
      header: 'Eliminar Publicación',
      message: '¿Estás seguro de que quieres eliminar esta publicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Acción cancelada');
          },
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteProduct(product);
          },
        },
      ],
    });

    await confirm.present();
  }

  deleteProduct(product: Product) {
    // Lógica para eliminar el producto desde Firebase
    // Supongamos que tienes un método en FirebaseService llamado deleteProduct()
    this.firebaseSvc
      .deleteProduct(product.productId)
      .then(() => {
        this.utilsSvc.presentToast({
          message: 'Publicación eliminada exitosamente',
          duration: 2500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
        // Vuelve a cargar las publicaciones después de eliminar
        this.getMyProducts();
      })
      .catch((error) => {
        console.log('Error al eliminar la publicación:', error);
        this.utilsSvc.presentToast({
          message: 'Error al eliminar la publicación',
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      });
  }

  /*
  deleteProduct(productId: string) {
    this.firebaseSvc
      .deleteProduct(productId)
      .then(() => {
        // Actualiza la lista de productos después de la eliminación
        this.getMyProducts();
        this.utilsSvc.presentToast({
          message: 'Publicación eliminada exitosamente',
          duration: 2500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        console.error('Error al eliminar la publicación:', error);
        this.utilsSvc.presentToast({
          message: 'Error al eliminar la publicación',
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      });
  }*/
}





  /*
  editProduct(product: Product) {
    this.utilsSvc.saveInLocalStorage('productToEdit', product);
    this.utilsSvc.routerLink('/agregar-publicaciones');
  }*/


/* editarProducto(productId: string) {
    // Navega a la página de edición del producto pasando el ID del producto como parámetro en la URL
    this.router.navigate(['/editar-publicacion', productId]);
  }
  editarProducto(productId: string) {
  this.router.navigate(['/editar-publicacion', productId]);
}

  editProduct(productId: string, updateProduct: any) {
    this.firebaseSvc.updateProduct(productId, updateProduct).then(() => {
    // Actualizar la lista de productos después de la edición
      this.getMyProducts();
      this.utilsSvc.presentToast({
        message: 'Publicación editada exitosamente',
        duration: 2500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.error('Error al editar la publicación:', error);
      this.utilsSvc.presentToast({
        message: 'Error al editar la publicación',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    });
  }*/
