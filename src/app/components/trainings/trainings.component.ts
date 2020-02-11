import { Component, OnInit } from '@angular/core';
import { TrainingModel } from '../../shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';
import { AuthService } from '../../shared/services/auth.service';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserModel } from '../../shared/interfaces/user.type';
import { SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css'],
})

export class TrainingsComponent implements OnInit {

  isAuthenticated$: Observable<boolean>;
  trainings$: Observable<TrainingModel[]>;
  trainings: TrainingModel[];
  cellFontSize = '28';
  deleteDisabled = true;
  popOverTrigger = null;
  cursor = '';
  edit = false;
  toolbarItem = '';
  
  listOfOption: Array<{ label: string; value: string }> = [];
  listOfSelectedValue = [];


  iconColor = 'red';
  iconClass = 'far fa-fw fa-file';
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedTraining$: Observable<TrainingModel>;
  selectedItemIndex$: Observable<number>;
  selectedItemIndex = -1;
  viewMode$: Observable<string>;
  viewMode = 'edit';
  isOpen = false;
  trainingSelected: TrainingModel;
  myTeam$: Observable<UserModel[]>;
  myTeam: UserModel[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
    private userService: UserService) {
    this.myTeam$ = this.userService.getMyTeamStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
    this.selectedItemIndex$ = this.trainingService.getSelectedTrainingIndexStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.viewMode$ = this.trainingService.getViewModeStream();
  }

  ngOnInit() {
    this.selectItem(-1);
    this.authenticatedUser$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.trainings$.subscribe(trainingList => {
        if (trainingList) {
          console.log('trainings component', trainingList);
          this.trainings = trainingList;
        } else {
          this.trainings = [];
        }
      });

      this.selectedItemIndex$.subscribe(index => {
        console.log('selectedItemIndex$', index);
        this.selectedItemIndex = index;
      })

      this.myTeam$.subscribe(users => {
        if (users.length === 0) {
          return;
        }
        this.myTeam = users;

        const children: Array<{ label: string; value: string }> = [];
        for (let i = 0; i < this.myTeam.length; i++) {
          children.push({ label: this.myTeam[i].firstName + ' ' + this.myTeam[i].lastName, value: this.myTeam[i].uid });
        }
        this.listOfOption = children;

      })

    });
  }

  newTraining() {
    this.trainingService.addNewTraining();
    // this.trainingService.changeEditorVisualState(false);
  }
  confirmDelete() {
    this.trainingService.deleteTraining(this.trainings[this.selectedItemIndex]._id);
    console.log('confirmDelete', this.selectedItemIndex);
    this.selectItem(-1);
  }

  editTraining(item: TrainingModel, index) {
    this.viewMode = 'Edit';
    this.trainingSelected = item;
    this.selectItem(index);
    this.trainingService.selectItemForEditing(index, '');
  }

  viewTraining(item: TrainingModel, index) {
    this.viewMode = 'view';
    this.trainingSelected = item;
    this.selectItem(index);
    this.trainingService.selectItemForEditing(index, '');
  }

  selectToolbarItem(item) {
    this.toolbarItem = item;
  }

  selectItem(index) {
    if (index === this.selectedItemIndex) {
      this.selectedItemIndex = -1;
      this.trainingService.selectItemForEditing(-1, '');
      this.deleteDisabled = true;
    } else {
      this.selectedItemIndex = index;
      this.trainingService.selectItemForEditing(index, '');
      if (index === -1) {
        this.deleteDisabled = true;
      } else {
        this.deleteDisabled = false;
      }
    }
  }

  closeTraining() {
    this.selectedItemIndex = -1;
    this.trainingService.selectItemForEditing(-1, '');
    this.deleteDisabled = true;
  }



}
