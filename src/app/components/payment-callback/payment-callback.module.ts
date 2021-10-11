import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentCallbackComponent } from './payment-callback.component';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
  declarations: [
    PaymentCallbackComponent
  ],
  imports: [
    CommonModule,
    NzButtonModule
  ],
  exports: [
    PaymentCallbackComponent
  ]
})
export class PaymentCallbackModule { }
