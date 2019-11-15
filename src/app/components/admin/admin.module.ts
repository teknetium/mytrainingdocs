import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { NzTabsModule, NzIconModule } from 'ng-zorro-antd';



@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    FileManagerModule,
    TrainingsModule,
    UsersModule,
    JobsModule,
    NzTabsModule,
    NzIconModule
  
  ],
  exports: [
    AdminComponent
  ]
})
export class AdminModule { }
