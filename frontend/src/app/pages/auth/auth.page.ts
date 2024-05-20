import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage  {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]), 
    password: new FormControl( '', [Validators.required]), 
  });
  

  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService); 

  async submit() {
    if (this.form.valid) {

      //const loading = await this.utilsSvc.presentCustomLoading('Iniciando sesión...');

      this.firebaseSvc.singIn(this.form.value as User).then(res => {
        
        this.getUserInfo(res.user.uid); 
      })
        .catch(error => {
          console.log(error);

          this.utilsSvc.presentToast({
            message: 'Los datos son incorrectos',
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline'
          })
        })
          .finally(() => {
            //loading.dismiss(); 
          })
    }
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {

      const loading = await this.utilsSvc.presentCustomLoading('Iniciando sesión...');

      let path = `users/${uid}`;

      this.firebaseSvc.getDocument(path).then( (user: User) => {

        this.utilsSvc.saveInLocalStorage('user', user);
        //this.utilsSvc.routerLink('/home'); cuando me logueo y vuelvo al home no funciona el boton del menu.
        this.form.reset();
      
        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida a Fix, ${user.nombre}`,
          duration: 2500,
          color: 'success',
          position: 'middle',
          icon: 'person-circle'
        })
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