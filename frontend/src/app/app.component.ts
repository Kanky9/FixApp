import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  
  showLoader: boolean = true;

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.showLoader = false;
    }, 6500);
  }
}