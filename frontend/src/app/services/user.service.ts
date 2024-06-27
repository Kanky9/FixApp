import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  firebaseSvc = inject(FirebaseService);

  async loadCurrentUser() {
    const authUser = await this.firebaseSvc.getCurrentUser();
    if (authUser) {
      const userDoc = await this.firebaseSvc.getUserDocument(authUser.uid);
      const user = userDoc.data() as User;
      this.currentUserSubject.next(user);
    }
  }

  updateCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }
}