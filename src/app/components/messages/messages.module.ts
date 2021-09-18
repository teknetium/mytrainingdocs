import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from './messages.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule, NzInputModule, NzIconModule, NzCardModule, NzBadgeModule, NzListModule, NzAvatarModule, NzToolTipModule, NzTimelineComponent, NzTimelineModule, NzDatePickerModule, NzAlertModule, NzDropDownModule, NzCalendarModule, NzTabsModule, NzEmptyModule, NzButtonModule } from 'ng-zorro-antd';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    MessagesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzTabsModule,
    NzToolTipModule,
    NzTimelineModule,
    NzEmptyModule,
    NzButtonModule
  ],
  exports: [
    MessagesComponent
  ],
  providers: [
  ]
})
export class MessagesModule { }
