import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { TrainingService } from '../../shared/services/training.service';
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
    uptodate: '#52c41a',
    pastdue: 'red'
  }

  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  showNewUserModal = false;
  myTeamIdHash$: Observable<UserIdHash>;
  myTeamIdHash: UserIdHash;
  myTeam: UserModel[] = [];
  teamTrainingHash$: Observable<TrainingIdHash>;
  teamTrainingHash = {};
  trainings: TrainingModel[];

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private trainingService: TrainingService,
    private joyrideService: JoyrideService,
    private router: Router
  ) {
    super();
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.teamTrainingHash$ = this.trainingService.getTeamTrainingHashStream();
  }


  ngOnInit() {
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
      { steps: ['firstStep', 'secondStep'] } // Your steps order
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
