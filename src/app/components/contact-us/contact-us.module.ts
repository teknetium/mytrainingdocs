import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyteamModule } from '../myteam/myteam.module';
import { ContactUsComponent } from './contact-us.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingsModule } from '../trainings/trainings.module';
import { NzModalModule, NzInputModule, NzIconModule, NzCardModule, NzBadgeModule, NzListModule, NzAvatarModule, NzToolTipModule, NzTimelineComponent, NzTimelineModule, NzDatePickerModule, NzAlertModule, NzDropDownModule, NzCalendarModule, NzTabsModule } from 'ng-zorro-antd';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    ContactUsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzTabsModule,
    NzToolTipModule,
    NzTimelineModule,
  ],
  exports: [
    ContactUsComponent
  ],
  providers:
    [
  ]
})
export class ContactUsModule { }
