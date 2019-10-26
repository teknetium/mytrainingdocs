import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailComponent } from './mail.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { QuillModule } from 'ngx-quill';



@NgModule({
  declarations: [
    MailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    QuillModule
  ],
  exports: [
    MailComponent
  ]
})
export class MailModule { }
