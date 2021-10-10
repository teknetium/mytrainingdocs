import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyteamModule } from '../myteam/myteam.module';
import { HomeComponent } from './home.component';
import { MyTrainingsModule } from '../my-trainings/my-trainings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingsModule } from '../trainings/trainings.module';
import { NzModalModule, NzInputModule, NzIconModule, NzCardModule, NzBadgeModule, NzListModule, NzAvatarModule, NzToolTipModule, NzTimelineComponent, NzTimelineModule, NzDatePickerModule, NzDropDownModule, NzCalendarModule, NzStatisticModule } from 'ng-zorro-antd';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    MyTrainingsModule,
    MyteamModule,
    TrainingsModule,
    NzModalModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzListModule,
    NzAvatarModule,
    NzToolTipModule,
    NzTimelineModule,
    NzDatePickerModule,
    NzBadgeModule,
    NzCardModule,
    NzDropDownModule,
    NzStatisticModule,
    NzDatePickerModule,
    NzCalendarModule
  ],
  exports: [
    HomeComponent
  ],
  providers:
    [
  ]
})
export class HomeModule { }
