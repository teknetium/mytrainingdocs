import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MultiSelectorComponent } from './multi-selector.component';
import { NzToolTipModule, NzIconModule, NzPopoverModule, NzButtonModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    MultiSelectorComponent
  ],
  imports: [
    CommonModule,
    NzToolTipModule,
    NzIconModule,
    NzPopoverModule,
    NzButtonModule,
    NzIconModule
  ],
  exports: [
    MultiSelectorComponent
  ]
})
export class MultiSelectorModule { }
