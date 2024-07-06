import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { CategoriasService } from 'src/app/services/categorias.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.page.html',
  styleUrls: ['./publicaciones.page.scss'],
})
export class PublicacionesPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  categoriasSvc = inject(CategoriasService); // Inyectar el servicio
  actionSheetCtrl = inject(ActionSheetController); // Inyectar ActionSheetController
  router = inject(Router);

  appliedFiltersText: string = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = false;
  currentUser: any;
  favoriteMap: { [key: string]: boolean } = {}; // Mapa para gestionar favoritos

  // Filtros
  categorias: { nombre: string, areas: string[] }[] = []; // Categorías y sus áreas
  areas: string[] = [];
  filters = {
    categoria: '',
    area: '',
    ubicacion: '',
    direccion: '',
    palabraClave: '' // Añadir filtro de palabra clave
  };

  async ngOnInit() {
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
    this.loadCategorias(); // Cargar categorías y áreas
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getAllProducts();
  }

  getAllProducts() {
    this.loading = true;
    this.firebaseSvc.getAllProducts().subscribe({
      next: (res: any) => {
        this.products = res;
        this.filteredProducts = res; // Inicializa los productos filtrados
        this.loading = false;
      },
      error: (error) => {
        console.log('Error al obtener las publicaciones:', error);
        this.loading = false;
      },
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

  goToPublicacion(productId: string) {
    this.router.navigate(['/publicacion', productId]);
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const matchesCategoria = this.filters.categoria ? p.categoria === this.filters.categoria : true;
      const matchesArea = this.filters.area ? p.area === this.filters.area : true;
      const matchesUbicacion = this.filters.ubicacion ? p.ubicacion.toLowerCase().includes(this.filters.ubicacion.toLowerCase()) : true;
      const matchesDireccion = this.filters.direccion ? p.direccion.toLowerCase().includes(this.filters.direccion.toLowerCase()) : true;
      const matchesPalabraClave = this.filters.palabraClave ? (
        p.nombre.toLowerCase().includes(this.filters.palabraClave.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(this.filters.palabraClave.toLowerCase()) ||
        p.categoria.toLowerCase().includes(this.filters.palabraClave.toLowerCase()) ||
        p.area.toLowerCase().includes(this.filters.palabraClave.toLowerCase()) ||
        p.ubicacion.toLowerCase().includes(this.filters.palabraClave.toLowerCase()) ||
        p.direccion.toLowerCase().includes(this.filters.palabraClave.toLowerCase())
      ) : true;

        return matchesCategoria && matchesArea && matchesUbicacion && matchesDireccion && matchesPalabraClave;
    });

    this.updateAppliedFiltersText(); // Llama a la función para actualizar el texto de filtros aplicados
  }

  updateAppliedFiltersText() {
    let filtersText = '';

    if (this.filters.categoria) {
      filtersText += `Categoría: ${this.filters.categoria}, `;
    }
    if (this.filters.area) {
      filtersText += `Área: ${this.filters.area}, `;
    }
    if (this.filters.ubicacion) {
      filtersText += `Ubicación: ${this.filters.ubicacion}, `;
    }
    if (this.filters.direccion) {
      filtersText += `Dirección: ${this.filters.direccion}, `;
    }
    if (this.filters.palabraClave) {
      filtersText += `Palabra clave: ${this.filters.palabraClave}, `;
    }

    // Eliminar la última coma y espacio si existe
    this.appliedFiltersText = filtersText.trim().slice(0, -1);
  }

  clearFilters() {
    this.filters = {
      categoria: '',
      area: '',
      ubicacion: '',
      direccion: '',
      palabraClave: ''
    };
    this.filteredProducts = this.products;
    this.appliedFiltersText = ''; // Limpiar el texto de filtros aplicados
  }

  // Cargar categorías y áreas desde el servicio
  loadCategorias() {
    this.categorias = this.categoriasSvc.getCategorias();
  }

  onCategoriaChange() {
    const selectedCategoria = this.categorias.find(c => c.nombre === this.filters.categoria);
    this.areas = selectedCategoria ? selectedCategoria.areas : [];
    this.applyFilters();
  }

  // Mostrar el Action Sheet para los filtros
  async presentFilters() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filtros',
      cssClass: 'categorias-action-sheet',
      buttons: [
        {
        text: 'Categoría',
        handler: async () => {
          const categoriasActionSheet = await this.actionSheetCtrl.create({
            header: 'Seleccionar Categoría',
            buttons: this.categorias.map(categoria => ({
              text: categoria.nombre,
              handler: () => {
                this.filters.categoria = categoria.nombre;
                this.onCategoriaChange();
              }
            })),
            cssClass: 'categorias-action-sheet' 
          });
          await categoriasActionSheet.present();
        }
      },
      {
        text: 'Área',
        handler: async () => {
          const areasActionSheet = await this.actionSheetCtrl.create({
            header: 'Seleccionar Área',
            buttons: this.areas.map(area => ({
              text: area,
              handler: () => {
                this.filters.area = area;
                this.applyFilters();
              }
            })),
            cssClass: 'categorias-action-sheet' 
          });
          await areasActionSheet.present();
        }
      },
        {
          text: 'Ubicación',
          handler: async () => {
            const alert = await this.utilsSvc.presentPrompt({
              header: 'Ubicación',
              inputs: [
                {
                  name: 'ubicacion',
                  type: 'text',
                  placeholder: 'Escribe una ubicación'
                }
              ],
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel',
                },
                {
                  text: 'Aceptar',
                  handler: (data) => {
                    this.filters.ubicacion = data.ubicacion;
                    this.applyFilters();
                  }
                }
              ],
            });
            await alert.present();
          }
        },
        {
          text: 'Dirección',
          handler: async () => {
            const alert = await this.utilsSvc.presentPrompt({
              header: 'Dirección',
              inputs: [
                {
                  name: 'direccion',
                  type: 'text',
                  placeholder: 'Escribe una Dirección'
                }
              ],
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel',
                },
                {
                  text: 'Aceptar',
                  handler: (data) => {
                    this.filters.direccion = data.direccion;
                    this.applyFilters();
                  }
                }
              ],
            });
            await alert.present();
          }
        },
        {
          text: 'Buscar por palabra clave',
          handler: async () => {
            const alert = await this.utilsSvc.presentPrompt({
              header: 'Buscar por palabra clave',
              inputs: [
                {
                  name: 'palabraClave',
                  type: 'text',
                  placeholder: 'Escribe una palabra clave',
                  
                }
              ],
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel',
                },
                {
                  text: 'Aceptar',
                  handler: (data) => {
                    this.filters.palabraClave = data.palabraClave;
                    this.applyFilters();
                  }
                }
              ]
            });
            await alert.present();
          }
        },
        {
          text: 'Limpiar Filtros',
          handler: () => {
            this.clearFilters();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
}