import { Component, OnInit } from '@angular/core';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';
import { AuthService } from '../../shared/services/auth.service';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css'],
})

export class TrainingsComponent implements OnInit {

  isAuthenticated$: Observable<boolean>;
  cellFontSize = '28';
  deleteDisabled = true;
  popOverTrigger = null;
  cursor = '';
  edit = false;
  

  iconColor = 'red';
  iconClass = 'far fa-fw fa-file';
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedTraining$: Observable<TrainingModel>;
  isOpen = false;
  trainingIdHash$: Observable<TrainingIdHash>;
  teamTrainingHash$: Observable<TrainingIdHash>;
  teamTrainingHash = {};
  trainingIdHash: TrainingIdHash;
  trainingSelected: TrainingModel;
  trainings: TrainingModel[] = [];
  myTeamIdHash$: Observable<UserIdHash>;
  myTeamIdHash: UserIdHash;
  selectedTrainingId = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
    private userService: UserService) {
    this.trainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.teamTrainingHash$ = this.trainingService.getTeamTrainingHashStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
  }

  ngOnInit() {
    this.selectTraining(null);
    this.authenticatedUser$.pipe(take(2)).subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;

    });
    this.trainingIdHash$.subscribe(trainingIdHash => {
      let allTrainings;
      if (trainingIdHash) {
        this.trainingIdHash = trainingIdHash;
        allTrainings = Object.values(trainingIdHash);
        console.log('trainings component:init', allTrainings, trainingIdHash);
        this.trainings = [];
        for (let training of allTrainings) {
          if (training.teamId === 'mytrainingdocs' || training.teamId === 'shared') {
            continue;
          } else {
            this.trainings.push(training);
          }
        }
      } else {
        this.trainings = [];
      }
    });
    this.teamTrainingHash$.subscribe(teamTrainingHash => {
      this.teamTrainingHash = teamTrainingHash;
      this.trainings = Object.values(this.teamTrainingHash);
    })
  }

  newTraining() {
    this.trainingService.addNewTraining();
  }
  /*
  confirmDelete() {
    this.trainingService.deleteTraining(this.trainingIdHash[this.selectedTrainingId]._id);
    this.selectedTrainingId = null;
  }
*/
  selectTraining(tid: string): void {
    this.trainingService.selectTraining(tid);
    this.selectedTrainingId = tid;
  }

  createNewTraining() {
    this.trainingService.addNewTraining();
  }

}
