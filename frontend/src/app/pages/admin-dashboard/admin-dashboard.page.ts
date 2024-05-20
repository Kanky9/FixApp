import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage  implements OnInit{
  
  usersWithRequests: User[] = [];
  admin = false;
  
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);



  async ngOnInit() {
    const currentUser = await this.firebaseSvc.getCurrentUser();
    if (currentUser) {
      const userDoc = await this.firebaseSvc.getUserDocument(currentUser.uid);
      const userData = userDoc?.data() as User;

      if (userData) {
        this.admin = userData.admin ?? false;
      }

      if (this.admin) {
        this.loadRequests();
      }
    }
  }

  async loadRequests() {
    const allUsers = await this.firebaseSvc.getAllUsers();
    this.usersWithRequests = allUsers.filter(user => user.message && !user.requestHandled);
  }

  async approveRequest(user: User) {
    const path = `users/${user.uid}`;
    await this.firebaseSvc.updateDocument(path, { empresa: true, requestHandled: true });
    this.utilsSvc.presentToast({
      message: 'Solicitud aprobada',
      duration: 2500,
      color: 'success',
      position: 'middle',
      icon: 'checkmark-circle-outline'
    });
    this.loadRequests();
  }

  async rejectRequest(user: User) {
    const path = `users/${user.uid}`;
    await this.firebaseSvc.updateDocument(path, { empresa: false, requestHandled: true });
    this.utilsSvc.presentToast({
      message: 'Solicitud rechazada',
      duration: 2500,
      color: 'danger',
      position: 'middle',
      icon: 'close-circle-outline'
    });
    this.loadRequests();
  }

}