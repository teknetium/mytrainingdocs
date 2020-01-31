import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewAppComponent } from './new-app/new-app.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { LandingpageComponent } from './components/landingpage/landingpage.component';
import { CallbackComponent } from './components/callback/callback.component';
import { AppComponent } from './app.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthenticatedROUTES } from './authenticated.routes';

const appRoutes: Routes = [
    {
        path: '',
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
        path: 'landingpage',
        component: LandingpageComponent,
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { 
//            preloadingStrategy: PreloadAllModules,
            useHash: false,
//            scrollPositionRestoration: 'enabled' 
        })
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {
}