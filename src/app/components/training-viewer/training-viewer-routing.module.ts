import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingViewerComponent } from './training-viewer.component';


const routes: Routes = [
    {
        path: '',
        component: TrainingViewerComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TrainingViewerRoutingModule { }