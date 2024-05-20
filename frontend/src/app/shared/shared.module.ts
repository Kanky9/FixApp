import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './components/menu/menu.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterLink } from '@angular/router';
import { AgregarPublicacionComponent } from './components/agregar-publicacion/agregar-publicacion.component';
import { EditarPublicacionComponent } from './components/editar-publicacion/editar-publicacion.component';
import { PeticionComponent } from './components/peticion/peticion.component';


@NgModule({
  declarations: [
    MenuComponent,
    CustomInputComponent,
    FooterComponent,
    AgregarPublicacionComponent,
    EditarPublicacionComponent,
    PeticionComponent
  ],
  exports: [
    MenuComponent,
    CustomInputComponent,
    FooterComponent,
    ReactiveFormsModule,
    RouterLink,
    AgregarPublicacionComponent,
    EditarPublicacionComponent,
    PeticionComponent
    
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ]
})
export class SharedModule { }