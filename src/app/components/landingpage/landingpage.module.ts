import { CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common'
import { LandingpageComponent } from './landingpage.component';
import { ScrollToModule, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';


@NgModule({
  declarations: [
    LandingpageComponent
  ],
  imports: [
    CommonModule,
    ScrollToModule.forRoot(),
    NzCollapseModule,
    NzButtonModule,
    NzCarouselModule,
    NzSliderModule,
    NzGridModule,
    NzInputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzIconModule,
    NzToolTipModule,
    NzAvatarModule,
    VgControlsModule,
    VgCoreModule,
    NzModalModule,
    NzRadioModule,
    NzDrawerModule,
    NzProgressModule
  ],
  exports: [
    LandingpageComponent
  ],
  providers: [
    ScrollToService 
  ]

})
export class LandingpageModule { }
