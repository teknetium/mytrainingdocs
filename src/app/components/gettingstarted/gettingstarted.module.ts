import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

import { GettingstartedComponent } from './gettingstarted.component';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { AppsService } from 'src/app/shared/services/apps.service';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProjectsModule } from '../projects/projects.module';
import { MembersModule } from '../members/members.module';
import { NzCardModule, NzTagModule, NzAlertModule, NzTabsModule, NzButtonModule } from 'ng-zorro-antd';
import { TrainingsModule } from '../trainings/trainings.module';

@NgModule({
  declarations: [
    GettingstartedComponent
  ],
  imports: [
    CommonModule,
    NzCollapseModule,
    FileManagerModule,
    NzAvatarModule,
    NzIconModule,
    ProjectsModule,
    MembersModule,
    NzCardModule,
    NzTagModule,
    NzAlertModule,
    TrainingsModule,
    NzTabsModule,
    NzButtonModule
  ],
  exports: [
    GettingstartedComponent
  ],
  providers: [
    AppsService
  ]
})
export class GettingstartedModule { }
