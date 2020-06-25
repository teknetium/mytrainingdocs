import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common'
import { DocsComponent } from './docs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DocsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    DocsComponent
  ],
  providers: [
  ]

})
export class DocsModule { }
