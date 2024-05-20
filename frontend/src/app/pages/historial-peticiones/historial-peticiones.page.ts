import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-historial-peticiones',
  templateUrl: './historial-peticiones.page.html',
  styleUrls: ['./historial-peticiones.page.scss'],
})
export class HistorialPeticionesPage implements OnInit {

  requests: User[] = [];

  firebaseSvc = inject(FirebaseService);

  async ngOnInit() {
    this.loadRequests();
  }

  async loadRequests() {
    const allUsers = await this.firebaseSvc.getAllUsers();
    this.requests = allUsers.filter(user => user.message);
  }

}
