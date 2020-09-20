import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyteamModule } from '../myteam/myteam.module';
import { HomeComponent } from './home.component';
import { MyTrainingsModule } from '../my-trainings/my-trainings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingsModule } from '../trainings/trainings.module';
import { NzModalModule, NzInputModule, NzIconModule, NzCardModule, NzBadgeModule, NzListModule, NzAvatarModule, NzToolTipModule, NzTimelineComponent, NzTimelineModule, NzDatePickerModule, NzAlertModule } from 'ng-zorro-antd';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { JoyrideModule, JoyrideService } from 'ngx-joyride';

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
    JoyrideModule.forRoot(),
    NzTimelineModule,
    NzDatePickerModule,
    NzBadgeModule,
    NzAlertModule,
    NzCardModule,
  ],
  exports: [
    HomeComponent
  ],
  providers:
    [
    JoyrideService
  ]
})
export class HomeModule { }
