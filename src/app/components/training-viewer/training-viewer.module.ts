import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NzTableModule, NzTypographyModule, NzTabsModule, NzAnchorModule, NzRateModule, NzEmptyModule, NzAffixModule, NzCheckboxModule, NzSwitchModule, NzPopoverModule, NzCommentModule, NzAvatarModule, NzListModule, NzDropDownModule, NzStepsModule, NzCalendarModule, NzDatePickerModule, NzCollapseModule } from 'ng-zorro-antd';
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
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { MyIconPickerModule } from '../my-icon-picker/my-icon-picker.module';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';
import { TrainingViewerComponent } from './training-viewer.component';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';

@NgModule({
  declarations: [
    TrainingViewerComponent,
  ],
  imports: [
    RouterModule,
    ColorPickerModule,
    NzAutocompleteModule,
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
    NzStepsModule,
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
    NzListModule,
    NzDropDownModule,
    VgCoreModule,
    VgControlsModule,
    NzSwitchModule,
    NzCalendarModule,
    NzDatePickerModule,
    NzCollapseModule,
    PrettyJsonModule,
  ],
  exports: [
    TrainingViewerComponent,
  ]
})
export class TrainingViewerModule { }
