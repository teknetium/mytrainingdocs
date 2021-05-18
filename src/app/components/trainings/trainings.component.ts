import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { UserService } from '../../shared/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';
import { CommentService } from 'src/app/shared/services/comment.service';
import { UserTrainingModel } from 'src/app/shared/interfaces/userTraining.type';
import * as cloneDeep from 'lodash/cloneDeep';


@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css'],
})

export class TrainingsComponent extends BaseComponent implements OnInit, AfterViewInit {

  isAuthenticated$: Observable<boolean>;
  cellFontSize = '28';
  deleteDisabled = true;
  popOverTrigger = null;
  cursor = '';
  edit = false;
  
  commentHash = {};
  ratingHash = {};
  showCommentsPanel = false;

  userTrainings: UserTrainingModel[];
  iconColor = 'red';
  iconClass = 'far fa-fw fa-file';
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedTraining$: Observable<TrainingModel>;
  isOpen = false;
  userTrainingForTid$: Observable<UserTrainingModel[]>;
  trainingIdHash$: Observable<TrainingIdHash>;
  teamTrainingHash$: Observable<TrainingIdHash>;
  teamTrainingHash = {};
  trainingIdHash: TrainingIdHash;
//  trainingSelected: TrainingModel;
  trainings: TrainingModel[] = [];
  trainingsDisplay: TrainingModel[] = [];
  myTeamIdHash$: Observable<UserIdHash>;
  myTeamIdHash: UserIdHash;
  selectedTrainingId = null;
  currentTrainingId = '';
  tid: string = null;
  selectedTraining = false;
  showAssessmentPanel = false;
  sortName: string | null = null;
  sortValue: string | null = null;
  showHistoryPanel = false;
  orgUserHash$: Observable<UserIdHash>;
  orgUserHash = {};
  
  constructor(
    private trainingService: TrainingService,
    private commentService: CommentService,
    private route: ActivatedRoute,
    private userTrainingService: UserTrainingService,
    private userService: UserService) {
    super();
    this.orgUserHash$ = this.userService.getOrgHashStream();
    this.userTrainingForTid$ = this.userTrainingService.getUserTrainingForTidStream();
    this.trainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.teamTrainingHash$ = this.trainingService.getTeamTrainingHashStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
  }

  ngOnInit() {

    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.tid = params.get('tid');
    });
    this.selectedTraining$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedTraining => {
      if (!selectedTraining) {
        this.selectedTraining = false;
      } else {
        this.selectedTraining = true;
      }
    });
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;

    });
    this.orgUserHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((orgUserHash) => {
      if (!orgUserHash) {
        return;
      }
      this.orgUserHash = orgUserHash;

    });
    this.trainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(trainingIdHash => {
      let allTrainings;
      if (trainingIdHash) {
        this.trainingIdHash = trainingIdHash;
        allTrainings = Object.values(trainingIdHash);
        console.log('trainings component:init');
        this.trainings = [];
        for (let training of allTrainings) {
          if (training.teamId === 'mytrainingdocs' || training.teamId === 'shared') {
            continue;
          } else {
            this.trainings.push(training);
            this.commentService.getComments$(training._id).subscribe(comments => {
              this.commentHash[training._id] = comments;
              let ratingTotal = 0;
              for (let index in comments) {
                ratingTotal = ratingTotal + comments[index].rating;
              }
              this.ratingHash[training._id] = ratingTotal / comments.length;
            })
          }
        }
        this.trainingsDisplay = this.trainings;
      } else {
        this.trainings = [];
      }
    });
    this.teamTrainingHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(teamTrainingHash => {
      this.teamTrainingHash = teamTrainingHash;
      this.trainings = Object.values(this.teamTrainingHash);
      this.trainingsDisplay = this.trainings;
    })
    /*
    this.userTrainingForTid$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uts => {
      this.userTrainings = uts;
    })
    */
  }

  ngAfterViewInit() {
    if (this.tid) {
      this.selectTraining(this.tid);
    }

  }

  deleteTraining(tid: string) {
    this.userTrainingService.getUTForTraining$(tid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
      for (let ut of userTrainings) {
        this.userTrainingService.deleteUserTraining$(ut._id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(item => {
          this.userTrainingService.initUserTrainingsForUser(ut.uid);
        })
      }
    });
    this.trainingService.deleteTraining(tid);
    this.trainingService.selectTraining(null);
  }

  versionFormatter(version) {
    if (!version) {
      return;
    }
    let re = /_/g;
    return version.replace(re, '.');
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

  editTraining(training) {

  }

  showAssessmentStats(tid) {
    this.userTrainingService.getUTForTraining(tid);
    this.currentTrainingId = tid;
    this.showAssessmentPanel = true;
  }

  showComments(tid) {
    this.currentTrainingId = tid;
    this.showCommentsPanel = true;
  }

  showHistory(tid: string) {
//    this.trainingService.selectTraining(tid);
    this.selectedTrainingId = tid;
    this.currentTrainingId = tid;
    this.showHistoryPanel = true;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }

  search(): void {
    console.log('search', this.sortName, this.sortValue);
    const data = cloneDeep(this.trainingsDisplay);
    this.trainingsDisplay = [];
    if (this.sortName && this.sortValue) {
      this.trainingsDisplay = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
    } else {
      this.trainingsDisplay = data;
    }
  }
}
