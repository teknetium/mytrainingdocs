import { Component, OnInit } from '@angular/core';
import { TrainingModel } from '../../shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';
import { AuthService } from '../../shared/services/auth.service';

import { BehaviorSubject, Observable } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserModel } from '../../shared/interfaces/user.model';
import { SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../shared/services/user.service';
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
  cellFontSize = '28';

  iconColor = 'red';
  iconClass = 'far fa-fw fa-file';
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedItem$: Observable<TrainingModel>;
  selectedItemIndex$: Observable<number>;
  selectedItemIndex = -1;
  viewMode$: Observable<string>;
  viewMode = 'edit';
  isOpen = false;
  trainingSelected: TrainingModel;


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
  }

  newTraining() {
    this.trainingService.addNewTraining();
    this.trainingService.changeEditorVisualState(false);
  }
  confirmDelete(item: TrainingModel) {
    this.trainingService.deleteTraining(item._id);
  }

  editTraining(item: TrainingModel, index) {
    this.viewMode = 'edit';
    this.trainingSelected = item;
    this.selectItem(index);
    this.trainingService.selectItemForEditing(index);
  }

  viewTraining(item: TrainingModel, index) {
    this.viewMode = 'view';
    this.trainingSelected = item;
    this.selectItem(index);
    this.trainingService.selectItemForEditing(index);
}

  selectItem(index) {
    if (index === this.selectedItemIndex) {
      this.selectedItemIndex = -1;
      return;
    }
    this.selectedItemIndex = index;
  }

}
