import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyIconPickerComponent } from './my-icon-picker.component';
import { NzInputModule, NzRadioModule, NzIconModule, NzButtonModule, NzSliderModule, NzToolTipModule } from 'ng-zorro-antd';
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
    NzIconModule,
    NzButtonModule,
    ColorPickerModule,
    NzSliderModule,
    NzToolTipModule
  ],
  exports: [
    MyIconPickerComponent
  ]
})
export class MyIconPickerModule { }
