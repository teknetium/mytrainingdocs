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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTrainingsComponent extends BaseComponent implements OnInit {

  statusIconHash = {
    upToDate: {
      icon: 'smile',
      color: '#52c41a',
      desc: 'Up To Date'
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
  

  constructor(
    private userService: UserService,
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private commentService: CommentService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
//    this.uidUserTrainingHash$ = this.userTrainingService.getUidUserTrainingHashStream();
    this.trainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
  }

  ngOnInit() {
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
      this.userTrainings = userTrainings;
      for (let userTraining of userTrainings) {
        this.utIdHash[userTraining._id] = userTraining;
      }
      this.cd.detectChanges();
    });

    this.selectedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      console.log('selectedUser$', user);
      if (!user) {
        return;
      }
//      this.userTrainings = [];
      this.selectedUser = user;
      this.userTrainingService.selectUser(user._id);

//      this.userTrainingService.loadTrainingsForUser(user._id);
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

  viewTraining(utid, tid) {
    if (this.logSession === 'on') {
      this.userTrainingService.startSession(utid, this.selectedUser._id, tid);
    }
    this.currentTrainingId = tid;
    this.currentUserTraining = utid;
    this.trainingIsVisible = true;
    this.trainingService.selectTraining(tid);
  }

  confirmDeleteUserTraining(ut) {
    this.userTrainingService.deleteUserTraining(ut._id, ut.uid);
    this.userTrainingService.selectUser(ut.uid);
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
    ut.dueDate = newDueDate;
    this.userTrainingService.saveUserTraining(ut);
  }

  markTrainingAsComplete(selectedTraining: TrainingModel) {
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

  processAssessmentResult(event: AssessmentResponse) {
    if (event.passed) {
      this.utIdHash[this.currentUserTraining].assessmentResponses.push(event);
//      this.utIdHash[this.currentUserTraining].dateCompleted = new Date().getTime();
//      this.utIdHash[this.currentUserTraining].status = 'completed';
      this.userTrainingService.saveUserTraining(this.utIdHash[this.currentUserTraining]);
      this.userTrainingService.stopSession(event.tid);
      this.markAsComplete(this.currentUserTraining);
      this.trainingIsVisible = false;
    }
    event.uid = this.selectedUser._id;
    this.userTrainingService.setAssessmentResult(event);
  }
}
