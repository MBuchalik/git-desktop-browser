import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RepoComponent } from './repo.component';

@NgModule({
  declarations: [RepoComponent],
  imports: [CommonModule],
  exports: [RepoComponent],
})
export class RepoModule {}
