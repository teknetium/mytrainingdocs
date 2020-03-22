import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UserModel } from '../../../shared/interfaces/user.type';
import { TrainingModel, TrainingIdHash } from '../../../shared/interfaces/training.type';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { UserTrainingService } from '../../../shared/services/userTraining.service';
import { UserTrainingModel, UserTrainingHash } from 'src/app/shared/interfaces/userTraining.type';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../../base.component';


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

  userTrainingHash$: Observable<UserTrainingHash>;
  userTrainings: UserTrainingModel[];
  trainingIdHash$: Observable<TrainingIdHash>;
  trainingIdHash: TrainingIdHash;
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;
  selectedTraining$: Observable<TrainingModel>;

  @Input() mode = '';
  @Input() logSession = 'off';

  currentUserTraining: string;
  markCompletedModalIsVisible: boolean;
  trainingIsVisible: boolean;
  comment = '';
  rating = 0;


  constructor(
    private userService: UserService,
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.userTrainingHash$ = this.userTrainingService.getUserTrainingHashStream();
    this.trainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
  }

  ngOnInit() {
    this.selectedTraining$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedTraining => {
      if (!selectedTraining) {
        this.currentUserTraining = '';
      }
    })
    this.trainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(trainingIdHash => {
      if (!trainingIdHash) {
        return;
      }

      this.trainingIdHash = trainingIdHash;
    })

    this.selectedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      this.selectedUser = user;
      this.userTrainingService.loadTrainingsForUser(user._id);
    });

    this.userTrainingHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainingHash => {
      if (!userTrainingHash) {
        return;
      }
      console.log('userTrainingHash$.subscribe', userTrainingHash);
      this.userTrainings = Object.values(userTrainingHash);
      this.cd.detectChanges();
    })
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
    this.currentUserTraining = utid;
    this.trainingIsVisible = true;
    this.trainingService.selectTraining(tid);
  }

  confirmDeleteUserTraining(ut) {
    this.userTrainingService.deleteUserTraining(ut._id, ut.uid)
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

  markTrainingAsComplete() {
    this.markCompletedModalIsVisible = false;
    this.userTrainingService.markUserTrainingAsComplete(this.currentUserTraining);
  }

  processAssessmentResult(event: { tid: string, score: number, pass: boolean }) {
    this.userTrainingService.setAssessmentResult(this.selectedUser._id, event.tid, event.score, event.pass);
  }

}
