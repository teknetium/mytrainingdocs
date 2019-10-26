import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { FullLayoutComponent } from "./layouts/full-layout/full-layout.component";
import { CommonLayoutComponent } from "./layouts/common-layout/common-layout.component";

import { FullLayout_ROUTES } from "./shared/routes/full-layout.routes";
import { CommonLayout_ROUTES } from "./shared/routes/common-layout.routes";
import { ProjectsDashboardComponent } from './dashboardx/projects-dashboard.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { CallbackComponent } from './components/callback/callback.component';

const appRoutes: Routes = [
    {
        path: '', 
        component: CommonLayoutComponent,
        children: CommonLayout_ROUTES 
    },
        {
        path: 'callback', 
        component: CallbackComponent,
    },
    {
        path:'null',
        redirectTo: '',
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
            preloadingStrategy: PreloadAllModules,
            useHash: false,
            scrollPositionRestoration: 'enabled' 
        })
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {
}