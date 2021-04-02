import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentCallbackComponent } from './payment-callback.component';
import { NzButtonModule, NzResultModule, NzSpinModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    PaymentCallbackComponent
  ],
  imports: [
    CommonModule,
    NzButtonModule,
    NzResultModule
  ],
  exports: [
    PaymentCallbackComponent
  ]
})
export class PaymentCallbackModule { }
