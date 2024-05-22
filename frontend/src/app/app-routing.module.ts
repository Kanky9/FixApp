import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { EditarPublicacionComponent } from './shared/components/editar-publicacion/editar-publicacion.component';
import { PeticionComponent } from './shared/components/peticion/peticion.component';
import { AdminGuard } from './guards/admin.guard';
import { EmpresaGuard } from './guards/empresa.guard';
import { AgregarPublicacionComponent } from './shared/components/agregar-publicacion/agregar-publicacion.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    //canActivate:[AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule),
    canActivate:[NoAuthGuard]
  },
  {
    path: 'publicaciones',
    loadChildren: () => import('./pages/publicaciones/publicaciones.module').then(m => m.PublicacionesPageModule),
  },
  {
    path: 'agregar-publicacion',
    component: AgregarPublicacionComponent,
    canActivate:[AuthGuard, EmpresaGuard]
  },
  {
    path: 'mis-publicaciones',
    loadChildren: () => import('./pages/mis-publicaciones/mis-publicaciones.module').then(m => m.MisPublicacionesPageModule),
    canActivate: [AuthGuard, EmpresaGuard]
  },
  {
    path: 'editar-publicacion/:productId',
    component: EditarPublicacionComponent,
    canActivate: [AuthGuard, EmpresaGuard]
  },
  {
    path: 'publicacion/:productId',
    loadChildren: () => import('./pages/publicacion/publicacion.module').then( m => m.PublicacionPageModule)
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'peticion',
    component: PeticionComponent
  },
  {
    path: 'historial-solicitudes',
    loadChildren: () => import('./pages/historial-peticiones/historial-peticiones.module').then(m => m.HistorialPeticionesPageModule),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'favoritos',
    loadChildren: () => import('./pages/favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }