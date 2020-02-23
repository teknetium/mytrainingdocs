import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, en_US, NzBadgeModule } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { AuthGuard } from './shared/guard/auth.guard';
import { AppRoutingModule } from './app-routing.module';
import { TemplateModule } from './shared/template/template.module';
import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { AppComponent } from './app.component';

import { NgChartjsModule } from 'ng-chartjs';
import { ThemeConstantService } from './shared/services/theme-constant.service';
import { LandingpageModule } from './components/landingpage/landingpage.module';
import { CallbackModule } from './components/callback/callback.module';
import { PricingModule } from './components/pricing/pricing.module';
import { SettingModule } from './components/setting/setting.module';
import { FilesModule } from './components/files/files.module';
import { TrainingsModule } from './components/trainings/trainings.module';
import { MyIconPickerModule } from './components/my-icon-picker/my-icon-picker.module';
import { SignupModule } from './components/signup/signup.module';
import { HomeModule } from './components/home/home.module';
import { ConfigModule } from './components/config/config.module';
import { CalendarModule } from './components/calendar/calendar.module';
import { NewAppComponent } from './new-app/new-app.component';
import { FileService } from './shared/services/file.service';
import { TrainingService } from './shared/services/training.service';
import { UserTrainingService } from './shared/services/userTraining.service';
import { AuthService } from './shared/services/auth.service';
import { UserService } from './shared/services/user.service';
import { LoginModule } from './components/login/login.module';
import { NzNotificationService, NzNotificationServiceModule } from 'ng-zorro-antd/notification';



registerLocaleData(en);

@NgModule({
    declarations: [
        AppComponent,
        NewAppComponent,
    ],
    imports: [
        PricingModule,
        SettingModule,
        BrowserModule,
        BrowserAnimationsModule,
        NgZorroAntdModule,
        AppRoutingModule,
        TemplateModule,
        SharedModule,
        NgChartjsModule,
        DashboardModule,
        LandingpageModule,
        CallbackModule,
        FilesModule,
        TrainingsModule,
        MyIconPickerModule,
        SignupModule,
        TrainingsModule,
        HomeModule,
        ConfigModule,
        CalendarModule,
        LoginModule,
        NzBadgeModule
    ],
    providers: [
        { 
            provide: NZ_I18N,
            useValue: en_US, 
        },
        ThemeConstantService,
        AuthGuard,
        TrainingService,
        AuthService,
        UserService,
        UserTrainingService,
        FileService,
        NzNotificationService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
