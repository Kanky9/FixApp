import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { TextFieldTypes } from '@ionic/core'; // Importa TextFieldTypes
 
@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  alertCtrl = inject(AlertController);
  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);

  async takePicture(promptLabelHeader: string): Promise<string> {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Seleccione una imagen',
      promptLabelPicture: 'Toma una foto',
    });
    return photo.dataUrl;
  }

  /* ========== Alert ========== */
  async presentAlert(alertOptions: any) {
    const alert = await this.alertCtrl.create(alertOptions);
    await alert.present();
    return alert;
  }

  /* ========== Confirm ========== */
  async presentConfirm(header: string, message: string) {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header,
        message,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Sí',
            handler: () => resolve(true),
          },
        ],
      });
      await alert.present();
    });
  }

  /* ========== Loading ========== */
  async presentCustomLoading(message: string) {
    const loading = await this.loadingCtrl.create({
      message: message,
      spinner: 'crescent',
      cssClass: 'custom-loading', // Asignar la clase personalizada aquí
    });
    await loading.present();
    return loading;
  }

  /* ========== Toast ========== */
  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  /* ========== Enruta a cualquier página disponible ========== */
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  /* ========== Guarda un elemento en localstorage ========== */
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  /* ========== Obtiene un elemento desde localstorage ========== */
  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }



  async presentPrompt(options: {
    header: string;
    inputs: { name: string; type: TextFieldTypes | "checkbox" | "radio" | "textarea"; placeholder: string }[];
    buttons: { text: string; role?: string; handler?: (data: any) => void }[];
  }) {
    const alert = await this.alertCtrl.create({
      header: options.header,
      inputs: options.inputs,
      buttons: options.buttons
    });

    await alert.present();
    return alert;
  }
}
