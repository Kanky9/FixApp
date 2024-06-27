import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UserService } from 'src/app/services/user.service';
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
  userSvc = inject(UserService);
  
  async ngOnInit() {
    this.getUser();
  }

  async getUser(){
    this.userSvc.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.empresa = user?.empresa ?? false;
    });
    this.userSvc.loadCurrentUser();
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