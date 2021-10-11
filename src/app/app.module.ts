import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
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
import { OrgService } from './shared/services/org.service';
import { LoginModule } from './components/login/login.module';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { SettingsModule } from './components/settings/settings.module';
import { LandingpageModule } from './components/landingpage/landingpage.module';
import { DocsModule } from './components/docs/docs.module';
import { VerifyEmailModule } from './components/verify-email/verify-email.module';
import { MyLoaderModule } from './components/my-loader/my-loader.module';
import { LoaderInterceptor } from './shared/interceptor/loader-interceptor.service';
import { LoaderService } from './shared/services/loader.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './shared/interceptor/error-interceptor.service';
import { PaymentCallbackModule } from './components/payment-callback/payment-callback.module';
import { ContactUsModule } from './components/contact-us/contact-us.module';
import { MessagesModule } from './components/messages/messages.module';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';

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
        AppRoutingModule,
        SharedModule,
        CallbackModule,
        PaymentCallbackModule,
        ContactUsModule,
        HomeModule,
        LoginModule,
        NzBadgeModule,
        NzSelectModule,
        NzAlertModule,
        NzTabsModule,
        NzInputModule,
        NzDrawerModule,
        VgOverlayPlayModule,
        SettingsModule,
        LandingpageModule,
        VerifyEmailModule,
        MessagesModule,
        NzStepsModule,
        NzRadioModule,
        NzProgressModule,
        NzDropDownModule,
        NzTagModule,
        NzCardModule,
        NzAvatarModule,
        NzModalModule,
        NzLayoutModule,
        NzSpinModule,
        MyLoaderModule,
        NzNotificationModule
    ],
    providers: [
        //        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
        { 
            provide: NZ_I18N,
            useValue: en_US, 
        },
//        {
//            provide: HTTP_INTERCEPTORS,
//            useClass: HttpErrorInterceptor,
//            multi: true
//        },
        { provide: NZ_CONFIG, useValue: ngZorroConfig },
        AuthGuard,
        AuthService,
        UserService,
        OrgService,
        LoaderService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
