import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTagModule, NzConfig, NZ_CONFIG, NzToolTipModule, NzPopoverModule, NzTabsModule, NzIconModule, NzModalModule, NzInputModule, NzRadioModule, NzCheckboxModule, NzPopconfirmModule, NzButtonModule, NzCollapseModule, NzTableModule, NzAlertModule, NzAutocompleteModule, NzDrawerModule, NzTreeModule, NzBadgeModule, NzProgressModule, NzDropDownModule, NzInputNumberModule, NzCardModule, NzSwitchModule, NzSelectModule, NzStepsModule } from 'ng-zorro-antd';
import { MyteamComponent } from './myteam.component';
import { UserTrainingsModule } from '../user-trainings/user-trainings.module';
import { MyteamRoutingModule } from './myteam-routing.module';
//import { NgxOrgChartModule } from 'ngx-org-chart';
import { ProfileModule } from '../profile/profile.module';

const ngZorroConfig: NzConfig = {
  message: { nzTop: 400 },
  notification: { nzTop: 240 }
};

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
    ProfileModule,
    NzInputModule,
    NzInputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    NzRadioModule,
    NzCheckboxModule,
    NzPopconfirmModule,
    NzButtonModule,
    NzCollapseModule,
    NzTableModule,
    NzSelectModule,
    NzAlertModule,
    NzAutocompleteModule,
    NzStepsModule,
    MyteamRoutingModule,
    NzDrawerModule,
    NzTreeModule,
    NzBadgeModule,
//    NgxOrgChartModule,
    NzProgressModule,
    NzDropDownModule,
    NzSwitchModule,
    NzCardModule,
    NzProgressModule,
    NzPopoverModule,
  ],
  exports: [
    MyteamComponent,
  ],
  providers: [
    { provide: NZ_CONFIG, useValue: ngZorroConfig },
  ]

})
export class MyteamModule { }
