import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router, PreloadingStrategy, PreloadAllModules } from '@angular/router';
import { NewAppComponent } from './new-app/new-app.component';
import { LandingpageComponent } from './components/landingpage/landingpage.component';
import { CallbackComponent } from './components/callback/callback.component';
import { PaymentCallbackComponent } from './components/payment-callback/payment-callback.component';
import { SignupComponent } from './components/signup/signup.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { AuthenticatedROUTES } from './authenticated.routes';
import { AuthGuard } from './shared/guard/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { DocsComponent } from './components/docs/docs.component';
import { TrainingViewerComponent } from './components/training-viewer/training-viewer.component';


const appRoutes: Routes = [
    {   
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: NewAppComponent,
        children: AuthenticatedROUTES
//        redirectTo: 'app',
//        pathMatch: 'full'
    },
    /*
    {
        path: 'app',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: NewAppComponent,
        children: AuthenticatedROUTES
    },
    */

    {
        path: 'signup/:id',
        component: SignupComponent
    },
    {
        path: 'callback',
        component: CallbackComponent,
    },
    {
        path: 'paymentcallback',
        component: PaymentCallbackComponent,
    },
    /*
    {
        path: 'signup-beta',
        component: SignupComponent
    },
    */
    {
        path: 'verifyemail/:uid',
        component: VerifyEmailComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'landingpage',
        component: LandingpageComponent,
    },
    {
        path: 'naydo',
        component: LandingpageComponent,
    },
    { path: "**", redirectTo: "/", pathMatch: "full" }
    //    {
//        path: 'docs',
//        component: DocsComponent,
//    },
    ];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            enableTracing: false,
            useHash: false,
//            scrollPositionRestoration: 'disabled',
//            anchorScrolling: 'disabled',
        })
    ],
    //            scrollPositionRestoration: 'enabled' 
    exports: [
    RouterModule
]
})

export class AppRoutingModule {
}