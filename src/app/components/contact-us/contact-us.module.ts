import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyteamModule } from '../myteam/myteam.module';
import { ContactUsComponent } from './contact-us.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingsModule } from '../trainings/trainings.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

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
  ],
  exports: [
    ContactUsComponent
  ],
  providers:
    [
  ]
})
export class ContactUsModule { }
