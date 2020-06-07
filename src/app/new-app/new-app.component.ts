import { Component, OnInit, HostListener, TemplateRef } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { TrainingService } from '../shared/services/training.service';
import { UserService } from '../shared/services/user.service';
import { UserTrainingService } from '../shared/services/userTraining.service';
import { BehaviorSubject, Observable, from, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../shared/interfaces/user.type';
import { TrainingModel, TrainingIdHash } from '../shared/interfaces/training.type';
import { UserTrainingModel } from '../shared/interfaces/userTraining.type';
import { Router, NavigationEnd } from '@angular/router';
import { FileModel } from '../shared/interfaces/file.type';
import { FileService } from '../shared/services/file.service';
import { NotificationService } from '../shared/services/notification.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UidUserTrainingHash } from '../shared/interfaces/userTraining.type';
import { VgAPI } from 'videogular2/compiled/core';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../components/base.component';
import { JoyrideService } from 'ngx-joyride';


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
        'top': '-100%'
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

export class NewAppComponent extends BaseComponent implements OnInit {
  browserInnerHeight;
  browserInnerWidth;
  contentHeight;
  contentWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    this.contentHeight = Math.floor(window.innerHeight  * .9);
    this.contentWidth = Math.floor(window.innerWidth * .9);
  }
  aboutThisPageHash = {
    home: {
      title: 'Home',
      visible: true,
      intro: 'Introduction to the page.',
      tourSteps: {
        steps: [
          'step1', 'step2', 'step3'
        ]
      },
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
      title: 'My Trainings',
      visible: true,
      intro: 'Introduction to the page.',
      tourSteps: {
        steps: [
          'step1', 'step2', 'step3'
        ]
      },
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
      title: 'My Team',
      visible: true,
      intro: 'Introduction to the page.',
      tourSteps: {
        steps: [
          'step1', 'step2', 'step3'
        ]
      },
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
      title: 'Trainings',
      visible: true,
      intro: 'Introduction to the page.',
      tourSteps: [
        {
          steps: ['step1', 'step2', 'step3']
        },
        {
          viewerSteps: ['viewerStep1', 'viewerStep2', 'viewerStep3']
        }
      ],
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

  //  uidUserTrainingHash$: Observable<UidUserTrainingHash>;
  userTrainings$: Observable<UserTrainingModel[]>;
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
  pageNames = [];
  isVideoOpen = false;
  bannerColor = '#f1f1f1';
  pageTaskHash = {};

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private trainingService: TrainingService,
    private userTrainingService: UserTrainingService,
    private router: Router,
    private joyrideService: JoyrideService,
    private notificationService: NotificationService,
    private zorroNotificationService: NzNotificationService,
    private sanitizer: DomSanitizer
  ) {
    super();
    //    this.uidUserTrainingHash$ = this.userTrainingService.getUidUserTrainingHashStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    this.teamTrainingCnt$ = this.trainingService.getTeamTrainingCntStream();
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
  }

  ngOnInit(): void {
    this.pageNames = Object.keys(this.aboutThisPageHash);
    for (let page of this.pageNames) {
      this.pageTaskHash[page] = Object.keys(this.aboutThisPageHash[page].taskHash);
    }
    this.taskNames = Object.keys(this.aboutThisPageHash[this.currentPage].taskHash);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentPage = event.url.substring(1);
      console.log('Route', this.currentPage, event.url);
      if (this.currentPage.indexOf('/') > -1) {

      }
      if (this.aboutThisPageHash[this.currentPage]) {
        this.taskNames = Object.keys(this.aboutThisPageHash[this.currentPage].taskHash);
      }
    });
    /*
        this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
          if (!userTrainings) {
            return;
          }
          this.myTrainingCnt = userTrainings.length;
        });
    */
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      this.userService.selectUser(user._id);

      this.authenticatedUser = user;
      if (this.authenticatedUser.firstName === '') {
        this.firstTimer = true;
        this.showNewUserModal = true;
        //        this.playTaskVideo('gettingStarted');
      }
      this.authenticatedUser = user;
      this.userTrainingService.initUserTrainingsForUser(user._id);
      this.myTeamIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(teamIdHash => {
        if (!teamIdHash) {
          return;
        }
        let myTeamIds = Object.keys(teamIdHash);
        if (myTeamIds) {
          // Subtract 1 for the supervisor
          this.myTeamCnt = myTeamIds.length - 1;
        }
      });
      this.teamTrainingCnt$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cnt => {
        this.teamTrainingCnt = cnt;
      });
      /*
      this.uidUserTrainingHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidUserTrainingHash => {
        if (uidUserTrainingHash[this.authenticatedUser._id]) {
          let uts = Object.values(uidUserTrainingHash[this.authenticatedUser._id]);
          this.myTrainingCnt = uts.length;
        }
      })
      */
    })


    this.taskBS$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(task => {
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

  startTour() {
    let toursteps = this.aboutThisPageHash[this.currentPage].tourSteps;
    this.joyrideService.startTour(toursteps);
  }

  playTaskVideo(taskName) {
    if (!taskName) {
      taskName = this.taskNames[0];
    }
    this.currentTask = taskName;
    this.isVideoOpen = true;
    this.task = this.aboutThisPageHash[this.currentPage].taskHash[taskName];
    if (!this.task) {
      return;
    }
    this.task.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.aboutThisPageHash[this.currentPage].taskHash[taskName].url));
    this.taskBS$.next(this.task);
  }
}