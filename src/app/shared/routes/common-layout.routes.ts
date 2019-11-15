import { Routes } from '@angular/router';
import { ProjectsDashboardComponent } from '../../dashboardx/projects-dashboard.component';
import { FileManagerComponent } from '../../components/file-manager/file-manager.component';
import { MailComponent } from '../../components/mail/mail.component';
import { ProjectListComponent } from '../../components/projects/project-list/project-list.component';
import { SettingComponent } from '../../components/setting/setting.component';
import { MembersComponent } from '../../components/members/members.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { ProfileComponent } from '../../components/profile/profile.component';
import { GettingstartedComponent } from '../../components/gettingstarted/gettingstarted.component';
import { LandingpageComponent } from '../../components/landingpage/landingpage.component';
import { TrainingsComponent } from '../../components/trainings/trainings.component';
import { UsersComponent } from '../../components/users/users.component';
import { AdminComponent } from '../../components/admin/admin.component';
import { SignupComponent } from '../../components/signup/signup.component';

export const CommonLayout_ROUTES: Routes = [
    {
        path: 'landingpage',
        component: LandingpageComponent, 
        data: {
            title: ''
        }
    },
    {
        path: 'signup',
        component: SignupComponent,
        data: {
            title: ''
        }
    },
    {
        path: 'dashboard',
        component: ProjectsDashboardComponent, 
        data: {
            title: 'Dashboard'
        }
    },
    {
        path: 'myteam',
        component: UsersComponent, 
        data: {
            title: 'My Team'
        }
    },
    {
        path: 'mytrainings',
        component: TrainingsComponent,
        data: {
            title: 'My Trainings'
        }
    },
    /*
    {
        path: 'files',
        component: FileManagerComponent,
        data: {
            title: 'Files'
        }
    },
    {
        path: 'users',
        component: UsersComponent,
        data: {
            title: 'Files'
        }
    },
    {
        path: 'trainings',
        component: TrainingsComponent,
        data: {
            title: 'Trainings'
        }
    },
    {
        path: 'jobs',
        component: FileManagerComponent,
        data: {
            title: 'Jobs'
        }
    },
    {
        path: 'myteam',
        component: UsersComponent,
        data: {
            title: 'My Team'
        }
    },
    */
    {
        path: 'gettingstarted',
        component: GettingstartedComponent,
        data: {
            title: 'Getting Started'
        }
    },
    {
        path: 'messages',
        component: MailComponent,
        data: {
            title: 'Messages'
        }
    },
    {
        path: 'profile',
        component: ProfileComponent,
        data: {
            title: 'Profile'
        }
    },
    {
        path: 'admin',
        component: AdminComponent,
        data: {
            title: 'Admin'
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