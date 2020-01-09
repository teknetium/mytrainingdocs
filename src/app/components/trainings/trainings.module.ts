import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainingsComponent } from './trainings.component';
import { TrainingViewerComponent } from './training-viewer/training-viewer.component';

import { NzTableModule, NzCollapseModule, NzTypographyModule, NzTabsModule, NzAnchorModule, NzRateModule, NzEmptyModule, NzAffixModule, NzCheckboxModule, NzSwitchModule, NzPopoverModule, NzCommentModule, NzAvatarModule, NzListModule } from 'ng-zorro-antd';
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
import { NzInputModule } from 'ng-zorro-antd';
import { NzAlertModule } from 'ng-zorro-antd';
import { RouterModule } from '@angular/router';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FilesModule } from '../files/files.module';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { MyIconPickerModule } from '../my-icon-picker/my-icon-picker.module';

@NgModule({
  declarations: [
    TrainingsComponent,
    TrainingViewerComponent,
  ],
  imports: [
    RouterModule,
    ColorPickerModule,
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
    NzButtonModule,
    NzTypographyModule,
    NzTabsModule,
    NzAnchorModule,
    ScrollToModule,
    NzRateModule,
    NzEmptyModule,
    NzAffixModule,
    MyIconPickerModule,
    NzRateModule,
    NzCheckboxModule,
    NzSwitchModule,
    NzPopoverModule,
    NzCommentModule,
    NzAvatarModule,
    NzListModule
  ],
  exports: [
    TrainingsComponent,
    TrainingViewerComponent
  ]
})
export class TrainingsModule { }
