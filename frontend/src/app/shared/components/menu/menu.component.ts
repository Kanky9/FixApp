import { Component, inject, Input, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  @Input() showBackButton: boolean = false;
  @Input() backButton!: string;

  logInLogOut: boolean = false;
  isAdmin: boolean = false; // Variable para controlar la visibilidad del botón admin-dashboard
  isCompany: boolean = false;

  /*
  ngOnInit() {
    this.firebaseSvc.getAuth().onAuthStateChanged((user) => {
      this.logInLogOut = !!user; // Si hay usuario, muestra el botón de cerrar sesión
    });
  }*/

  ngOnInit() {
    this.firebaseSvc.getAuth().onAuthStateChanged((user) => {
      this.logInLogOut = !!user;

      if (user) {
        this.firebaseSvc.getUserDocument(user.uid).then((userData: any) => {
          if (userData.exists) {
            this.isAdmin = userData.data().admin === true;
          }
        }).catch(error => {
          console.error('Error fetching user data:', error);
        });
      }

      if (user) {
        this.firebaseSvc.getUserDocument(user.uid).then((userData: any) => {
          if (userData.exists) {
            this.isCompany = userData.data().empresa === true;
          }
        }).catch(error => {
          console.error('Error fetching user data:', error);
        });
      }
    });
  }

  /* ========== Cerrar sesión ========== */
  singOut() {
    this.firebaseSvc.singOut();

    this.utilsSvc.presentToast({
        message: 'Tu cuenta se ha cerrado con éxito',
        duration: 2500,
        color: 'success',
        position: 'middle',
        icon: 'log-out-outline'
      })
  }
}