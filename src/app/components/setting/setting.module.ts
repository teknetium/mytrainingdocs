import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingComponent } from './setting.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzUploadModule, NzFormModule, NzCardModule, NzDatePickerModule, NzSelectModule, NzListModule, NzSwitchModule, NzProgressModule } from 'ng-zorro-antd';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SettingComponent
  ],
  imports: [
    CommonModule,
    NzAvatarModule,
    NzUploadModule,
    NzFormModule,
    NzTabsModule,
    NzCardModule,
    NzDatePickerModule,
    NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NzListModule,
    NzSwitchModule,
    NzProgressModule,
  ],
  exports: [
    SettingComponent
  ]
})
export class SettingModule { }
