import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialPeticionesPage } from './historial-peticiones.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialPeticionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialPeticionesPageRoutingModule {}
