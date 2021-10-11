import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { MyteamComponent } from './myteam.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
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
