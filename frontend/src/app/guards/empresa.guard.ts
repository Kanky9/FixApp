import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaGuard implements CanActivate {

  firebaseSvc = inject(FirebaseService);
  router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const currentUser = await this.firebaseSvc.getCurrentUser();
    if (currentUser) {
      const userDoc = await this.firebaseSvc.getUserDocument(currentUser.uid);
      const userData = userDoc?.data() as User | undefined; // Realiza la conversión de tipo adecuada
      if (userData?.empresa) {
        return true;
      }
    }
    this.router.navigate(['/home']);
    return false;
  }
}
