import { Component, OnInit, HostListener, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { TrainingService } from '../shared/services/training.service';
import { OrgService } from '../shared/services/org.service';
import { OrgModel } from '../shared/interfaces/org.type';
import { UserService } from '../shared/services/user.service';
import { UserTrainingService } from '../shared/services/userTraining.service';
import { BehaviorSubject, Observable, from, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../shared/interfaces/user.type';
import { AlertModel } from '../shared/interfaces/notification.type';
import { TrainingModel, TrainingIdHash } from '../shared/interfaces/training.type';
import { UserTrainingModel } from '../shared/interfaces/userTraining.type';
import { Router, NavigationEnd, NavigationCancel, NavigationStart, NavigationError, Event as NavigationEvent } from '@angular/router';
import { FileModel } from '../shared/interfaces/file.type';
import { EventService } from '../shared/services/event.service';
import { NotificationService } from '../shared/services/notification.service';
import { TaskWizardService } from '../shared/services/taskWizard.service';
import { TaskModel, TaskHash, TaskStepContentHash } from '../shared/interfaces/task.type';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UidUserTrainingHash } from '../shared/interfaces/userTraining.type';
import { VgAPI } from 'videogular2/compiled/core';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../components/base.component';
import { JoyrideService } from 'ngx-joyride';
import { HttpErrorResponse } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';

/*
export interface Task {
  desc: string,
  url: string,
  safeUrl: SafeResourceUrl,
  mimeType: string,
  poster: string
}
*/

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
  @ViewChild('audioOption') audioPlayerRef: ElementRef;

  onAudioPlay() {
    this.audioPlayerRef.nativeElement.play();
  }

  browserInnerHeight;
  browserInnerWidth;
  contentHeight;
  contentWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    this.contentHeight = Math.floor(window.innerHeight * .9);
    this.contentWidth = Math.floor(window.innerWidth * .9);
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
//  taskBS$ = new BehaviorSubject<Task>(null);
//  task: Task = null;


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

  myDomainUser$: Observable<UserModel[]>;
  httpErrors$: Observable<HttpErrorResponse>;
  userTrainings$: Observable<UserTrainingModel[]>;
  myTrainingIdHash$: Observable<TrainingIdHash>;
  allTrainingIdHash$: Observable<TrainingIdHash>;
  allTrainingIdHash: TrainingIdHash = {};
  teamTrainingCnt$: Observable<number>;
  myTeamIdHash$: Observable<UserIdHash>;
  isAuthenticated$: Observable<boolean>;
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  myTrainingCnt = 0;
  allTrainingCnt = 0;

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
  userPanelVisible = false;
  lName;
  fName;
  httpErrors = [];
  currentHttpError;
  emailUnique = true;
  currentEmail;
  currentStep = 0;
  loading = true;
  newLoading: boolean;
  dropDownAlerts: AlertModel[] = [];
  alerts: AlertModel[] = [
    /*
    {
      type: 'error',
      message: 'sample error message'
    },
    {
      type: 'info',
      message: 'sample INFO message'
    },
    {
      type: 'warning',
      message: 'sample WARNING messagesample WARNING messagesample WARNING messagesample WARNING messagesample WARNING messagesample WARNING message'
    },
    {
      type: 'success',
      message: 'sample error message'
    }
    */
  ];
  alert$: Observable<AlertModel>;
  icon = {
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-circle',
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle'
  }
  iconColor = {
    info: '#4891f7',
    warning: '#edaf41',
    success: '#75c040',
    error: '#de3c39'
  }
  border = {
    info: '1px solid #4891f7',
    warning: '1px solid #edaf41',
    success: '1px solid #75c040',
    error: '1px solid #de3c39'
  }
  bgColor = {
    info: '#e9f6fe',
    warning: '#fefbe8',
    success: '#f8ffee',
    error: '#fdf1f0'
  }
  messageLabel = {
    info: "INFO - ",
    warning: "WARNING - ",
    error: "ERROR - ",
    success: "SUCCESS - ",
  }

  tasks$: Observable<string[]>;
  taskHash$: Observable<TaskHash>;
  taskStepContentHash$: Observable<TaskStepContentHash>;
  tasks: string[];
  taskHash: TaskHash;
  taskStepContentHash: TaskStepContentHash;
  taskWizardHash = {};
//  newLoading$: Observable<boolean>;
  org$: Observable<OrgModel>;
  orgObj: OrgModel;
  myPlan = 'basic';
  planHash = {
    basic: 'Basic',
    pro: 'Pro',
    expert: 'Expert'
  }
  myOrgUsers = [];
  myOrgUsers$: Observable<UserModel[]>;
  listOfSelectedUsers = [];
  listOfUsers = [];
  userNameHash = {};
  planNameHash = {
    basic: 'Basic',
    pro: 'Pro',
    expert: 'Expert'
  }


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private orgService: OrgService,
    private trainingService: TrainingService,
    private userTrainingService: UserTrainingService,
    private router: Router,
    private joyrideService: JoyrideService,
    private taskWizardService: TaskWizardService,
    private eventService: EventService,
    private messageService: NzMessageService,
    private notificationService: NotificationService,
    private zorroNotificationService: NzNotificationService,
    private sanitizer: DomSanitizer
  ) {
    super();
    this.router.events.subscribe((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        console.log('nav start');
        this.loading = true;
      } else if (event instanceof NavigationEnd) {
        this.loading = false;
      } else if (event instanceof NavigationCancel) {
        this.loading = false;
      } else if (event instanceof NavigationError) {
        this.loading = false;
      }

      /*
      this.currentPage = event.url.substring(1);
      console.log('Route', this.currentPage, event.url);
      if (this.currentPage.indexOf('/') > -1) {
      }
      if (this.aboutThisPageHash[this.currentPage]) {
        this.taskNames = Object.keys(this.aboutThisPageHash[this.currentPage].taskHash);
      }
      */

    });
    this.httpErrors$ = this.userService.getHttpErrorStream();
    //    this.uidUserTrainingHash$ = this.userTrainingService.getUidUserTrainingHashStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    this.teamTrainingCnt$ = this.trainingService.getTeamTrainingCntStream();
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.myDomainUser$ = this.userService.getMyDomainUsersStream();
    this.allTrainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.alert$ = this.notificationService.getAlertStream();
    this.tasks$ = this.taskWizardService.getTasksStream();
    this.taskHash$ = this.taskWizardService.getTaskHashStream();
    this.taskStepContentHash$ = this.taskWizardService.getTaskStepContentHashStream();
    this.org$ = this.orgService.getOrgStream();
    this.myOrgUsers$ = this.userService.getMyOrgUsersStream();
  }

  ngOnInit(): void {
/*
    this.pageNames = Object.keys(this.aboutThisPageHash);
    for (let page of this.pageNames) {
      this.taskHash[page] = Object.keys(this.aboutThisPageHash[page].taskHash);
    }
    this.taskNames = Object.keys(this.aboutThisPageHash[this.currentPage].taskHash);
    */

    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentPage = event.url.substring(1);
      console.log('Route', this.currentPage, event.url);
    });

    /*
        this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
          if (!userTrainings) {
            return;
          }
          this.myTrainingCnt = userTrainings.length;
        });
    */
    /*
    this.allTrainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(allTrainingIdHash => {
      if (!allTrainingIdHash) {
        this.allTrainingCnt = 0;
        return;
      }
      this.allTrainingIdHash = allTrainingIdHash;
      this.allTrainingCnt = Object.keys(this.allTrainingIdHash).length;
    });
    */
    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      //      this.userService.selectUser(user._id);

      this.authenticatedUser = user;
      this.currentEmail = this.authenticatedUser.email;
      if (this.authenticatedUser.firstName === '') {
        this.firstTimer = true;
        this.showNewUserModal = true;
        //        this.playTaskVideo('gettingStarted');
      }
      this.authenticatedUser = user;
      this.listOfSelectedUsers.push(this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName);
      //      this.userTrainingService.initUserTrainingsForUser(user._id);
      //      this.teamTrainingCnt$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cnt => {
      //        this.teamTrainingCnt = cnt;
      //      });
      /*
      this.uidUserTrainingHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidUserTrainingHash => {
        if (uidUserTrainingHash[this.authenticatedUser._id]) {
          let uts = Object.values(uidUserTrainingHash[this.authenticatedUser._id]);
          this.myTrainingCnt = uts.length;
        }
      })
      */
    })

    /*
    this.tasks$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tasks => {
      if (!tasks) {
        return;
      }

      this.tasks = tasks;
    });
    */

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

    this.myTeamIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(teamIdHash => {
      if (!teamIdHash) {
        this.myTeamCnt = 0;
        return;
      }
      let myTeamIds = Object.keys(teamIdHash);
      if (myTeamIds) {
        // Subtract 1 for the supervisor
        this.myTeamCnt = myTeamIds.length - 1;
        if (this.myTeamCnt > 0) {
          this.currentStep = 1;
        }
      }
    });

    this.httpErrors$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(err => {
      if (!err) {
        return;
      }

      this.currentHttpError = err.error.message;
      this.messageService.error('HTTP Error: ' + this.currentHttpError, { nzDuration: 5000 });
      this.httpErrors.push(this.currentHttpError);
    })
/*
    this.taskBS$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(task => {
      if (!task) {
        return;
      }

      this.showTaskVideoModal = true;
    })
    */

    this.org$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgObj => {
      this.orgObj = orgObj;
    })

    this.myOrgUsers$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(users => {
      if (!users) {
        return;
      }

      this.myOrgUsers = users;
      for (let user of this.myOrgUsers) {
        let name = user.firstName + ' ' + user.lastName;
        this.userNameHash[name] = user;
        this.listOfUsers.push({ label: name, value: name });
      }
    })
    this.alert$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(alert => {
      if (!alert) {
        return;
      }

      this.alerts.push(alert);
      this.dropDownAlerts.push(alert);
    })
  };

  onAlertClose(index: number) {
    this.alerts.splice(index, 1);
  }

  planChanged(plan: string) {
    this.myPlan = plan;
    console.log('planChanged', this.myPlan);
    this.orgService.setPlan(this.myPlan);
  }

  adminUserListChanged(userList) {
    let adminIds: string[] = [];
    for (let user of userList) {
      adminIds.push(this.userNameHash[user.value]._id);
    }
    this.orgService.setAdminIds(this.orgObj.adminIds);
  }

  checkUniqueEmail(data) {
    if (this.currentEmail.email === this.authenticatedUser.email) {
      this.emailUnique = true;
      return;
    }
    console.log('checkUniqueEmail', data);
    this.userService.getUserByEmail$(this.currentEmail.email).subscribe(user => {
      this.emailUnique = false;
    },
      err => {
        this.emailUnique = true;
      })
  }

  setAlertErrorMessage(message) {

  }

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
  /*
    toggleHelp() {
      this.helpIsClosed = !this.helpIsClosed;
    }
  */
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
    this.authenticatedUser.firstName = this.fName;
    this.authenticatedUser.lastName = this.lName;
    this.userService.updateUser(this.authenticatedUser, true);
    this.showNewUserModal = false;
    //    this.login();
  }

    startTour(task: string) {
      console.log("startTour", task);
      this.taskWizardService.startTour(task);
  //    this.joyrideService.startTour({ steps: this.taskHash[task].steps });
      // this.eventService.startTour(this.currentPage);
      //    let toursteps = this.aboutThisPageHash[this.currentPage].tourSteps;
      //    this.joyrideService.startTour(toursteps);
    }
/*
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
  */

  handleUpdateUserCancel() {
    this.userPanelVisible = false;
  }

  handleUpdateUser() {
    this.userPanelVisible = false;
    if (this.currentEmail !== this.authenticatedUser.email) {
      this.authenticatedUser.email = this.currentEmail;
      this.authenticatedUser.emailVerified = false;
      this.userService.sendVerifyEmailMsg(this.currentEmail, this.authenticatedUser._id);
    }
    this.userService.updateUser(this.authenticatedUser, true);
  }
}