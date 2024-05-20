import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService); 

  async submit() {
    if (this.form.valid) {

      const loading = await this.utilsSvc.presentCustomLoading('Enviando mail ...');
      
      this.firebaseSvc.sendRecoveryEmail(this.form.value.email).then(res => {
        
         this.utilsSvc.presentToast({
            message: 'Correo enviado con éxito',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'mail'
         })
        
        this.utilsSvc.routerLink('/auth'); 
        this.form.reset(); 

      })
        .catch(error => {
          console.log(error);

          this.utilsSvc.presentToast({
            message: 'Los datos son incorrectos',
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle'
          })
        })
          .finally(() => {
            loading.dismiss(); 
          })
    }
  }
}
