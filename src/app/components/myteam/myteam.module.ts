import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTagModule, NzToolTipModule, NzTabsModule, NzIconModule, NzModalModule, NzInputModule, NzRadioModule, NzCheckboxModule, NzPopconfirmModule } from 'ng-zorro-antd';
import { MyteamComponent } from './myteam.component';
import { TrainingsModule } from '../trainings/trainings.module';



@NgModule({
  declarations: [
    MyteamComponent
  ],
  imports: [
    CommonModule,
    NzTagModule,
    NzToolTipModule,
    NzTabsModule,
    NzIconModule,
    NzModalModule,
    TrainingsModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzRadioModule,
    NzCheckboxModule,
    NzPopconfirmModule
  ],
  exports: [
    MyteamComponent
  ]
})
export class MyteamModule { }
