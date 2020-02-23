import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UserModel } from '../../../shared/interfaces/user.type';
import { TrainingModel, TrainingIdHash } from '../../../shared/interfaces/training.type';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { UserTrainingService } from '../../../shared/services/userTraining.service';
import { UserTrainingModel, UserTrainingHash } from 'src/app/shared/interfaces/userTraining.type';


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

  userTrainingHash$: Observable<UserTrainingHash>;
  userTrainings: UserTrainingModel[];
  trainingIdHash$: Observable<TrainingIdHash>;
  trainingIdHash: TrainingIdHash;
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;

  currentUserTraining: string;
  markCompletedModalIsVisible: boolean;
  trainingIsVisible: boolean;

  constructor(private userService: UserService, private userTrainingService: UserTrainingService, private trainingService: TrainingService) {
    this.userTrainingHash$ = this.userTrainingService.getUserTrainingHashStream();
    this.trainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
  }

  ngOnInit() {
    this.trainingIdHash$.subscribe(trainingIdHash => {
      if (!trainingIdHash) {
        return;
      }

      this.trainingIdHash = trainingIdHash;
    })

    this.selectedUser$.subscribe(user => {
      if (!user) {
        return;        
      }
      this.userTrainingService.loadTrainingsForUser(user._id);
    });

    this.userTrainingHash$.subscribe(userTrainingHash => {
      if (!userTrainingHash) {
        return;
      }
      this.userTrainings = Object.values(userTrainingHash);
    })
  }

  viewTraining(utid, tid) {
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
