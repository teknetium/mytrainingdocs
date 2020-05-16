import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzTableModule, NzTabsModule, NzRateModule, NzDatePickerModule} from 'ng-zorro-antd';
import { NzButtonModule } from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd';
import { NzModalModule } from 'ng-zorro-antd';
import { NzPopconfirmModule } from 'ng-zorro-antd';
import { NzFormModule } from 'ng-zorro-antd';
import { NzToolTipModule } from 'ng-zorro-antd';
import { RouterModule } from '@angular/router';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';
import { UserTrainingsComponent } from './user-trainings.component';
import { TrainingViewerModule } from '../training-viewer/training-viewer.module';


@NgModule({
  declarations: [
    UserTrainingsComponent,
  ],
  imports: [
    RouterModule,
    NzToolTipModule,
    NzPopconfirmModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzRateModule,
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule,
    NzButtonModule,
    NzTabsModule,
    VgCoreModule,
    VgControlsModule,
    TrainingViewerModule,
    TrainingViewerModule,
    NzDatePickerModule
  ],
  exports: [
    UserTrainingsComponent,
  ]
})
export class UserTrainingsModule { }
