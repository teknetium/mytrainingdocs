import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectsDashboardComponent } from '../dashboardx/projects-dashboard.component';

const routes: Routes = [
    {
        path: 'projects',
        component: ProjectsDashboardComponent,
        data: {
            title: 'Projects Dashboard ',
            headerDisplay: "none"
        }
    },
    /*
    {
        path: 'with-breadcrumb',
        component: WithBreadcrumbDashboardComponent,
        data: {
            title: 'With Breadcrumb '
        }
    },
    */
];
    /*
const routes: Routes = [
    {
        path: 'default',
        component: DefaultDashboardComponent,
        data: {
            title: 'Dashboard ',
            headerDisplay: "none"
        }
    },
    {
        path: 'e-commerce',
        component: EcommerceDashboardComponent,
        data: {
            title: 'E-Commerce Dashboard ',
            headerDisplay: "none"
        }
    },
    */
    /*
    {
        path: 'crm',
        component: CrmDashboardComponent,
        data: {
            title: 'CRM',
            headerDisplay: "none"
        }
    }
];
    */

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardRoutingModule { }
