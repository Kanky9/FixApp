import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialPeticionesPageRoutingModule } from './historial-peticiones-routing.module';

import { HistorialPeticionesPage } from './historial-peticiones.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialPeticionesPageRoutingModule,
    SharedModule
  ],
  declarations: [HistorialPeticionesPage]
})
export class HistorialPeticionesPageModule {}
