import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTagModule, NzToolTipModule, NzTabsModule, NzIconModule, NzModalModule, NzInputModule, NzRadioModule, NzCheckboxModule, NzPopconfirmModule, NzButtonModule, NzCollapseModule, NzTableModule, NzAlertModule, NzAutocompleteModule, NzDrawerModule } from 'ng-zorro-antd';
import { UserTrainingsModule } from '../user-trainings/user-trainings.module';
import { TeammemberComponent } from './teammember.component';



@NgModule({
  declarations: [
    TeammemberComponent
  ],
  imports: [
    CommonModule,
    NzTagModule,
    NzToolTipModule,
    NzTabsModule,
    NzIconModule,
    NzModalModule,
    UserTrainingsModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzRadioModule,
    NzCheckboxModule,
    NzPopconfirmModule,
    NzButtonModule,
    NzCollapseModule,
    NzTableModule,
    NzAlertModule,
    NzAutocompleteModule,
    NzDrawerModule
  ],
  exports: [
    TeammemberComponent
  ]
})
export class TeammemberModule { }
