import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent implements OnInit{

  @Input() control!: FormControl;
  @Input() type!: string;
  @Input() label!: string;
  @Input() autocomplete!: string; 
  @Input() icon!: string;
  @Input() isTextarea: boolean = false;

  

  isPassword!: boolean;
  hide: boolean = true; 

  ngOnInit(){
    if (this.type == 'password') this.isPassword = true;
      else this.isPassword = false;
  }

  showOrHidePassword() {

    this.hide = !this.hide; 

    if (this.hide) {

      this.type = 'password';
      
    } 
    else {
      this.type = 'text';
    }
  }
}