import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { UserTrainingModel } from '../../shared/interfaces/userTraining.type';
import { TrainingModel, TrainingIdHash } from 'src/app/shared/interfaces/training.type';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { TrainingService } from '../../shared/services/training.service';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { UserService } from '../../shared/services/user.service';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';


@Component({
  selector: 'app-teammember',
  templateUrl: './teammember.component.html',
  styleUrls: ['./teammember.component.css']
})
export class TeammemberComponent extends BaseComponent implements OnInit {

  userTypeIconHash = {
    individualContributor: 'fas fa-fw fa-user',
    supervisor: 'fas fa-fw fa-user-tie',
    volunteer: 'fas fa-fw fa-user-cowboy',
    customer: 'fas fa-fw fa-user-crown',
    candidate: 'fas fa-fw fa-user-graduate'
  }
  showAssignTrainingDialog = false;
  trainingStatusColorHash = {
    upToDate: '#52c41a',
    pastDue: 'red'
  }
  allTrainingIdHash$: Observable<TrainingIdHash>;
  allTrainingIdHash: TrainingIdHash = {};
  assignableTrainings: TrainingModel[] = [];
  teamTrainings: TrainingModel[] = [];
  trainings: TrainingModel[] = [];
  userTrainings$: Observable<UserTrainingModel[]>;
  showUserTrainingModal = false;
  selectedUser$: Observable<UserModel>;
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedTrainingId = null;
  assignToDisabled = false;
  userIdSelected = '';


  constructor(
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private userService: UserService,
  ) {
    super();
    this.allTrainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
  }

  ngOnInit(): void {
    this.assignableTrainings = [];
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.assignableTrainings = [];

      this.allTrainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(allTrainingIdHash => {
        this.allTrainingIdHash = allTrainingIdHash;
        let trainings = Object.values(this.allTrainingIdHash);
        this.teamTrainings = [];
        for (let training of trainings) {
          if (training.teamId === this.authenticatedUser.uid) {
            this.teamTrainings.push(training);
          }
        }
      })
    })
    this.selectedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      this.userIdSelected = user._id;
      this.trainingService.selectTraining(null);

      this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
        if (!userTrainings) {
          return;
        }
        this.assignableTrainings = [];
        let tids = [];
        for (let ut of userTrainings) {
          tids.push(ut.tid);
        }
        for (let training of this.teamTrainings) {
          if (tids.includes(training._id)) {
            continue;
          } else {
            if (training.versions.length === 0) {
              continue;
            }
            this.assignableTrainings.push(training);
          }
        }

      })
    });
  }

  confirmDelete(user: UserModel) {
    if (user._id === this.authenticatedUser._id) {

    }
    this.userService.deleteUser(user._id);
    this.userTrainingService.deleteUTForUser(user._id);
    this.userService.selectAuthenticatedUser();
  }

  handleCancelUserTraining() {
    this.showUserTrainingModal = false;
    this.selectedTrainingId = null;
  }

  handleAssignUserTraining() {
    if (!this.selectedTrainingId || this.assignableTrainings.length === 0) {
      this.showUserTrainingModal = false;
      return;
    }
    this.userTrainingService.assignTraining(this.userIdSelected, this.selectedTrainingId);
    this.showUserTrainingModal = false;
    this.assignableTrainings.splice(this.assignableTrainings.indexOf(this.selectedTrainingId), 1);
    this.selectedTrainingId = null;
  }

}
