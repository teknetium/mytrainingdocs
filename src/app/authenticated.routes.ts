import { Routes } from '@angular/router';
import { PricingComponent } from './components/pricing/pricing.component';
import { HomeComponent } from './components/home/home.component';


export const AuthenticatedROUTES: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: {
            title: 'Home'
        }
    },
    {
        path: 'pricing',
        component: PricingComponent,
        data: {
            title: 'Pricing'
        }
    }
];