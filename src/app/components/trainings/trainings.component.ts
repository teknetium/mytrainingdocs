import { Component, OnInit } from '@angular/core';
import { TrainingModel } from '../../shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';
import { AuthService } from '../../shared/services/auth.service';

import {BehaviorSubject, Observable} from 'rxjs';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserModel} from '../../shared/interfaces/user.model';
import {SafeResourceUrl} from '@angular/platform-browser';
import {UserService} from '../../shared/services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'mtd-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css']
})
export class TrainingsComponent implements OnInit {

  isAuthenticated$: Observable<boolean>;
  trainings$: Observable<TrainingModel[]>;
  showInfoPanel: boolean;

  trainingForm: FormGroup;
  iconColor = 'red';
  iconClass = 'far fa-fw fa-file';
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedTraining$: Observable<TrainingModel>;
  selectedTrainingIndex$: Observable<number>;
  status$: Observable<{ color: string, msg: string }>;

  title$: Observable<string>;
  showStatus$: Observable<boolean>;
  showSelectedItem$: Observable<boolean>;
  showSelectedIndexFeedback$: Observable<boolean>;


  constructor(
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
    private userService: UserService) {
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
  }

  ngOnInit() {
    this.authenticatedUser$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.trainings$ = this.trainingService.getAllTrainingsObservable();
      this.showSelectedIndexFeedback$ = this.trainingService.getShowSelectedIndexFeedbackStream();
      this.showSelectedItem$ = this.trainingService.getShowSelectedItemStream();
      this.selectedTrainingIndex$ = this.trainingService.getSelectedTrainingIndexStream();
      this.trainingService.selectItem(0);
    });
  }

  newTraining() {
    this.trainingService.addNewTraining();
  }

  selectTraining(index) {
    this.trainingService.selectItem(index);
  }
}
