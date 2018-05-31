import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimeoutPage } from './timeout';

@NgModule({
  declarations: [
    TimeoutPage,
  ],
  imports: [
    IonicPageModule.forChild(TimeoutPage),
  ],
})
export class TimeoutPageModule {}
