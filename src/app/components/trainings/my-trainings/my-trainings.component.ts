import { Component, OnInit } from '@angular/core';
import { UserTrainingModel } from '../../../shared/interfaces/userTraining.type';
import { TrainingModel } from '../../../shared/interfaces/training.type';
import { UserModel } from '../../../shared/interfaces/user.model';
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
  trainings: TrainingModel[] = [];
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  trainingIdHash = {};
  trainingIndexHash = {};
  trainingIsVisible = false;

  subscriptions: Subscription[] = [];

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

  sub1: Subscription;
  sub2: Subscription;
  sub3: Subscription;

  constructor(private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private userService: UserService) {
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
  }

  ngOnInit() {
    this.sub1 = this.userTrainings$.subscribe(list => {
      this.userTrainings = list;
    });

    this.sub2 = this.trainings$.subscribe(list => {
      this.trainings = list;
      for (let i = 0; i < this.trainings.length; i++) {
        this.trainingIdHash[this.trainings[i]._id] = this.trainings[i];
        this.trainingIndexHash[this.trainings[i]._id] = i;
      }
    });

    this.sub3 = this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.userTrainingService.loadTrainingsForUser(this.authenticatedUser._id);
    });

  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
  }

  viewTraining(tid) {
    this.trainingIsVisible = true;
    this.trainingService.selectItemForEditing(this.trainingIndexHash[tid]);
  }

}
