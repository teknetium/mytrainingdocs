import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from "@angular/router";
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { JoyrideModule, JoyrideService } from 'ngx-joyride';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SearchPipe } from './pipes/search.pipe';
import { AuthService } from './services/auth.service';

@NgModule({
    exports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        NgZorroAntdModule,
        PerfectScrollbarModule,
        JoyrideModule,
        SearchPipe
    ],
    imports: [
        RouterModule,
        CommonModule,
        NgZorroAntdModule,
        PerfectScrollbarModule
    ],
    declarations: [
        SearchPipe,
    ],
    providers: [
        AuthService,
        JoyrideService
    ]
})

export class SharedModule { }
