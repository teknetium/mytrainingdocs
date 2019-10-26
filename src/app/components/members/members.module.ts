import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersComponent } from './members.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd';


@NgModule({
  declarations: [
    MembersComponent
  ],
  imports: [
    CommonModule,
    NzAvatarModule,
    NzRadioModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzTableModule,
    NzIconModule
  ],
  exports: [
    MembersComponent
  ]
})
export class MembersModule { }
