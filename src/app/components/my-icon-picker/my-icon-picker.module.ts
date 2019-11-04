import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyIconPickerComponent } from './my-icon-picker.component';
import { NzInputModule, NzRadioModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [MyIconPickerComponent],
  imports: [
    CommonModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzRadioModule
  ],
  exports: [
    MyIconPickerComponent
  ]
})
export class MyIconPickerModule { }
