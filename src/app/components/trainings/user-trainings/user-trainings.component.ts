import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UserModel } from '../../../shared/interfaces/user.type';
import { TrainingModel } from '../../../shared/interfaces/training.type';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { UserTrainingService } from '../../../shared/services/userTraining.service';
import { UserTrainingModel } from 'src/app/shared/interfaces/userTraining.type';


@Component({
  selector: 'app-user-trainings',
  templateUrl: './user-trainings.component.html',
  styleUrls: ['./user-trainings.component.css']
})
export class UserTrainingsComponent implements OnInit {

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

  @Input() userId: string;

  userTrainings$: Observable<UserTrainingModel[]>;
  userTrainings: UserTrainingModel[];
  trainings$: Observable<TrainingModel[]>;
  trainings: TrainingModel[] = [];
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;

  currentUserTraining: string;
  markCompletedModalIsVisible: boolean;
  trainingIsVisible: boolean;
  trainingIdHash = {};
  trainingIndexHash = {};

  constructor(private userService: UserService, private userTrainingService: UserTrainingService, private trainingService: TrainingService) {
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
    this.selectedUser$ = this.userService.getSelectedUserStream();
  }

  ngOnInit() {
    this.trainings$.subscribe(trainingList => {

      for (let i = 0; i < trainingList.length; i++) {
        this.trainingIdHash[trainingList[i]._id] = trainingList[i];
        this.trainingIndexHash[trainingList[i]._id] = i;
      }
    })

    this.selectedUser$.subscribe(user => {
      this.userId = user._id;
      this.userTrainingService.loadTrainingsForUser(this.userId);
    });

    this.userTrainings$.subscribe(userTrainings => {
      this.userTrainings = userTrainings;
    })
  }

  viewTraining(utid, tid) {
    this.currentUserTraining = utid;
    this.trainingIsVisible = true;
    this.trainingService.selectItemForEditing(this.trainingIndexHash[tid], utid);
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
