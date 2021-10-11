import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { CommonModule } from '@angular/common';
import { LoaderInterceptor } from '../../shared/interceptor/loader-interceptor.service';
import { LoaderService } from '../../shared/services/loader.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule} from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';


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
