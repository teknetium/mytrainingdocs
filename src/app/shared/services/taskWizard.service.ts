import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError } from 'rxjs';
import { TaskModel, TaskStepContentModel, TaskHash, TaskStepContentHash } from '../interfaces/task.type';
import { JoyrideService } from 'ngx-joyride';

@Injectable({
  providedIn: 'root'
})
export class TaskWizardService {


  taskHash = {
    task0: {
      taskId: 'Task 0',
      description: 'Navbar',
      steps: ['task0Step1@home', 'task0Step2@home', 'task0Step3@home', 'task0Step4@home'],
    },
    task1: {
      taskId: 'Task 1',
      description: 'assign a training to an individual',
      steps: ['task1Step1@myteam', 'task1Step2@myteam', 'task1Step3@myteam', 'task1Step4@myteam'],
    },
    task2: {
      taskId: 'Task 2',
      description: 'Assign a training to a team or an entire organization',
      steps: ['task2Step1', 'task2Step2', 'task2Step3', 'task2Step4'],
    },
    task3: {
      taskId: 'Task 3',
      description: 'Assign a training to users based on their job title',
      steps: ['task3Step1', 'task3Step2', 'task3Step3', 'task3Step4'],
    },
    task4: {
      taskId: 'Task 4',
      description: 'Assign a training to users based on their user type',
      steps: ['task4Step1', 'task4Step2', 'task4Step3', 'task4Step4'],
    },
    task5: {
      taskId: 'Task 5',
      description: 'Track the status of a particular training',
      steps: ['task5Step1', 'task5Step2', 'task5Step3', 'task5Step4'],
    },
  }


  taskStepContentHash = {
    task0Step1: {
      task: 'Task 0',
      description: 'Navbar',
      title: 'Welcome',
      content: 'On this page you will find three sections that are intended to give you a very quick, high level understanding of your team and their training.'
    },
    task0Step2: {
      task: 'Task 0',
      description: 'Navbar',
      title: 'My Team',
      content: 'On this page you will find three sections that are intended to give you a very quick, high level understanding of your team and their training.'
    },
    task0Step3: {
      task: 'Task 0',
      description: 'Navbar',
      title: 'Welcome',
      content: 'This section lists all of your trainings.  Selecting a training in this section will put you directly in the training editor.'
    },
    task0Step4: {
      task: 'Task 0',
      description: 'Navbar',
      title: 'Team member training sessions',
      content: 'Team member training sessions'
    },
    task1Step1: {
      task: 'Task 1',
      description: 'assign a training to an individual',
      title: 'Step 1 -  Set Selection Mode to Individual',
      content: 'The selection mode is used to control how users are selected in the org chart.  When set to Individual, clicking on a user in the org chart simply selects that user.'
    },
    task1Step2: {
      task: 'Task 1',
      description: 'Assign a training to an individual',
      title: 'Step 2 -  Select a user from the org chart.',
      content: 'You can select any user from the org chart.'
    },
    task1Step3: {
      task: 'Task 1',
      description: 'assign a training to an individual',
      title: 'Step 3 -  Click on the plus icon',
      content: 'Clicking on this button brings up a dialog that allows you to chose a training to assign.'
    },
    task1Step4: {
      task: 'Task 1',
      description: 'assign a training to an individual',
      title: 'step 4',
      content: 'Set the selection mode to individual.'
    },
    task2Step1: {
      task: 'Task 2',
      description: 'assign a training to an individual',
      title: 'step 1',
      content: 'Set the selection mode to individual.'
    },
    task2Step2: {
      task: 'Task 2',
      description: 'assign a training to an individual',
      title: 'step 2',
      content: 'Set the selection mode to individual.'
    },
    task2Step3: {
      task: 'Task 2',
      description: 'assign a training to an individual',
      title: 'step 3',
      content: 'Set the selection mode to individual.'
    },
    task3Step1: {
      task: 'Task 3',
      description: 'assign a training to an individual',
      title: 'step 1',
      content: 'Set the selection mode to individual.'
    },
    task3Step2: {
      task: 'Task 3',
      description: 'assign a training to an individual',
      title: 'step 2',
      content: 'Set the selection mode to individual.'
    },
    task3Step3: {
      task: 'Task 3',
      description: 'assign a training to an individual',
      title: 'step 3',
      content: 'Set the selection mode to individual.'
    },
    task4Step1: {
      task: 'Task 4',
      description: 'assign a training to an individual',
      title: 'step 1',
      content: 'Set the selection mode to individual.'
    }
  }

  tasks = [];
  tasksBS$ = new BehaviorSubject<string[]>(null);
  taskHashBS$ = new BehaviorSubject<TaskHash>(null);
  taskStepContentHashBS$ = new BehaviorSubject<TaskStepContentHash>(null);

  constructor(
    private joyrideService: JoyrideService
  ) {
    this.tasks = Object.keys(this.taskHash);
    this.tasksBS$.next(this.tasks);
    this.taskHashBS$.next(this.taskHash);
    this.taskStepContentHashBS$.next(this.taskStepContentHash);
  }

  getTasksStream(): Observable<string[]> {
    return this.tasksBS$.asObservable();
  }

  getTaskHashStream(): Observable<TaskHash> {
    return this.taskHashBS$.asObservable();
  }

  getTaskStepContentHashStream(): Observable<TaskStepContentHash> {
    return this.taskStepContentHashBS$.asObservable();
  }

  startTour(task: string) {
    this.joyrideService.startTour({ steps: this.taskHash[task].steps, themeColor: '#333333' });
  }

}
