import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common'
import { Arch11Component } from './arch11.component';
import { ScrollToModule, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzAddOnModule, NzDrawerModule, NzRadioModule, NzCardModule, NzIconModule, NzAvatarModule, NzInputModule, NzModalModule, NzButtonModule, NzToolTipModule, NzProgressModule, NzDropDownModule, NzSelectModule, NzTabsModule } from 'ng-zorro-antd';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';


@NgModule({
  declarations: [
    Arch11Component
  ],
  imports: [
    CommonModule,
    ScrollToModule.forRoot(),
    NzCollapseModule,
    NzDropDownModule,
    NzDrawerModule,
    NzButtonModule,
    NzCarouselModule,
    NzSliderModule,
    NzGridModule,
    NzInputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    NzAddOnModule,
    NzRadioModule,
    NzCardModule,
    NzIconModule,
    NzToolTipModule,
    NzAvatarModule,
    VgControlsModule,
    VgCoreModule,
    NzModalModule,
    NzCarouselModule,
    NzTabsModule,
    NzRadioModule,
    NzSelectModule,
    NzProgressModule
  ],
  exports: [
    Arch11Component
  ],
  providers: [
    ScrollToService 
  ]

})
export class Arch11Module { }
