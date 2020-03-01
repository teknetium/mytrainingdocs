import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTagModule, NzToolTipModule, NzTabsModule, NzIconModule, NzModalModule, NzInputModule, NzRadioModule, NzCheckboxModule, NzPopconfirmModule, NzButtonModule, NzCollapseModule, NzTableModule, NzAlertModule, NzAutocompleteModule } from 'ng-zorro-antd';
import { MyteamComponent } from './myteam.component';
import { TrainingsModule } from '../trainings/trainings.module';
import { TeammemberComponent } from './teammember/teammember.component';



@NgModule({
  declarations: [
    MyteamComponent,
    TeammemberComponent
  ],
  imports: [
    CommonModule,
    NzTagModule,
    NzToolTipModule,
    NzTabsModule,
    NzIconModule,
    NzModalModule,
    TrainingsModule,
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
    NzAutocompleteModule
  ],
  exports: [
    MyteamComponent
  ]
})
export class MyteamModule { }
