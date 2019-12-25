import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from '../calendar/calendar.module';
import { MyteamModule } from '../myteam/myteam.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CalendarModule,
    MyteamModule
  ]
})
export class HomeModule { }
