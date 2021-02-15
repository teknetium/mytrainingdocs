import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { CommonModule } from '@angular/common';
import { LoaderInterceptor } from '../../shared/interceptor/loader-interceptor.service';
import { LoaderService } from '../../shared/services/loader.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NzAvatarModule, NzButtonModule, NzCardModule, NzIconModule, NzListModule, NzSpinModule, NzTagModule } from 'ng-zorro-antd';


@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    NzSpinModule,
    NzCardModule,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzTagModule,
    NzListModule
  ],
  exports: [
    ProfileComponent
  ],
  providers: [
    
  ]
})
export class ProfileModule { }
