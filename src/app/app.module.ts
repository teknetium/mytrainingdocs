import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, en_US, NzBadgeModule, NzConfig, NZ_CONFIG, NzStepsModule, NzSpinModule, NzAlertModule } from 'ng-zorro-antd';
import { registerLocaleData,  } from '@angular/common';
import en from '@angular/common/locales/en';

import { AuthGuard } from './shared/guard/auth.guard';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { CallbackModule } from './components/callback/callback.module';
import { HomeModule } from './components/home/home.module';
import { NewAppComponent } from './new-app/new-app.component';
import { AuthService } from './shared/services/auth.service';
import { UserService } from './shared/services/user.service';
import { LoginModule } from './components/login/login.module';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';
import { VgOverlayPlayModule } from 'videogular2/compiled/overlay-play';
import { SettingsModule } from './components/settings/settings.module';
import { JoyrideModule } from 'ngx-joyride';
import { LandingpageModule } from './components/landingpage/landingpage.module';
import { DocsModule } from './components/docs/docs.module';
import { VerifyEmailModule } from './components/verify-email/verify-email.module';


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
        BrowserModule,
        BrowserAnimationsModule,
        NgZorroAntdModule,
        AppRoutingModule,
        SharedModule,
        CallbackModule,
        HomeModule,
        LoginModule,
        NzBadgeModule,
        NzAlertModule,
        VgOverlayPlayModule,
        SettingsModule,
        LandingpageModule,
        VerifyEmailModule,
        DocsModule,
        NzStepsModule,
        NzSpinModule
    ],
    providers: [
//        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
        { 
            provide: NZ_I18N,
            useValue: en_US, 
        },
        { provide: NZ_CONFIG, useValue: ngZorroConfig },
        AuthGuard,
        AuthService,
        UserService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
