import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit{
  user: any;
  empresa: boolean = true;
  currentUser: User | null = null;
  
  
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);


  
  
async ngOnInit() {
    try {
      const authUser = await this.firebaseSvc.getCurrentUser();
      if (authUser) {
        const userDoc = await this.firebaseSvc.getUserDocument(authUser.uid);
        this.currentUser = userDoc.data() as User;

        if (this.currentUser) {
          this.empresa = this.currentUser.empresa;
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  goToRequestBusinessAccount() {
    if (this.currentUser) {
      this.utilsSvc.routerLink('/peticion');
    } else {
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener la información del usuario.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }
}