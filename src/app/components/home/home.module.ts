import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from '../calendar/calendar.module';
import { MyteamModule } from '../myteam/myteam.module';
import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingsModule } from '../trainings/trainings.module';
import { NzModalModule, NzInputModule, NzIconModule, NzBadgeModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    CalendarModule,
    MyteamModule,
    TrainingsModule,
    NzModalModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
