import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallbackComponent } from './callback.component';
import { NzSpinModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    CallbackComponent
  ],
  imports: [
    CommonModule,
    NzSpinModule
  ],
  exports: [
    CallbackComponent
  ]
})
export class CallbackModule { }
