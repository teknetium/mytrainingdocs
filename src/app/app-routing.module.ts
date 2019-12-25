import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PricingComponent } from "./components/pricing/pricing.component";
import { LandingpageComponent } from './components/landingpage/landingpage.component';
import { CallbackComponent } from './components/callback/callback.component';
import { HomeComponent } from './components/home/home.component';

const appRoutes: Routes = [
    {
        path: 'landingpage',
        component: LandingpageComponent,
    },
    {
        path: 'pricing',
        component: PricingComponent,
    },
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: '', 
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'callback', 
        component: CallbackComponent,
    },
    {
        path:'null',
        redirectTo: '/home',
        pathMatch: 'full'
    }

    /*
    { 
        path: '', 
        component: FullLayoutComponent, 
        children: FullLayout_ROUTES
    }
    */
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