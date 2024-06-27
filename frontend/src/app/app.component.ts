import { Component, inject, OnInit } from '@angular/core';
import { UtilsService } from './services/utils.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{
  
  utilSvc = inject(UtilsService);

  showLoader$ = this.utilSvc.loading$;

  onVideoEnded() {
    this.utilSvc.hideLoader();
  }

  /*
  showLoader: boolean = true;

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.showLoader = false;
    }, 3700);
  }*/
}