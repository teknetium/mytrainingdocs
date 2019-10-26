import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { ScrollToModule, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzAddOnModule, NzDrawerModule } from 'ng-zorro-antd';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { NgChartjsModule } from 'ng-chartjs';

import { ProjectsDashboardComponent } from '../dashboardx/projects-dashboard.component';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        DashboardRoutingModule,
        ScrollToModule,
        NgChartjsModule
    ],
    exports: [],
    declarations: [
        ProjectsDashboardComponent,
    ],
    providers: [
        ThemeConstantService,
        AuthService,
        ScrollToService
    ],
})
export class DashboardModule { }
