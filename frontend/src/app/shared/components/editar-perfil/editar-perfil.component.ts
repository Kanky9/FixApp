import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss'],
})
export class EditarPerfilComponent implements OnInit {

  editProfileForm: FormGroup;
  currentUser: User | null = null;
  originalEmail: string | null = null;
  
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private userSvc: UserService,
    private router: Router
  ) {
    this.editProfileForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      apellido: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefono: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      fecha: new FormControl('', [Validators.required]),
      dni: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      ubicacion: new FormControl('', [Validators.required, Validators.minLength(4)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(4)])
    });
  }

  async ngOnInit() {
    try {
      const authUser = await this.firebaseSvc.getCurrentUser();
      if (authUser) {
        const userDoc = await this.firebaseSvc.getUserDocument(authUser.uid);
        this.currentUser = userDoc.data() as User;

        if (this.currentUser) {
          this.originalEmail = this.currentUser.email;
          this.editProfileForm.patchValue(this.currentUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async submit() {
    if (this.editProfileForm.valid) {
      const loading = await this.utilsSvc.presentCustomLoading('Actualizando Perfil...');

      const updatedData = this.editProfileForm.value;
      const uid = this.currentUser?.uid;

      if (uid) {
        try {
          await this.firebaseSvc.updateUserDocument(uid, updatedData);

          this.utilsSvc.presentToast({
            message: 'Perfil actualizado con éxito.',
            duration: 2500,
            color: 'success',
            position: 'middle',
            icon: 'checkmark-circle-outline',
          });

          // Actualiza el estado del usuario en el servicio
          this.userSvc.updateCurrentUser(updatedData as User);

          await loading.dismiss();
          this.router.navigate(['/perfil']);
        } catch (error) {
          console.error('Error updating profile:', error);

          this.utilsSvc.presentToast({
            message: 'Hubo un error al actualizar el perfil.',
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
          loading.dismiss();
        }
      }
    }
  }
}