import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InviterPage } from './inviter';

@NgModule({
  declarations: [
    InviterPage,
  ],
  imports: [
    IonicPageModule.forChild(InviterPage),
  ],
})
export class InviterPageModule {}
