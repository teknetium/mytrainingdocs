import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from "@angular/router";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SearchPipe } from './pipes/search.pipe';
import { AuthService } from './services/auth.service';

@NgModule({
    exports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        PerfectScrollbarModule,
        SearchPipe
    ],
    imports: [
        RouterModule,
        CommonModule,
        PerfectScrollbarModule
    ],
    declarations: [
        SearchPipe,
    ],
    providers: [
        AuthService
    ]
})

export class SharedModule { }
