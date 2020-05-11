import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MyteamComponent } from './components/myteam/myteam.component';


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
        loadChildren: () => import('./components/myteam/myteam.module').then(m => m.MyteamModule)
    },
    {
        path: 'myteam/:uid',
        loadChildren: () => import('./components/myteam/myteam.module').then(m => m.MyteamModule)
    },
    {
        path: 'trainings',
        loadChildren: () => import('./components/trainings/trainings.module').then(m => m.TrainingsModule)
    },
    {
        path: 'trainings/:tid',
        loadChildren: () => import('./components/trainings/trainings.module').then(m => m.TrainingsModule)
    },
    /*
    {
        path: 'trainingviewer',
        loadChildren: () => import('./components/training-viewer/training-viewer.module').then(m => m.TrainingViewerModule)
    },
    {
        path: 'trainingviewer/:tid',
        loadChildren: () => import('./components/training-viewer/training-viewer.module').then(m => m.TrainingViewerModule)
    },
    */
    {
        path: 'mytrainings',
        loadChildren: () => import('./components/my-trainings/my-trainings.module').then(m => m.MyTrainingsModule)
    },
]