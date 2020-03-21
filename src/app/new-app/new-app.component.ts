import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { TrainingService } from '../shared/services/training.service';
import { UserService } from '../shared/services/user.service';
import { UserTrainingService } from '../shared/services/userTraining.service';
import { BehaviorSubject, Observable, from, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../shared/interfaces/user.type';
import { TrainingModel, TrainingIdHash } from '../shared/interfaces/training.type';
import { Router, NavigationEnd } from '@angular/router';
import { FileModel } from '../shared/interfaces/file.type';
import { FileService } from '../shared/services/file.service';
// import { Auth0ProfileModel } from './shared/models/auth0Profile.model';
import { NotificationService } from '../shared/services/notification.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UserTrainingHash } from '../shared/interfaces/userTraining.type';
import { VgAPI } from 'videogular2/compiled/core';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface Task {
  desc: string,
  url: string,
  safeUrl: SafeResourceUrl,
  mimeType: string,
  poster: string
}

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
    trigger('showInfo', [
      // ...
      state('closed', style({
        'height': '-100px'
      })),
      state('open', style({
        'height': 'fit-content'
      })),
      transition('open => closed', [
        animate('500ms')
      ]),
      transition('closed => open', [
        animate('500ms')
      ]),
    ]),
    trigger('showVideo', [
      // ...
      state('closed', style({
        'top': '-800px'
      })),
      state('open', style({
        'top': '0'
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
  ]
})
export class NewAppComponent implements OnInit {

  aboutThisPageHash = {
    home: {
      visible: true,
      intro: 'Introduction to the page.',
      taskHash: {
        gettingStartedSupervisor: {
          userType: ['supervisor'],
          desc: 'Getting Started',
          url: 'https://www.youtube.com/watch?v=N_DktBxPDow&t=2s',
          mimeType: 'video/mpeg',
          poster: './assets/images/logo/logo.png'
        },
        executeTraining: {
          userType: ['supervisor', 'individualContributor'],
          desc: 'Take Your Training',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        },
        addTeamMember: {
          userType: ['supervisor'],
          desc: 'Add a New Team Member',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        },
        manageUserTrainings: {
          userType: ['supervisor'],
          desc: 'Add / Remove Trainings from Team Members',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        },
        manageTrainings: {
          userType: ['supervisor'],
          desc: 'Create/Edit Trainings',
          url: 'https://cdn.filestackcontent.com/oNn7wEGNS1Kxj7c1Mgpf',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        },
        assignToUsers: {
          userType: ['supervisor'],
          desc: 'Assign Trainings to Team Members',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        }
      },
    },
    mytrainings: {
      visible: true,
      intro: 'Introduction to the page.',
      taskHash: {
        executeTraining: {
          userType: ['supervisor', 'individualContributor'],
          desc: 'Execute Your Trainings',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        }
      },
    },
    myteam: {
      visible: true,
      intro: 'Introduction to the page.',
      taskHash: {
        addTeamMember: {
          userType: ['supervisor'],
          desc: 'Add a New Team Member',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        },
        manageUserTrainings: {
          userType: ['supervisor'],
          desc: 'Add / Remove Trainings from Team Members',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        }
      },
    },
    trainings: {
      visible: true,
      intro: 'Introduction to the page.',
      taskHash: {
        manageTrainings: {
          userType: ['supervisor'],
          desc: 'Create/Edit Trainings',
          url: 'https://cdn.filestackcontent.com/oNn7wEGNS1Kxj7c1Mgpf',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        },
        usingAssessments: {
          userType: ['supervisor'],
          desc: 'How to Create and Use Assessments',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        },
        assignToUsers: {
          userType: ['supervisor'],
          desc: 'Assign Trainings to Team Members',
          url: 'https://cdn.filestackcontent.com/GKJeAoaORBOPvf0CBkDd',
          mimeType: 'video/quicktime',
          poster: './assets/images/logo/logo.png'
        }
      }
    }
  }


  vgApi: VgAPI;
  isCollapsed = false;
  triggerTemplate: TemplateRef<void> | null = null;

  localFiles: FileModel[];

  uploadedFile$: Observable<FileModel>;
  selectedFileToEdit$: Observable<FileModel>;
  docUrl$: Observable<SafeResourceUrl>;
  isConfirmDeleteModalVisible = false;
  editId: string | null;
  taskVideo$ = new BehaviorSubject<SafeResourceUrl>(null);
  taskBS$ = new BehaviorSubject<Task>(null);
  task: Task = null;


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
  currentPage = 'home';
  isPageInfoOpen = true;
  showNewUserModal = false;
  firstTimer = false;
  currentTask = 1;
  taskNames = [];
  isVideoOpen = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private trainingService: TrainingService,
    private userTrainingService: UserTrainingService,
    private router: Router,
    private notificationService: NotificationService,
    private zorroNotificationService: NzNotificationService,
    private sanitizer: DomSanitizer
  ) {
    this.userTrainingHash$ = this.userTrainingService.getUserTrainingHashStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.teamTrainingCnt$ = this.trainingService.getTeamTrainingCntStream();
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
  }

  ngOnInit(): void {
    this.taskNames = Object.keys(this.aboutThisPageHash[this.currentPage].taskHash);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentPage = event.url.substring(1);
      if (this.aboutThisPageHash[this.currentPage]) {
        this.taskNames = Object.keys(this.aboutThisPageHash[this.currentPage].taskHash);
      }
    });
    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }

      this.authenticatedUser = user;
      if (this.authenticatedUser.firstName === '') {
        this.firstTimer = true;
        this.showNewUserModal = true;
//        this.playTaskVideo('gettingStarted');
      }
      this.authenticatedUser = user;
      this.userTrainingService.loadTrainingsForUser(user._id);
      this.myTeamIdHash$.subscribe(teamIdHash => {
        if (!teamIdHash) {
          return;
        }
        let myTeamIds = Object.keys(teamIdHash);
        if (myTeamIds) {
          // Subtract 1 for the supervisor
          this.myTeamCnt = myTeamIds.length - 1;
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


    this.taskBS$.subscribe(task => {
      if (!task) {
        return;
      }
      
      this.showTaskVideoModal = true;
    })
  };

  closeTaskVideoModal() {
    this.showTaskVideoModal = false;
    if (this.firstTimer) {
      this.showNewUserModal = true;
    }
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

  saveName() {
    console.log('saveName', this.authenticatedUser);
    this.userService.updateUser(this.authenticatedUser, true);
    this.showNewUserModal = false;
  }

  playTaskVideo(taskName) {
    this.currentTask = taskName;
    this.isVideoOpen = true;
    console.log('new-app: playTaskVideo', taskName, this.currentPage, this.aboutThisPageHash);
    this.task = this.aboutThisPageHash[this.currentPage].taskHash[taskName];
    if (!this.task) {
      return;
    }
    this.task.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.aboutThisPageHash[this.currentPage].taskHash[taskName].url));
    console.log('playTaskVideo', this.task);
    this.taskBS$.next(this.task);
  }
}