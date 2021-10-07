import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainingsComponent } from './trainings.component';
import { NzTableModule, NzTabsModule, NzRateModule, NzDrawerModule } from 'ng-zorro-antd';
import { NzButtonModule } from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd';
import { NzPopconfirmModule } from 'ng-zorro-antd';
import { NzFormModule } from 'ng-zorro-antd';
import { NzToolTipModule } from 'ng-zorro-antd';
import { RouterModule } from '@angular/router';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { TrainingsRoutingModule } from './training-routing.module';
import { TrainingViewerModule } from '../training-viewer/training-viewer.module';


@NgModule({
  declarations: [
    TrainingsComponent,
  ],
  imports: [
    RouterModule,
    NzToolTipModule,
    NzPopconfirmModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzButtonModule,
    NzTabsModule,
    NzRateModule, 
    VgCoreModule,
    VgControlsModule,
    TrainingViewerModule,
    TrainingsRoutingModule,
    NzDrawerModule
  ],
  exports: [
    TrainingsComponent,
  ]
})
export class TrainingsModule { }
