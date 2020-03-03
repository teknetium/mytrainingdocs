import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { TrainingService } from '../shared/services/training.service';
import { UserService } from '../shared/services/user.service';
import { UserTrainingService } from '../shared/services/userTraining.service';
import { BehaviorSubject, Observable, from, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../shared/interfaces/user.type';
import { TrainingModel, TrainingIdHash } from '../shared/interfaces/training.type';
import { Router } from '@angular/router';
import { FileModel } from '../shared/interfaces/file.type';
import { FileService } from '../shared/services/file.service';
// import { Auth0ProfileModel } from './shared/models/auth0Profile.model';
import { NotificationService } from '../shared/services/notification.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UserTrainingHash } from '../shared/interfaces/userTraining.type';
import { VgAPI } from 'videogular2/compiled/core';


@Component({
  selector: 'new-app-root',
  templateUrl: './new-app.component.html',
  styleUrls: ['./new-app.component.css'],
  animations: [
    trigger('yogaPoses', [
      state('open', style({
        opacity: 1,

      })),
      state('closed', style({
        opacity: 0
      })),
      state('paused', style({
        opacity: 1,
        height: '120px',
      })),
      transition('open => closed', [
        animate('750ms')
      ]),
      transition('closed => open', [
        animate('750ms')
      ]),
      transition('* => paused', [
        animate('750ms')
      ])
    ]),
    trigger('getHelp', [
      // ...
      state('closed', style({
        height: '0',
      })),
      state('open', style({
        height: '150px',
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('1s')
      ]),
    ]),
    trigger('viewHelpText', [
      // ...
      state('hidden', style({
        opacity: '.0',
        top: '5px',
        left: '200px'
      })),
      state('open', style({
        height: '200px',
        top: '40px',
        left: '-20px'
      })),
      transition('open => closed', [
        animate('.4s')
      ]),
      transition('closed => open', [
        animate('.4s')
      ]),
    ]),
  ]
})
export class NewAppComponent implements OnInit {

  vgApi: VgAPI;
  isCollapsed = false;
  triggerTemplate: TemplateRef<void> | null = null;

  localFiles: FileModel[];

  uploadedFile$: Observable<FileModel>;
  selectedFileToEdit$: Observable<FileModel>;
  docUrl$: Observable<SafeResourceUrl>;
  isConfirmDeleteModalVisible = false;
  editId: string | null;
  taskVideo$: Observable<SafeResourceUrl>;


  myTeamCnt = 0;
  trainingCnt = 0;

  userTypes = [
    {
      name: 'employee',
      iconClass: 'fa-fw fas fa-user',
    },
    {
      name: 'volunteer',
      iconClass: 'fa-fw far fa-user',
    },
    {
      name: 'customer',
      iconClass: 'fa-fw fas fa-user-tie',
    },
  ];
  userTypeHash: {} = {};

  fileIdToDelete: string;

  userTrainingHash$: Observable<UserTrainingHash>;
  myTrainingIdHash$: Observable<TrainingIdHash>;
  teamTrainingCnt$: Observable<number>;
  myTeamIdHash$: Observable<UserIdHash>;
  isAuthenticated$: Observable<boolean>;
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  myTrainingCnt = 0;
  teamTrainingCnt = 0;

  //  list = new Array<any>([]);
  isLoggedIn = false;

  //  image$: Observable<string>;
  //  imageBS$ = new BehaviorSubject<string>('');
  isIn = true;
  helpIsClosed = true;
  searchVisible: boolean = false;
  quickViewVisible: boolean = false;
  showTaskVideoModal = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private trainingService: TrainingService,
    private userTrainingService: UserTrainingService,
    private router: Router,
    private notificationService: NotificationService,
    private zorroNotificationService: NzNotificationService,
  ) {
    this.userTrainingHash$ = this.userTrainingService.getUserTrainingHashStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.teamTrainingCnt$ = this.trainingService.getTeamTrainingCntStream();
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.taskVideo$ = this.trainingService.getTaskVideoStream();
  }

  ngOnInit(): void {

    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.userTrainingService.loadTrainingsForUser(user._id);
      this.myTeamIdHash$.subscribe(teamIdHash => {
        if (!teamIdHash) {
          return;
        }
        let myTeamIds = Object.keys(teamIdHash);
        if (myTeamIds) {
          this.myTeamCnt = myTeamIds.length;
        }
      });
      this.teamTrainingCnt$.subscribe(cnt => {
        this.teamTrainingCnt = cnt;
      });
      this.userTrainingHash$.subscribe(utHash => {
        if (!utHash) {
          return;
        }
        let uts = Object.values(utHash);
        for (let ut of uts) {
          if (ut.uid === this.authenticatedUser._id) {
            this.myTrainingCnt = uts.length;
          }
        }
      })
    })

    this.taskVideo$.subscribe(safeUrl => {
      if (!safeUrl) {
        return;
      }
      this.showTaskVideoModal = true;
    })
  };

  closeTaskVideoModal() {
    this.showTaskVideoModal = false;
  }


  toString(file) {
    //    return JSON.stringify(file);
    return '';
  }

  toggleHelp() {
    this.helpIsClosed = !this.helpIsClosed;
  }

  onPlayerReady(api: VgAPI) {
    this.vgApi = api;
    /*
        this.vgApi.getDefaultMedia().subscriptions.loadedMetadata.subscribe(
          this.playVideo.bind(this)
        );
        */
  }

  playVideo() {
    this.vgApi.play();
  }

  handleCancel(): void {
    this.isConfirmDeleteModalVisible = false;
  }

  signup() {
    this.authService.signup();
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
  searchToggle(): void {
    this.searchVisible = !this.searchVisible;
  }

  quickViewToggle(): void {
    this.quickViewVisible = !this.quickViewVisible;
  }

}
