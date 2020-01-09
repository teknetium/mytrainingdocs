import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './calendar.component';
import { NzBadgeModule, NzIconModule, NzTabsModule, NzToolTipModule, NzModalModule } from 'ng-zorro-antd';



@NgModule({
  declarations: [
    CalendarComponent
  ],
  imports: [
    CommonModule,
    NzBadgeModule,
    NzIconModule,
    NzTabsModule,
    NzToolTipModule,
    NzModalModule    
  ],
  exports: [
    CalendarComponent
  ]
})
export class CalendarModule { }
