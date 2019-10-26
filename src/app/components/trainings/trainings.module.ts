import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainingsComponent } from './trainings.component';
import { TrainingDetailComponent } from './training-detail/training-detail.component';
import { TrainingBasicComponent } from './training-basic/training-basic.component';

import { NzTableModule, NzCollapseModule } from 'ng-zorro-antd';
import { NzButtonModule } from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd';
import { NzTagModule } from 'ng-zorro-antd';
import { NzDividerModule } from 'ng-zorro-antd';
import { NzModalModule } from 'ng-zorro-antd';
import { NzPopconfirmModule } from 'ng-zorro-antd';
import { NzFormModule } from 'ng-zorro-antd';
import { NzSelectModule } from 'ng-zorro-antd';
import { NzToolTipModule } from 'ng-zorro-antd';
import { NzRadioModule } from 'ng-zorro-antd';
import { ColorPickerModule } from 'ngx-color-picker';
import { IconPickerModule } from 'ngx-icon-picker';
import { NzInputModule } from 'ng-zorro-antd';
import { NzAlertModule } from 'ng-zorro-antd';
import { RouterModule } from '@angular/router';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FilesModule } from '../files/files.module';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { MultiSelectorModule } from '../multi-selector/multi-selector.module';

@NgModule({
  declarations: [
    TrainingsComponent,
    TrainingDetailComponent,
    TrainingBasicComponent
  ],
  imports: [
    RouterModule,
    ColorPickerModule,
    IconPickerModule,
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
    NzCollapseModule,
    FilesModule,
    FileManagerModule,
    MultiSelectorModule,
    NzButtonModule

  ],
  exports: [
    TrainingsComponent,
    TrainingDetailComponent,
    TrainingBasicComponent
  ]
})
export class TrainingsModule { }
