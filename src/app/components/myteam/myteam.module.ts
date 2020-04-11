import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTagModule, NzToolTipModule, NzTabsModule, NzIconModule, NzModalModule, NzInputModule, NzRadioModule, NzCheckboxModule, NzPopconfirmModule, NzButtonModule, NzCollapseModule, NzTableModule, NzAlertModule, NzAutocompleteModule } from 'ng-zorro-antd';
import { MyteamComponent } from './myteam.component';
import { TrainingsModule } from '../trainings/trainings.module';
import { TeammemberComponent } from './teammember/teammember.component';
import { MyteamRoutingModule } from './myteam-routing.module';



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
    NzAutocompleteModule,
    MyteamRoutingModule
  ],
  exports: [
    MyteamComponent,
    TeammemberComponent
  ]
})
export class MyteamModule { }
