import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { TrainingService } from '../../shared/services/training.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { EventService } from '../../shared/services/event.service';
import { Observable, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { UidUTHash, UTSession } from '../../shared/interfaces/userTraining.type';
import { EventModel } from '../../shared/interfaces/event.type';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { TaskModel, TaskHash, TaskStepContentHash } from '../../shared/interfaces/task.type';

export interface UserStat {
  uid: string,
  trainingStatus: string,
  upToDateCnt: number,
  completedCnt: number,
  pastDueCnt: number,
  trainingIdList: string[],
  tidUTHash: {}
}

export interface TrainingStat {
  tid: string,
}

//am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'],
//  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactUsComponent extends BaseComponent implements OnInit {
  uidUTHash$: Observable<UidUTHash>;
  uidUTHash = {};
  sessionLog$: Observable<UTSession[]>;
  sessionLog: UTSession[];
  filteredSessionLog: UTSession[];

  userTypeIconHash = {
    individualContributor: 'fad fa-fw fa-user',
    supervisor: 'fad fa-fw fa-user-tie',
    volunteer: 'fad fa-fw fa-user-cowboy',
    customer: 'fad fa-fw fa-user-crown',
    contractor: 'fad fa-fw fa-user-clock',
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
  myOrgUsers$: Observable<UserModel[]>;
  myOrgUsers: UserModel[] = [];
  teamTrainingHash = {};
  trainings: TrainingModel[];
  upToDateCnt = 0;
  pastDueCnt = 0;
  completedCnt = 0;
  userStatHash = {};
  dateRange = [];
  startRangeTimeMS;
  endRangeTimeMS;
  now;
  trainingStatusColor: string;
  utStatusColorHash = {
    upToDate: 'green',
    pastDue: '#fee5e0',
    completed: '#8df8fe'
  }
  userCardTitle = 'My Team';
  homePageWidth = 100;
  tasks$: Observable<string[]>
  taskHash$: Observable<TaskHash>;
  taskStepContentHash$: Observable<TaskStepContentHash>;
  tasks: string[];
  taskHash: TaskHash;
  taskStepContentHash: TaskStepContentHash;




  constructor(
    private auth: AuthService,
    private eventService: EventService,
    private userService: UserService,
    private trainingService: TrainingService,
    private userTrainingService: UserTrainingService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
    super();
    this.myOrgUsers$ = this.userService.getMyOrgUsersStream();
    this.sessionLog$ = this.userTrainingService.getSessionLogStream();
    this.uidUTHash$ = this.userTrainingService.getUidUTHashStream();
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
//    this.startTour$ = this.eventService.getStartTourStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.teamTrainingHash$ = this.trainingService.getTeamTrainingHashStream();
  }


  ngOnInit() {
    this.now = new Date().getTime();
    this.startRangeTimeMS = this.now - 604800000;
    this.endRangeTimeMS = this.now + 3600000;
    this.dateRange = [new Date(this.startRangeTimeMS), new Date(this.endRangeTimeMS) ]
    
/*
    this.startTour$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(page => {
      if (page == 'home') {
        console.log('startTour', page);
        this.startTour();
      }
    });
    */

    this.uidUTHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidUTHash => {
      if (!uidUTHash) {
        return;
      }

      let now = new Date().getTime();
      this.uidUTHash = uidUTHash;
      let uidList = Object.keys(this.uidUTHash);
      if (uidList && uidList.length > 0) {
        for (let uid in uidList) {
          if (this.uidUTHash[uid] && this.uidUTHash[uid].length > 0) {
            for (let ut of this.uidUTHash[uid]) {
              if (ut.dueDate < now) {
                this.userService.setUserStatusPastDue(ut.uid);
                break;
              }
            }
            if (this.uidUTHash[uid].status === 'pastDue') {
              this.userService.setUserStatusPastDue(uid);
            }
          }
        }
      }
    });

    this.sessionLog$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(sessionLog => {
      if (!sessionLog) {
        return;
      }
      this.sessionLog = sessionLog;
    });
    this.myOrgUsers$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(users => {
      if (!users) {
        return;
      }
      this.myOrgUsers = users;
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
        this.userTrainingService.getUTForTeam(this.authenticatedUser._id);
        this.userTrainingService.getUTSessionsForTeam(this.authenticatedUser._id);
      }
    });
    this.taskHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(taskHash => {
      if (!taskHash) {
        return;
      }

      this.taskHash = taskHash;
    });

    this.taskStepContentHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(taskStepContentHash => {
      if (!taskStepContentHash) {
        return;
      }

      this.taskStepContentHash = taskStepContentHash;
      console.log("taskStepContentHash", this.taskStepContentHash);
    });
    this.teamTrainingHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(teamTrainingHash => {
      if (!teamTrainingHash) {
        return;
      }
      this.teamTrainingHash = teamTrainingHash;
      this.trainings = Object.values(this.teamTrainingHash);
    });
    this.myTeamIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamIdHash => {
      if (!myTeamIdHash) {
        return;
      }
      this.myTeamIdHash = myTeamIdHash;
      this.onDateRangeChange(this.dateRange);

      this.myTeam = Object.values(this.myTeamIdHash);
      for (let index = 0; index < this.myTeam.length; index++) {
        if (this.myTeam[index]._id === this.authenticatedUser._id) {
          this.myTeam.splice(index, 1);
        }
      }
    });
          /*
          } else {
          let userStatObj = <UserStat>{
            uid: this.myTeam[index]._id,
            trainingStatus: undefined,
            upToDateCnt: 0,
            pastDueCnt: 0,
            completedCnt: 0,
            trainingIdList: [],
            tidUTHash: {}
          }
                  this.userTrainingService.getUTForUser$(this.myTeam[index]._id).subscribe(utList => {
            for (let ut of utList) {
              userStatObj.trainingIdList.push(ut.tid);
              userStatObj.tidUTHash[ut.tid] = ut;
              if (ut.status === 'pastDue') {
                this.myTeamIdHash[ut.uid].trainingStatus = 'pastDue';
                this.userService.updateUser(this.myTeamIdHash[ut.uid], true);
                userStatObj.trainingStatus = 'pastDue';
              }
            }
            this.userStatHash[userStatObj.uid] = userStatObj;
          })
          */
  }

  selectUser(uid: string) {
    this.router.navigate(['/myteam/' + uid]);
//    this.userService.selectUser(uid);
  }

  onDateRangeChange(dateRange) {
    if (!this.sessionLog) {
      return;
    }
    this.filteredSessionLog = new Array(0);
    this.startRangeTimeMS = dateRange[0].getTime();
    this.endRangeTimeMS = dateRange[1].getTime();
    for (let session of this.sessionLog) {
      if (session.startTime >= this.startRangeTimeMS && session.startTime <= this.endRangeTimeMS) {
        this.filteredSessionLog.push(session);
      } 
    }
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  timeFormat(ms): string {
    let m = String(Math.floor(ms / 60000)).padStart(2, '0');
    let s = String(Math.floor(((ms % 3600000) % 60000) / 1000)).padStart(2, '0');
    return m + ':' + s;
  }

  startTour(task: string) {
    console.log("startTour", task);
  }

  selectTraining(tid: string) {
    this.trainingService.selectTraining(tid);
    this.router.navigate(['/trainings/' + tid]);
  }

}
