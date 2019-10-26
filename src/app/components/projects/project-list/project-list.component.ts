import { Component, TemplateRef } from '@angular/core';
import { AppsService } from '../../../shared/services/apps.service';
import { NzModalService } from 'ng-zorro-antd';
import { ProjectList } from '../../../shared/interfaces/project-list.type';

@Component({
//    selector: 'mtd-trainings',
    templateUrl: './project-list.component.html'
})

export class ProjectListComponent  {

    view: string = 'cardView';
    newProject: boolean = false;
    projectList: ProjectList[];

    constructor (private projectListSvc: AppsService, private modalService: NzModalService) {}

    ngOnInit(): void {
        this.projectListSvc.getProjectListJson().subscribe(data => {
            this.projectList = data;
        })
    }

    showNewProject(newProjectContent: TemplateRef<{}>) {
        const modal = this.modalService.create({
            nzTitle: 'Create New Project',
            nzContent: newProjectContent,
            nzFooter: [
                {
                    label: 'Create Project',
                    type: 'primary',
                    onClick: () => this.modalService.confirm(
                        { 
                            nzTitle: 'Are you sure you want to create this project?',
                            nzOnOk: () => this.modalService.closeAll()
                        }
                    )
                },
            ],
            nzWidth: 800
        })    
    }

}