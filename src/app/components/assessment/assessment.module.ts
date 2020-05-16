import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule, NzInputModule, NzIconModule } from 'ng-zorro-antd';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AssessmentComponent } from './assessment.component';


@NgModule({
  declarations: [
    AssessmentComponent
  ],
  imports: [
    CommonModule,
    NzModalModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
  ],
  exports: [
    AssessmentComponent
  ]
})
export class AssessmentModule { }
