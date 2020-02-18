import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileManagerComponent } from './file-manager.component';
import {
  NzDropDownModule,
  NzProgressModule,
  NzUploadModule,
  NzIconModule,
  NzTabsModule,
  NzAvatarModule,
  NzCardModule,
  NzToolTipModule,
  NzModalModule,
  NzRadioModule,
  NzTypographyModule,
  NzTableModule,
  NzPopoverModule,
  NzEmptyModule
} from 'ng-zorro-antd';
import { FilesModule } from '../files/files.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    FileManagerComponent
  ],
  imports: [
    CommonModule,
    NzDropDownModule,
    NzProgressModule,
    NzUploadModule,
    NzIconModule,
    NzTabsModule,
    NzAvatarModule,
    NzCardModule,
    NzToolTipModule,
    NzModalModule,
    FilesModule,
    NzIconModule,
    NzRadioModule,
    ReactiveFormsModule,
    FormsModule,
    NzModalModule,
    NzTypographyModule,
    NzDropDownModule,
    NzTableModule,
    NzPopoverModule,
    NzEmptyModule,
  ],
  exports: [
    FileManagerComponent
  ]
})
export class FileManagerModule { }
