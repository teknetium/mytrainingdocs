import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { FileService } from '../../shared/services/file.service';
import { TrainingService } from '../../shared/services/training.service';
import { JobService } from '../../shared/services/job.service';
import { Observable } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.model';


@Component({
  selector: 'app-gettingstarted',
  templateUrl: './gettingstarted.component.html',
  styleUrls: ['./gettingstarted.component.css']
})
export class GettingstartedComponent implements OnInit {


  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  userCnt$: Observable<number>;
  fileCnt$: Observable<number>;
  trainingCnt$: Observable<number>;
  jobCnt$: Observable<number>;
  currentTemplate = '';
  showMainIntro = true;

  constructor(private auth: AuthService,
    private userService: UserService,
    private fileService: FileService,
    private trainingService: TrainingService,
    private jobServices: JobService) {

    this.jobCnt$ = this.jobServices.getJobCntStream();
    this.fileCnt$ = this.fileService.getFileCntStream();
    this.trainingCnt$ = this.trainingService.getAllTrainingCntObservable();
    this.userCnt$ = this.userService.getMyTeamCntStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
  }

  ngOnInit() {
    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
    })
  }

  activateStep(event, stepNum) {
    if (stepNum === 1) {
//      this.fileService.selectItem(-1);
    }
  }

}
