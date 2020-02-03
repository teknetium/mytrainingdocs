import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTagModule, NzToolTipModule, NzTabsModule, NzIconModule, NzModalModule, NzInputModule, NzRadioModule, NzCheckboxModule, NzPopconfirmModule, NzButtonModule } from 'ng-zorro-antd';
import { MyteamComponent } from './myteam.component';
import { TrainingsModule } from '../trainings/trainings.module';
import { ThemeImageModule } from '../theme-image/theme-image.module';



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
    NzPopconfirmModule,
    ThemeImageModule,
    NzButtonModule
  ],
  exports: [
    MyteamComponent
  ]
})
export class MyteamModule { }
