import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { TrainingService } from '../../shared/services/training.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { EventService } from '../../shared/services/event.service';
import { Observable, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { EventModel } from '../../shared/interfaces/event.type';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { JoyrideService } from 'ngx-joyride';

export interface UserStat {
  uid: string,
  trainingStatus: string,
  upToDateCnt: number,
  completedCnt: number,
  pastDueCnt: number
}

export interface TrainingStat {
  tid: string,
}

//am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  //  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent extends BaseComponent implements OnInit {

  userTypeIconHash = {
    individualContributor: 'fas fa-fw fa-user',
    supervisor: 'fas fa-fw fa-user-tie',
    volunteer: 'fas fa-fw fa-user-cowboy',
    customer: 'fas fa-fw fa-user-crown',
    candidate: 'fas fa-fw fa-user-graduate'
  }
  trainingStatusColorHash = {
    upToDate: '#52c41a',
    pastDue: 'red'
  }

  startTour$: Observable<string>;

  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  showNewUserModal = false;
  myTeamIdHash$: Observable<UserIdHash>;
  myTeamIdHash: UserIdHash;
  myTeam: UserModel[] = [];
  teamTrainingHash$: Observable<TrainingIdHash>;
  teamTrainingHash = {};
  trainings: TrainingModel[];
  upToDateCnt = 0;
  pastDueCnt = 0;
  completedCnt = 0;
  userStatHash = {};

  constructor(
    private auth: AuthService,
    private eventService: EventService,
    private userService: UserService,
    private trainingService: TrainingService,
    private userTrainingService: UserTrainingService,
    private joyrideService: JoyrideService,
    private router: Router
  ) {
    super();
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
    this.startTour$ = this.eventService.getStartTourStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.teamTrainingHash$ = this.trainingService.getTeamTrainingHashStream();
  }


  ngOnInit() {
    this.startTour$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(page => {
      if (page == 'home') {
        console.log('startTour', page);
        this.startTour();
      }
    });
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }

      this.authenticatedUser = user;
      if (this.authenticatedUser.userType !== 'supervisor') {
        this.userService.selectAuthenticatedUser();
      }
      if (this.authenticatedUser.userType === 'supervisor') {

        this.myTeamIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamIdHash => {
          if (!myTeamIdHash) {
            return;
          }
          this.myTeamIdHash = myTeamIdHash;

          this.myTeam = Object.values(this.myTeamIdHash);
          for (let index = 0; index < this.myTeam.length; index++) {
            if (this.myTeam[index]._id === this.authenticatedUser._id) {
              this.myTeam.splice(index, 1);
            } else {
              let userStatObj = <UserStat>{
                uid: this.myTeam[index]._id,
                trainingStatus: undefined,
                upToDateCnt: 0,
                pastDueCnt: 0,
                completedCnt: 0
              }
              this.userTrainingService.getUTForUser$(this.myTeam[index]._id).subscribe(utList => {
                for (let ut of utList) {
                  if (ut.status === 'upToDate') {
                    userStatObj.upToDateCnt++;
                  } else if (ut.status === 'completed') {
                    userStatObj.completedCnt++;
                  } else if (ut.status === 'pastDue') {
                    userStatObj.pastDueCnt++;
                  }
                }
                if (userStatObj.pastDueCnt > 1) {
                  userStatObj.trainingStatus = 'pastDue'
                }
                this.userStatHash[userStatObj.uid] = userStatObj;
              })
            }
          }
        });
      }
    });
    this.teamTrainingHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(teamTrainingHash => {
      this.teamTrainingHash = teamTrainingHash;
      this.trainings = Object.values(this.teamTrainingHash);
    })
  }

  selectUser(uid: string) {
    this.router.navigate(['/myteam/' + uid]);
  }

  startTour() {
    this.joyrideService.startTour(
      { steps: ['step1', 'step2'] } // Your steps order
    );
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  selectTraining(tid: string) {
    this.trainingService.selectTraining(tid);
    this.router.navigate(['/trainings/' + tid]);
  }

}
