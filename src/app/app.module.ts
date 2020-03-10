import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, en_US, NzBadgeModule, NzConfig, NZ_CONFIG } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { AuthGuard } from './shared/guard/auth.guard';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';

import { NgChartjsModule } from 'ng-chartjs';
import { LandingpageModule } from './components/landingpage/landingpage.module';
import { CallbackModule } from './components/callback/callback.module';
import { PricingModule } from './components/pricing/pricing.module';
import { TrainingsModule } from './components/trainings/trainings.module';
import { MyIconPickerModule } from './components/my-icon-picker/my-icon-picker.module';
import { SignupModule } from './components/signup/signup.module';
import { HomeModule } from './components/home/home.module';
import { CalendarModule } from './components/calendar/calendar.module';
import { NewAppComponent } from './new-app/new-app.component';
import { FileService } from './shared/services/file.service';
import { TrainingService } from './shared/services/training.service';
import { UserTrainingService } from './shared/services/userTraining.service';
import { AuthService } from './shared/services/auth.service';
import { UserService } from './shared/services/user.service';
import { LoginModule } from './components/login/login.module';
import { SendmailService } from './shared/services/sendmail.service';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';
import { VgOverlayPlayModule } from 'videogular2/compiled/overlay-play';


const ngZorroConfig: NzConfig = {
    message: { nzTop: 300 },
    notification: { nzTop: 240 }
};

registerLocaleData(en);

@NgModule({
    declarations: [
        AppComponent,
        NewAppComponent,
    ],
    imports: [
        PricingModule,
        VgCoreModule,
        VgControlsModule,
        BrowserModule,
        BrowserAnimationsModule,
        NgZorroAntdModule,
        AppRoutingModule,
        SharedModule,
        NgChartjsModule,
        LandingpageModule,
        CallbackModule,
        TrainingsModule,
        MyIconPickerModule,
        SignupModule,
        TrainingsModule,
        HomeModule,
        CalendarModule,
        LoginModule,
        NzBadgeModule,
        VgOverlayPlayModule,
    ],
    providers: [
        { 
            provide: NZ_I18N,
            useValue: en_US, 
        },
        { provide: NZ_CONFIG, useValue: ngZorroConfig },
        AuthGuard,
        TrainingService,
        AuthService,
        UserService,
        UserTrainingService,
        FileService,
        SendmailService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
