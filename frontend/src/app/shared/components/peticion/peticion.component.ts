import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-peticion',
  templateUrl: './peticion.component.html',
  styleUrls: ['./peticion.component.scss'],
})
export class PeticionComponent {

  form = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  async submit() {
    if (this.form.valid) {
      const userId = await (await this.firebaseSvc.getCurrentUser()).uid;
      const path = `users/${userId}`;
      await this.firebaseSvc.updateDocument(path, { message: this.form.value.message });
      this.utilsSvc.presentToast({
        message: 'Solicitud enviada con éxito',
        duration: 2500,
        color: 'success',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      this.form.reset();
    }
  }
}
