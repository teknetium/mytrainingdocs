import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzListModule } from 'ng-zorro-antd/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCardModule, NzTimelineModule, NzProgressModule, NzTableModule, NzIconModule, NzButtonModule, NzInputNumberModule } from 'ng-zorro-antd';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { RouterModule } from '@angular/router';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  declarations: [
    ProjectDetailsComponent,
    ProjectListComponent
  ],
  imports: [
    CommonModule,
    NzAvatarModule,
    NzTagModule,
    NzListModule,
    FormsModule,
    ReactiveFormsModule,
    NzToolTipModule,
    NzTabsModule,
    NzPaginationModule,
    NzCardModule,
    NzTimelineModule,
    NzInputModule,
    NzRadioModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzDropDownModule,
    NzProgressModule,
    RouterModule,
    NzTableModule,
    NzIconModule,
    NzButtonModule,
    ColorPickerModule,
    NzInputNumberModule
  ],
  exports: [
    ProjectDetailsComponent,
    ProjectListComponent
  ]
})
export class ProjectsModule { }
