import { Component } from '@angular/core';

import { MainStateService } from './services/main-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public mainStateService: MainStateService) {}
}
