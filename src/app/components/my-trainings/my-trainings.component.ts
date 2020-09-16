import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserTrainingModel } from '../../shared/interfaces/userTraining.type';
import { TrainingModel } from '../../shared/interfaces/training.type';
import { UserModel } from '../../shared/interfaces/user.type';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { UserService } from '../../shared/services/user.service';
import { TrainingService } from '../../shared/services/training.service';
import { Observable, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';



@Component({
  selector: 'app-my-trainings',
  templateUrl: './my-trainings.component.html',
  styleUrls: ['./my-trainings.component.css']
})
export class MyTrainingsComponent extends BaseComponent implements OnInit {

  myTrainings$: Observable<UserTrainingModel[]>;
  myTrainingsHash = {};
  userTrainings$: Observable<UserTrainingModel[]>;
  foo$: Observable<UserTrainingModel[]>;
  userTrainings: UserTrainingModel[];
  trainings$: Observable<TrainingModel[]>;
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;
  trainings: TrainingModel[] = [];
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  trainingIdHash = {};
  trainingIsVisible = false;
  rating: number;
  inputValue: string;
  trainingSessionTimer: number = 0;
  userObj: UserModel;

  /*
  @Input() type = 'authenticatedUser';
  @Input() mode = '';
*/
  @Input() useBanner = 'no';
  currentUserTraining = '';
  markCompletedModalIsVisible = false;

  constructor(private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private userService: UserService) {
    super();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
//    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
//    this.trainings$ = this.trainingService.getAllTrainingsObservable();
//    this.selectedUser$ = this.userService.getSelectedUserStream();
  }

  ngOnInit() {
    this.trainingService.selectTraining(null);
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        console.log('mt-training:authenticatedUser$.subscribe...null user');
        return;
      }



      this.userService.selectAuthenticatedUser();
    });
  }

}
