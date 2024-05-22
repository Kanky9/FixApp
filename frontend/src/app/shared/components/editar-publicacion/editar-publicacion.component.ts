import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormGroup,FormBuilder,Validators,FormControl,} from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'firebase/auth';
import { UtilsService } from 'src/app/services/utils.service';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.component.html',
  styleUrls: ['./editar-publicacion.component.scss'],
})
export class EditarPublicacionComponent implements OnInit {
  productId: string;
  isEditing: boolean = false;

  form = new FormGroup({
    id: new FormControl(''),
    imagePrincipal: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    imagenes: new FormControl([]),
    categoria: new FormControl('', [Validators.required]),
    area: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    ubicacion: new FormControl('', [ Validators.required, Validators.minLength(4),]),
    direccion: new FormControl('', [ Validators.required, Validators.minLength(4),]),
    telefono: new FormControl(null, [ Validators.required, Validators.minLength(10), Validators.maxLength(10),]),
  });

  user = {} as User;
  product = {} as Product;

  categorias = [];
  areas: string[] = [];

  
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  categoriasSvc = inject(CategoriasService);
 
  ngOnInit(): void {
    this.user = this.utilsSvc.getFromLocalStorage('user');

    this.route.params.subscribe((params) => {
      if (params['productId']) {
        this.productId = params['productId'];
        this.isEditing = true;
        this.loadProductDetails();
      }
    });

    this.categorias = this.categoriasSvc.getCategorias();
  }

  loadProductDetails() {
    this.firebaseSvc
      .getDocument(`products/${this.productId}`)
      .then((product: Product) => {
        this.product = product; // Almacenar el producto recuperado
        this.populateForm();
      })
      .catch((error) => {
        console.log('Error al obtener detalles del producto:', error);
      });
  }

  populateForm() {
    this.form.patchValue({
      imagePrincipal: this.product.imagePrincipal,
      nombre: this.product.nombre,
      imagenes: this.product.imagenes,
      categoria: this.product.categoria,
      area: this.product.area,
      descripcion: this.product.descripcion,
      ubicacion: this.product.ubicacion,
      direccion: this.product.direccion,
      telefono: this.product.telefono,
    });
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.presentCustomLoading(
        'Actualizando Publicación...'
      );

      const product: Product = {
        productId: this.productId,
        userId: this.user.uid,
        imagePrincipal: this.form.value.imagePrincipal,
        nombre: this.form.value.nombre,
        imagenes: this.form.value.imagenes,
        categoria: this.form.value.categoria,
        area: this.form.value.area,
        descripcion: this.form.value.descripcion,
        ubicacion: this.form.value.ubicacion,
        direccion: this.form.value.direccion,
        telefono: this.form.value.telefono,
      };

      this.firebaseSvc
        .updateProduct(this.productId, product)
        .then(async (res) => {
          this.utilsSvc.presentToast({
            message: 'Publicación actualizada exitosamente',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });

          this.form.reset();
          this.form.get('imagenes').setValue([]);
          this.form.get('imagenes').markAsUntouched();
          this.form.get('imagenes').markAsPristine();
        })
        .catch((error) => {
          console.log('Error al actualizar la publicación:', error);
          this.utilsSvc.presentToast({
            message: 'Error al actualizar la publicación',
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }


  async takeImage() {
    const dataUrl = await this.utilsSvc.takePicture('imagen de la publicación');
    this.form.controls.imagePrincipal.setValue(dataUrl);
  }

  async selectImages() {
    const maxImages = 6 - this.form.controls.imagenes.value.length;
    const selectedImage = await this.utilsSvc.takePicture(
      'Selecciona una imagen'
    );
    const currentImages = this.form.controls.imagenes.value;
    for (let i = 0; i < maxImages; i++) {
      this.form.controls.imagenes.setValue([...currentImages, selectedImage]);
    }
  }

  async removeImage(index: number) {
    const currentImages = this.form.controls.imagenes.value;
    currentImages.splice(index, 1);
    this.form.controls.imagenes.setValue(currentImages);
  }

  getCategoriaAreas(categoriaNombre: string): string[] {
    const categoria = this.categorias.find((c) => c.nombre === categoriaNombre);
    return categoria ? categoria.areas : [];
  }

  categoriaSeleccionada(categoriaNombre: string) {
    const categoriaSeleccionada = this.categorias.find(
      (categoria) => categoria.nombre === categoriaNombre
    );
    if (categoriaSeleccionada) {
      this.areas = categoriaSeleccionada.areas;
      // Resetea el área seleccionada cuando cambia la categoría
      this.form.get('area').patchValue('');
    }
  }
}