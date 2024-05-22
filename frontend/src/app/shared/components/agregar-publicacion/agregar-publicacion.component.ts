import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { CategoriasService } from 'src/app/services/categorias.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-agregar-publicacion',
  templateUrl: './agregar-publicacion.component.html',
  styleUrls: ['./agregar-publicacion.component.scss'],
})
export class AgregarPublicacionComponent implements OnInit {
  form = new FormGroup({
    id: new FormControl(''),
    imagePrincipal: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    imagenes: new FormControl([]), // Array para almacenar las imágenes
    categoria: new FormControl('', [Validators.required]),
    area: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    ubicacion: new FormControl('', [ Validators.required, Validators.minLength(4),]),
    direccion: new FormControl('', [ Validators.required, Validators.minLength(4),]),
    telefono: new FormControl(null, [ Validators.required, Validators.minLength(10), Validators.maxLength(10),]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  categoriasSvc = inject(CategoriasService); 

  user = {} as User;
  product = {} as Product;

  categorias = [];
  areas: string[] = [];

  ngOnInit(): void {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.categorias = this.categoriasSvc.getCategorias();
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

  /* ========== Tomar/Seleccionar Imagen ========== */
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

  async submit() {
    if (this.form.valid) {
      //let path = `user/${this.user.uid}/products`;

      const loading = await this.utilsSvc.presentCustomLoading(
        'Creando Publicación...'
      );

      /* ========== Subir imagen y obtener url ========== */
      let dataUrl = this.form.value.imagePrincipal;
      let imagePath = `${this.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

      /* Obtener las URLs de las imágenes adicionales (hacer que se restaure el formulario y el array de imagenes)*/
      let imageUrls = [];
      for (let imageDataUrl of this.form.value.imagenes) {
        let imageExtraPath = `${this.user.uid}/${Date.now()}`;
        let imageUrl = await this.firebaseSvc.uploadImage(
          imageExtraPath,
          imageDataUrl
        );
        imageUrls.push(imageUrl);
      }

      /* ========== Actualizar los campos en el formulario ========== */
      this.form.controls.imagePrincipal.setValue(imageUrl);
      this.form.controls.imagenes.setValue(imageUrls);

      delete this.form.value.id;

      const product: Product = {
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

      /* ========== Agregar el documento a Firebase ========== */
      await this.firebaseSvc
        .addProduct(product)
        .then(async (res) => {
          /*
        await this.firebaseSvc.updateUser(this.form.value.nombre);
        await this.firebaseSvc.updateUser(this.form.value.categoria);
        await this.firebaseSvc.updateUser(this.form.value.area);
        await this.firebaseSvc.updateUser(this.form.value.descripcion);
        await this.firebaseSvc.updateUser(this.form.value.ubicacion);
        await this.firebaseSvc.updateUser(this.form.value.direccion);
        await this.firebaseSvc.updateUser(this.form.value.telefono);

        */

          this.utilsSvc.presentToast({
            message: 'Publicación creada exitosamente',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });

          //this.utilsSvc.routerLink('/home');

          /* ========== Restablecer el formulario ========== */

          this.form.reset(); // Restablecer el formulario
          this.form.get('imagenes').setValue([]); // Restablecer el control de imágenes
          this.form.get('imagenes').markAsUntouched(); // Marcar como no tocado
          this.form.get('imagenes').markAsPristine(); // Marcar como no modificado
        })
        .catch((error) => {
          console.log(error);

          /* ========== Restablecer el formulario ========== */

          this.form.reset(); // Restablecer el formulario
          this.form.get('imagenes').setValue([]); // Restablecer el control de imágenes
          this.form.get('imagenes').markAsUntouched(); // Marcar como no tocado
          this.form.get('imagenes').markAsPristine(); // Marcar como no modificado

          this.utilsSvc.presentToast({
            message: 'Publicación creada exitosamente',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  async removeImage(index: number) {
    const currentImages = this.form.controls.imagenes.value;
    currentImages.splice(index, 1);
    this.form.controls.imagenes.setValue(currentImages);
  }

  async uploadImageToStorage(dataUrl: string) {
    const imagePath = `${this.user.uid}/${Date.now()}`;
    await this.firebaseSvc.uploadImage(imagePath, dataUrl);
    return imagePath;
  }
}