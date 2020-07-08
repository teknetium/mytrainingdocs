import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.type';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';
import { CommentService } from '../../shared/services/comment.service';
import { UserService } from '../../shared/services/user.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { UserTrainingModel, UserTrainingHash, UidUserTrainingHash, AssessmentResponse } from 'src/app/shared/interfaces/userTraining.type';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';


@Component({
  selector: 'app-user-trainings',
  templateUrl: './user-trainings.component.html',
  styleUrls: ['./user-trainings.component.css'],
  //  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTrainingsComponent extends BaseComponent implements OnInit {

  statusIconHash = {
    upToDate: {
      icon: 'smile',
      color: '#52c41a',
      desc: 'In Progress'
    },
    pastDue: {
      icon: 'exclamation-circle',
      color: 'red',
      desc: 'Past Due'

    },
    completed: {
      icon: 'check-circle',
      color: '#4891f7',
      desc: 'Completed'
    }
  };

  //  userTrainingHash$: Observable<UserTrainingHash>;
  uidUserTrainingHash$: Observable<UidUserTrainingHash>;
  userTrainings$: Observable<UserTrainingModel[]>;
  userTrainingCompleted$: Observable<UserTrainingModel>;
  userTrainings: UserTrainingModel[];
  trainingIdHash$: Observable<TrainingIdHash>;
  trainingIdHash: TrainingIdHash;
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;
  selectedTraining$: Observable<TrainingModel>;
  selectedTraining: TrainingModel;

  @Input() mode = '';
  @Input() logSession = 'off';
  @Input() production = 'off';

  currentUserTraining: string;
  currentTrainingId;
  markCompletedModalIsVisible: boolean;
  trainingIsVisible: boolean;
  utIdHash = {};
  comment = '';
  rating = 0;
  teamId;


  constructor(
    private userService: UserService,
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private commentService: CommentService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.userTrainingCompleted$ = this.userTrainingService.getUserTrainingCompletedStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    //    this.uidUserTrainingHash$ = this.userTrainingService.getUidUserTrainingHashStream();
    this.trainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
  }

  ngOnInit() {
    /*
    this.userTrainingCompleted$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTraining => {
      if (!userTraining) {
        return;
      } else {
        console.log('userTrainingCompleted', userTraining);
        if (userTraining.status === 'completed') {
          return;
        } else {
          this.utIdHash[userTraining._id] = userTraining;
          this.markAsComplete(userTraining._id);
        }
      }
    })
    */
    this.selectedTraining$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedTraining => {
      if (!selectedTraining) {
        this.currentUserTraining = '';
        this.selectedTraining = null;
      } else {
        this.selectedTraining = selectedTraining;
      }
    })
    this.trainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(trainingIdHash => {
      if (!trainingIdHash) {
        return;
      }

      this.trainingIdHash = trainingIdHash;
    })

    this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
      if (!userTrainings) {
        return;
      }

      let userId;
      let pastDueFound = false;
      if (userTrainings.length > 0) {
        userId = userTrainings[0].uid;
        this.userTrainings = userTrainings;
        for (let userTraining of userTrainings) {
          this.utIdHash[userTraining._id] = userTraining;
          if (userTraining.status === 'pastDue') {
            pastDueFound = true;
            break;
          }
        }
        if (pastDueFound) {
          this.userService.setUserStatusPastDue(userId);
        } else {
          this.userService.setUserStatusUpToDate(userId);
        }
      } else {
        this.userTrainings = [];
      }
    });

    this.selectedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      console.log('UserTraining:selectedUser$', user);
      if (!user) {
        return;
      }
      //      this.userTrainings = [];
      this.selectedUser = user;
      this.userTrainingService.selectUser(user._id);

    });
    /*  
        this.uidUserTrainingHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidUserTrainingHash => {
          let userTrainingHash = uidUserTrainingHash[this.selectedUser._id];
          if (Object.keys(userTrainingHash).length === 0) {
            return;
          }
          this.userTrainings = Object.values(userTrainingHash);
          for (let ut of this.userTrainings) {
            this.utIdHash[ut._id] = ut;
          }
          this.cd.detectChanges();
        })
    */
  }

timeFormat(ms): string {
  let m = String(Math.floor(ms / 60000)).padStart(2, '0');
  let s = String(Math.floor(((ms % 3600000) % 60000) / 1000)).padStart(2, '0');
  return m + ':' + s;
}

versionFormatter(version) {
  if (!version) {
    return;
  }
  let re = /_/g;
  return version.replace(re, '.');
}

viewTraining(utid, tid, version) {
  if (this.logSession === 'on') {
    if (this.selectedUser.userType === 'supervisor') {
      if (!this.selectedUser.teamId) {
        this.userTrainingService.startSession(utid, this.selectedUser._id, tid, this.selectedUser._id);
      } else {
        this.userTrainingService.startSession(utid, this.selectedUser._id, tid, this.selectedUser.teamId);
      }
    } else {
      this.userTrainingService.startSession(utid, this.selectedUser._id, tid, this.selectedUser.teamId);
    }
  }
  this.currentTrainingId = tid;
  this.currentUserTraining = utid;
  this.trainingIsVisible = true;
  this.trainingService.selectTrainingForProduction(tid, version);
}

confirmDeleteUserTraining(ut) {
  this.userTrainingService.deleteUserTraining(ut._id, ut.uid);
  this.userTrainingService.selectUser(ut.uid);

  let anotherPastDueFound = false;
  if ((this.userTrainings && this.userTrainings.length > 0) && (this.userTrainings[0].uid === ut.uid)) {
    for (let userTraining of this.userTrainings) {
      if (userTraining._id !== ut._id) {
        if (userTraining.status === 'pastDue') {
          anotherPastDueFound = true;
          break;
        }
      }
    }
    if (anotherPastDueFound) {
      this.userService.setUserStatusPastDue(ut.uid);
    } else {
      this.userService.setUserStatusUpToDate(ut.uid);
    }
  }

  this.trainingIsVisible = false;
}

handleMarkAsCompletedCancel() {
  this.markCompletedModalIsVisible = false;
}

markAsComplete(utid: string) {
  this.currentUserTraining = utid;
  this.markCompletedModalIsVisible = true;
}

updateDueDate(event, ut) {
  let newDueDate = new Date(event).getTime();
  console.log('updateDueDate', ut, this.userTrainings);
  if (newDueDate < new Date().getTime()) {
    ut.status = 'pastDue';
    this.userService.setUserStatusPastDue(ut.uid);
  } else {
    ut.status = 'upToDate';
    let anotherPastDueFound = false;
    if ((this.userTrainings && this.userTrainings.length > 0) && (this.userTrainings[0].uid === ut.uid)) {
      for (let userTraining of this.userTrainings) {
        if (userTraining._id !== ut._id) {
          if (userTraining.status === 'pastDue') {
            anotherPastDueFound = true;
            break;
          }
        }
      }
      if (anotherPastDueFound) {
        this.userService.setUserStatusPastDue(ut.uid);
      } else {
        this.userService.setUserStatusUpToDate(ut.uid);
      }
    }
  }
  ut.dueDate = newDueDate;
  this.userTrainingService.saveUserTraining(ut);
  this.userTrainingService.getUTForUser(ut.uid);
}

markTrainingAsComplete(selectedTraining: TrainingModel) {
  if (this.comment === '') {
    return;
  }
  let comment = {
    _id: String(new Date().getTime()),
    tid: this.currentTrainingId,
    version: this.trainingIdHash[this.utIdHash[this.currentUserTraining].tid].versions[0].version,
    author: this.selectedUser._id,
    text: this.comment,
    rating: this.rating,
    date: new Date().getTime()
  }
  this.trainingIsVisible = false;
  this.markCompletedModalIsVisible = false;
  this.utIdHash[this.currentUserTraining].dateCompleted = new Date().getTime();
  this.utIdHash[this.currentUserTraining].status = 'completed';
  this.userTrainingService.saveUserTraining(this.utIdHash[this.currentUserTraining]);
  this.commentService.saveTrainingComment(comment);
}

ratingChanged(event) {
  this.rating = event;
}

processAssessmentResult(event: string) {

  this.markAsComplete(event);

  this.trainingIsVisible = false;
}
}
