import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NzPopoverModule } from 'ng-zorro-antd';
import { NzRadioModule } from 'ng-zorro-antd';
import { NzCheckboxModule } from 'ng-zorro-antd';
import { ThemeImageComponent } from './theme-image.component';

@NgModule({
  declarations: [
    ThemeImageComponent
  ],
  imports: [
    CommonModule,
    NzPopoverModule,
    NzRadioModule,
    NzCheckboxModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ThemeImageComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ThemeImageModule { }
