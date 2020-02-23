import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserTrainingModel } from '../../../shared/interfaces/userTraining.type';
import { TrainingModel } from '../../../shared/interfaces/training.type';
import { UserModel } from '../../../shared/interfaces/user.type';
import { UserTrainingService } from '../../../shared/services/userTraining.service';
import { UserService } from '../../../shared/services/user.service';
import { TrainingService } from '../../../shared/services/training.service';
import { Observable, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';



@Component({
  selector: 'app-my-trainings',
  templateUrl: './my-trainings.component.html',
  styleUrls: ['./my-trainings.component.css']
})
export class MyTrainingsComponent implements OnInit {

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

  @Input() type = 'authenticatedUser';
  @Input() mode = '';
  @Input() useBanner = 'yes';

  currentUserTraining = '';
  markCompletedModalIsVisible = false;

  constructor(private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private userService: UserService) {
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
//    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
//    this.trainings$ = this.trainingService.getAllTrainingsObservable();
//    this.selectedUser$ = this.userService.getSelectedUserStream();
  }

  ngOnInit() {
    this.trainingService.selectTraining(null);
    this.authenticatedUser$.pipe(take(2)).subscribe(user => {
      if (!user) {
        console.log('mt-training:authenticatedUser$.subscribe...null user');
        return;
      }

      this.userService.selectAuthenticatedUser();
    });
/*
    this.selectedUser$.subscribe(data => {
      if (!data) {
        console.log('mt-training:selectedUser$.subscribe...null user');
        return;
      }
      this.userObj = data;
      this.userTrainingService.loadTrainingsForUser(this.userObj._id);
      console.log('myTrainings:selectedUser$.subscribe...', data);
    })
      this.authenticatedUser = user;
      if (this.type === 'authenticatedUser') {
        this.selectedUser = user;
        this.userTrainingService.loadTrainingsForUser(user._id);
        this.foo$ = this.userTrainings$.pipe(take(2), filter(uts => uts.length > 0 && uts[0].uid === this.authenticatedUser._id));
      } else if (this.type === 'team') {
        this.foo$ = this.userTrainings$.pipe(take(2), filter(uts => uts.length > 0 && uts[0].uid !== this.authenticatedUser._id));
      } else {
      }

      this.foo$.subscribe(list => {
        console.log('my-trainings...foo', list);
      })
    })


    /*
        this.selectedUser$.subscribe(user => {
          if (!user) {
            return;
          }
          if (this.type === 'team') {
            this.selectedUser = user;
            this.userTrainingService.loadTrainingsForUser(user._id);
          }
        });
        */
  }

}
