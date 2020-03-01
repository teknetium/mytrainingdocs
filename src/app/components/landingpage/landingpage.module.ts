import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingpageComponent } from './landingpage.component';
import { ScrollToModule, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzAddOnModule, NzDrawerModule, NzRadioModule, NzCardModule, NzIconModule, NzAvatarModule } from 'ng-zorro-antd';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LandingpageComponent
  ],
  imports: [
    CommonModule,
    ScrollToModule,
    NzCollapseModule,
    NzDrawerModule,
    NzCarouselModule,
    NzSliderModule,
    NzGridModule,
    NzInputNumberModule,
    FormsModule,
    NzAddOnModule,
    NzRadioModule,
    NzCardModule,
    NzIconModule,
    NzAvatarModule
  ],
  exports: [
    LandingpageComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    ScrollToService
  ]

})
export class LandingpageModule { }
