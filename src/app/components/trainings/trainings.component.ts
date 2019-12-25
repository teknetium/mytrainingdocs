import { Component, OnInit } from '@angular/core';
import { TrainingModel } from '../../shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';
import { AuthService } from '../../shared/services/auth.service';

import {BehaviorSubject, Observable} from 'rxjs';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserModel} from '../../shared/interfaces/user.model';
import {SafeResourceUrl} from '@angular/platform-browser';
import {UserService} from '../../shared/services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'mtd-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css'],
})

export class TrainingsComponent implements OnInit {

  isAuthenticated$: Observable<boolean>;
  trainings$: Observable<TrainingModel[]>;
  trainings: TrainingModel[];

  iconColor = 'red';
  iconClass = 'far fa-fw fa-file';
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedItem$: Observable<TrainingModel>;
  selectedItemIndex$: Observable<number>;
  selectedItemIndex = -1;
  viewMode$: Observable<string>;
  viewMode = 'edit';
  renderMode = 'largeCell';
  cellFontSize = 22;
  isOpen = false;

  editorClone: TrainingModel;

  constructor(
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
    private userService: UserService) {
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.viewMode$ = this.trainingService.getViewModeStream();
  }

  ngOnInit() {
    this.authenticatedUser$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.trainings$ = this.trainingService.getAllTrainingsObservable();
      this.selectedItemIndex$ = this.trainingService.getSelectedTrainingIndexStream();
      this.trainings$.subscribe(trainingList => {
        if (trainingList) {
          this.trainings = trainingList;
        } else {
          this.trainings = [];
        }
      });

      this.selectedItemIndex$.subscribe(index => {
        this.selectedItemIndex = index;
      })

    });
    this.viewMode$.subscribe(mode => {
      this.viewMode = mode;
    });
  }

  newTraining() {
    this.trainingService.addNewTraining();
    this.trainingService.changeEditorVisualState(false);
  }

  selectItem(index) {
    if (index === this.selectedItemIndex) {
      this.selectedItemIndex = -1;
      this.trainingService.selectItemForEditing(-1); 
      this.isOpen = false;
      return;
    }
    this.trainingService.selectItemForEditing(index);
    this.selectedItemIndex = index;
    this.isOpen = true;
  }

  renderModeChanged(event) {
    if (event === 'smallCell') {
      this.cellFontSize = 16;
    } else if (event === 'largeCell') {
      this.cellFontSize = 22;
    } else {
      this.cellFontSize = 12;
    }
  }

}
