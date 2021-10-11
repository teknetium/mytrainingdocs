import { NgModule } from '@angular/core';
import { MyLoaderComponent } from './my-loader.component';
import { CommonModule } from '@angular/common';
import { LoaderInterceptor } from '../../shared/interceptor/loader-interceptor.service';
import { LoaderService } from '../../shared/services/loader.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NzSpinModule } from 'ng-zorro-antd/spin';


@NgModule({
  declarations: [MyLoaderComponent],
  imports: [
    CommonModule,
    NzSpinModule
  ],
  exports: [
    MyLoaderComponent
  ],
  providers: [
    
  ]
})
export class MyLoaderModule { }
