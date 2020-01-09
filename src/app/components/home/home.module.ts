import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from '../calendar/calendar.module';
import { MyteamModule } from '../myteam/myteam.module';
import { HomeComponent } from './home.component';
import { TrainingsModule } from '../trainings/trainings.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    CalendarModule,
    MyteamModule,
    TrainingsModule
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
