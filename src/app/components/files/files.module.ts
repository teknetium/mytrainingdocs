import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd';
import { NzTypographyModule } from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd';
import { NzTabsModule } from 'ng-zorro-antd';
import { NzTagModule } from 'ng-zorro-antd';
import { NzInputModule } from 'ng-zorro-antd';
import { NzToolTipModule } from 'ng-zorro-antd';
import { NzFormModule } from 'ng-zorro-antd';
import { NzSelectModule } from 'ng-zorro-antd';
import { NzAlertModule } from 'ng-zorro-antd';
import { NzPopconfirmModule } from 'ng-zorro-antd';
import { NzDividerModule } from 'ng-zorro-antd';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzTreeModule } from 'ng-zorro-antd';
import { NzDropDownModule } from 'ng-zorro-antd';
import { NzRadioModule } from 'ng-zorro-antd';

import { FilesComponent } from './files.component';
import { ThemeImageModule } from '../theme-image/theme-image.module';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';

@NgModule({
  declarations: [
    FilesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    NzModalModule,
    NzDropDownModule,
    NzPopconfirmModule,
    NzTreeModule,
    NzNotificationModule,
    NzCollapseModule,
    NzTableModule,
    NzRadioModule,
    ThemeImageModule,
    NzButtonModule,
    NzIconModule,
    NzTabsModule,
    FormsModule,
    NzInputModule,
    NzTagModule,
    NzToolTipModule,
    NzFormModule,
    NzSelectModule,
    NzDividerModule,
    ReactiveFormsModule,
    NzAlertModule,
    NzTypographyModule,
    VgCoreModule,
    VgControlsModule,
  ],
  exports: [
    FilesComponent,
  ],
  providers: [
  ]
})
export class FilesModule { }
