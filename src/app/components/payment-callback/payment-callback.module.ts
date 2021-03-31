import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentCallbackComponent } from './payment-callback.component';
import { NzSpinModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    PaymentCallbackComponent
  ],
  imports: [
    CommonModule,
    NzSpinModule
  ],
  exports: [
    PaymentCallbackComponent
  ]
})
export class PaymentCallbackModule { }
