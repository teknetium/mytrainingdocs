import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyteamModule } from '../myteam/myteam.module';
import { HomeComponent } from './home.component';
import { MyTrainingsModule } from '../my-trainings/my-trainings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingsModule } from '../trainings/trainings.module';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';

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
