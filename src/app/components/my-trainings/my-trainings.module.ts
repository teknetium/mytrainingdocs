import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ColorPickerModule } from 'ngx-color-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { RouterModule } from '@angular/router';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { MyIconPickerModule } from '../my-icon-picker/my-icon-picker.module';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { MyTrainingsComponent } from './my-trainings.component';
//import { CalendarModule } from '../calendar/calendar.module';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { MyTrainingsRoutingModule } from './my-training-routing.module';
import { TrainingViewerModule } from '../training-viewer/training-viewer.module';
import { UserTrainingsModule } from '../user-trainings/user-trainings.module';


@NgModule({
  declarations: [
    MyTrainingsComponent,
  ],
  imports: [
    RouterModule,
//    ColorPickerModule,
    NzAlertModule,
    NzToolTipModule,
    NzInputNumberModule,
    NzPopconfirmModule,
    NzInputModule,
    FormsModule,
    NzRadioModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzFormModule,
    NzDividerModule,
    NzTagModule,
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule,
    NzButtonModule,
    NzTabsModule,
    ScrollToModule,
    NzRateModule,
    NzEmptyModule,
    MyIconPickerModule,
    NzRateModule,
    VgCoreModule,
    VgControlsModule,
    PrettyJsonModule,
    MyTrainingsRoutingModule,
    TrainingViewerModule,
    UserTrainingsModule
  ],
  exports: [
    MyTrainingsComponent,
  ]
})
export class MyTrainingsModule { }
