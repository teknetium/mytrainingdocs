import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyIconPickerComponent } from './my-icon-picker.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  declarations: [MyIconPickerComponent],
  imports: [
    CommonModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzRadioModule,
    NzButtonModule,
    NzIconModule,
    ColorPickerModule,
    NzSliderModule,
    NzToolTipModule
  ],
  exports: [
    MyIconPickerComponent
  ]
})
export class MyIconPickerModule { }
