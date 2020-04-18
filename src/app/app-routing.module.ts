import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router, PreloadingStrategy, PreloadAllModules } from '@angular/router';
import { NewAppComponent } from './new-app/new-app.component';
import { LandingpageComponent } from './components/landingpage/landingpage.component';
import { CallbackComponent } from './components/callback/callback.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthenticatedROUTES } from './authenticated.routes';
import { AuthGuard } from './shared/guard/auth.guard';
import { LoginComponent } from './components/login/login.component';


const appRoutes: Routes = [
    {   
        path: '',
        redirectTo: 'app',
        pathMatch: 'full'
    },
    {
        path: 'app',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: NewAppComponent,
        children: AuthenticatedROUTES

    },
    {
        path: 'callback',
        component: CallbackComponent,
    },
    {
        path: 'signup/:id',
        component: SignupComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'landingpage',
        component: LandingpageComponent,
    },
    ];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            enableTracing: true,
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