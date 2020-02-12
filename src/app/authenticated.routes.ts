import { Routes } from '@angular/router';
import { MyteamComponent } from './components/myteam/myteam.component';
import { HomeComponent } from './components/home/home.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { MyTrainingsComponent } from './components/trainings/my-trainings/my-trainings.component';


export const AuthenticatedROUTES: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: {
            title: 'Home'
        }
    },
    {
        path: 'myteam',
        component: MyteamComponent,
        data: {
            title: 'My Team'
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
        path: 'mytrainings',
        component: MyTrainingsComponent,
        data: {
            title: 'My Trainings'
        }
    }
];