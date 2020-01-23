import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { AppRoutingModule } from './app-routing.module';
import { TemplateModule } from './shared/template/template.module';
import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FileManagerModule } from './components/file-manager/file-manager.module';

import { AppComponent } from './app.component';

import { NgChartjsModule } from 'ng-chartjs';
import { ThemeConstantService } from './shared/services/theme-constant.service';
import { LandingpageModule } from './components/landingpage/landingpage.module';
import { CallbackModule } from './components/callback/callback.module';
import { PricingModule } from './components/pricing/pricing.module';
import { MembersModule } from './components/members/members.module';
import { ProfileModule } from './components/profile/profile.module';
import { ProjectsModule } from './components/projects/projects.module';
import { SettingModule } from './components/setting/setting.module';
import { FilesModule } from './components/files/files.module';
import { TrainingsModule } from './components/trainings/trainings.module';
import { MyIconPickerModule } from './components/my-icon-picker/my-icon-picker.module';
import { UsersModule } from './components/users/users.module';
import { JobsModule } from './components/jobs/jobs.module';
import { SignupModule } from './components/signup/signup.module';
import { HomeModule } from './components/home/home.module';
import { ConfigModule } from './components/config/config.module';
import { CalendarModule } from './components/calendar/calendar.module';


registerLocaleData(en);

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        PricingModule,
        MembersModule,
        ProfileModule,
        ProjectsModule,
        SettingModule,
        BrowserModule,
        BrowserAnimationsModule,
        NgZorroAntdModule,
        AppRoutingModule,
        TemplateModule,
        SharedModule,
        NgChartjsModule,
        DashboardModule,
        FileManagerModule,
        LandingpageModule,
        CallbackModule,
        FilesModule,
        TrainingsModule,
        MyIconPickerModule,
        UsersModule,
        JobsModule,
        SignupModule,
        TrainingsModule,
        HomeModule,
        ConfigModule,
        CalendarModule
    ],
    providers: [
        { 
            provide: NZ_I18N,
            useValue: en_US, 
        },
        ThemeConstantService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
