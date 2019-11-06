import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NzButtonModule, NzEmptyModule } from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd';
import { NzTabsModule } from 'ng-zorro-antd';
import { NzTagModule } from 'ng-zorro-antd';
import { NzInputModule } from 'ng-zorro-antd';
import { NzToolTipModule } from 'ng-zorro-antd';
import { NzFormModule } from 'ng-zorro-antd';
import { NzSelectModule } from 'ng-zorro-antd';
import { NzAlertModule } from 'ng-zorro-antd';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ColorPickerModule } from 'ngx-color-picker';
import { IconPickerModule } from 'ngx-icon-picker';
import { NzDividerModule } from 'ng-zorro-antd';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd';
import { NzPopconfirmModule } from 'ng-zorro-antd';

import { NzTableModule } from 'ng-zorro-antd';
import { NzModalModule } from 'ng-zorro-antd';

import { UsersComponent } from './users.component';
import { UserDetailComponent } from './user-detail/user-detail.component';

@NgModule({
  declarations: [
    UsersComponent,
    UserDetailComponent
  ],
  imports: [
    CommonModule,
    NzTableModule,
    NzPopconfirmModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    RouterModule,
    NzTagModule,
    NzModalModule,
    NzToolTipModule,
    NzDividerModule,
    NzTabsModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    NzAlertModule,
    FormsModule,
    ReactiveFormsModule,
    NzAvatarModule,
    NzRadioModule,
    NzCheckboxModule,
    IconPickerModule,
    NzEmptyModule,
    NzModalModule
  ],
  exports: [
    UsersComponent
  ]
})
export class UsersModule { }
