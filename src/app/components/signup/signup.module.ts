import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup.component';
import { NzButtonModule } from 'ng-zorro-antd/button';



@NgModule({
  declarations: [
    SignupComponent
  ],
  imports: [
    CommonModule,
    NzButtonModule
  ],
  exports: [
    SignupComponent
  ]
})
  
export class SignupModule { }
