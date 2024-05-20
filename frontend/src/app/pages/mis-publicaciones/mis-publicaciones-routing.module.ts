import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisPublicacionesPage } from './mis-publicaciones.page';

const routes: Routes = [
  {
    path: '',
    component: MisPublicacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisPublicacionesPageRoutingModule {}
