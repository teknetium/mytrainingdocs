import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserTrainingModel } from '../../../shared/interfaces/userTraining.type';
import { TrainingModel } from '../../../shared/interfaces/training.type';
import { UserModel } from '../../../shared/interfaces/user.type';
import { UserTrainingService } from '../../../shared/services/userTraining.service';
import { UserService } from '../../../shared/services/user.service';
import { TrainingService } from '../../../shared/services/training.service';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-my-trainings',
  templateUrl: './my-trainings.component.html',
  styleUrls: ['./my-trainings.component.css']
})
export class MyTrainingsComponent implements OnInit {

  userTrainings$: Observable<UserTrainingModel[]>;
  userTrainings: UserTrainingModel[];
  trainings$: Observable<TrainingModel[]>;
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;
  trainings: TrainingModel[] = [];
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  trainingIdHash = {};
  trainingIndexHash = {};
  trainingIsVisible = false;
  rating: number;
  inputValue: string;

  subscriptions: Subscription[] = [];

  @Input() mode = 'view';

  statusIconHash = {
    upToDate: {
      icon: 'smile',
      color: '#3f87f5',
      desc: 'Up To Date'
    },
    pastDue: {
      icon: 'close-circle',
      color: 'red',
      desc: 'Past Due'

    },
    completed: {
      icon: 'check-circle',
      color: 'blue',
      desc: 'Completed'
    }
  };


  currentUserTraining = '';
  markCompletedModalIsVisible = false;

  constructor(private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private userService: UserService) {
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
    this.selectedUser$ = this.userService.getSelectedUserStream();
  }

  ngOnInit() {
    this.userTrainings$.subscribe(list => {
      this.userTrainings = list;
      console.log('userTraining$', list);
    });

    this.trainings$.subscribe(list => {
      this.trainings = list;
      for (let i = 0; i < this.trainings.length; i++) {
        this.trainingIdHash[this.trainings[i]._id] = this.trainings[i];
        this.trainingIndexHash[this.trainings[i]._id] = i;
      }
    });

    this.selectedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.selectedUser = user;
      this.userTrainingService.loadTrainingsForUser(user._id);
    });

  }

  viewTraining(utid, tid) {

    this.trainingIsVisible = true;
    this.trainingService.selectItemForEditing(this.trainingIndexHash[tid], utid);
  }

  confirmDeleteUserTraining(index) {
    this.userTrainingService.deleteUserTraining(this.userTrainings[index]._id, this.userTrainings[index].uid)
  }

  handleMarkAsCompletedCancel() {
    this.markCompletedModalIsVisible = false;
  }

  markAsComplete(utid: string) {
    this.currentUserTraining = utid;
    this.markCompletedModalIsVisible = true;

  }

  markTrainingAsComplete() {
    this.markCompletedModalIsVisible = false;
    this.userTrainingService.markUserTrainingAsComplete(this.currentUserTraining);
  }

  processAssessmentResult(event: {tid: string, score: number, pass: boolean}) {
    this.userTrainingService.setAssessmentResult(this.selectedUser._id, event.tid, event.score, event.pass);
  }
}
