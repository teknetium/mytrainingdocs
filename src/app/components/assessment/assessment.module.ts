import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule, NzRadioModule, NzInputModule, NzIconModule, NzCollapseModule, NzInputNumberModule, NzPopconfirmModule, NzFormModule } from 'ng-zorro-antd';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AssessmentComponent } from './assessment.component';
import { NzButtonModule } from 'ng-zorro-antd';


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
    NzButtonModule,
    NzCollapseModule,
    NzInputNumberModule,
    NzPopconfirmModule,
    NzInputModule,
    NzFormModule,
    NgZorroAntdModule,
    NzRadioModule
  ],
  exports: [
    AssessmentComponent
  ]
})
export class AssessmentModule { }
