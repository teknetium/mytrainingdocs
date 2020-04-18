import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTagModule, NzToolTipModule, NzTabsModule, NzIconModule, NzModalModule, NzInputModule, NzRadioModule, NzCheckboxModule, NzPopconfirmModule, NzButtonModule, NzCollapseModule, NzTableModule, NzAlertModule, NzAutocompleteModule } from 'ng-zorro-antd';
import { MyteamComponent } from './myteam.component';
import { UserTrainingsModule } from '../user-trainings/user-trainings.module';
import { TeammemberModule } from '../teammember/teammember.module';
import { MyteamRoutingModule } from './myteam-routing.module';



@NgModule({
  declarations: [
    MyteamComponent,
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
    TeammemberModule,
    MyteamRoutingModule
  ],
  exports: [
    MyteamComponent,
  ]
})
export class MyteamModule { }
