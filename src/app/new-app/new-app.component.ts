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
import * as cloneDeep from 'lodash/cloneDeep';

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
    trigger('infoSlide', [
      // ...
      state('closed', style({
        'margin-top': '-100px'
      })),
      state('open', style({
        'margin-top': '200px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
    trigger('warningSlide', [
      // ...
      state('closed', style({
        'margin-top': '-100px'
      })),
      state('open', style({
        'margin-top': '290px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
    trigger('errorSlide', [
      // ...
      state('closed', style({
        'margin-top': '-100px'
      })),
      state('open', style({
        'margin-top': '380px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
    trigger('successSlide', [
      // ...
      state('closed', style({
        'margin-top': '-100px'
      })),
      state('open', style({
        'margin-top': '470px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ])
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
  myOrgUsers = [];
  myOrgUsers$: Observable<UserModel[]>;
  listOfSelectedUsers = [];
  listOfUsers = [];
  userNameHash = {};
  planHash = {
    earlyAccess: {
      name: 'Early Access',
      icon: 'fad fa-user-hard-hat',
      color: 'cornflowerblue'
    },
    basic: {
      name: 'Basic',
      icon: 'fad fa-user',
      color: 'green'
    },
    pro: {
      name: 'Pro',
      icon: 'fad fa-user-tie',
      color: 'red'
    },
    expert: {
      name: 'Expert',
      icon: 'fad fa-user-graduate',
      color: 'blueviolet'
    }
  }

  showUpgradeToExpertDialog$: Observable<boolean>;
  showUpgradeToProDialog$: Observable<boolean>;
  showUpgradeToProDialog = false;
  showUpgradeToExpertDialog = false;
  upgradeToExpertOkText = '';
  upgradeToProOkText = '';
  infoAlertIsVisible = false;
  warningAlertIsVisible = false;
  errorAlertIsVisible = false;
  successAlertIsVisible = false;
  alertBackgroundColorHash = {
    info: 'blue',
    warning: 'goldenrod',
    error: 'red',
    success: 'green'
  }
  currentAlert: AlertModel;
  alertInterval = 100;
  alertTime = 5000;
  infoAlertHasFocus = false;
  warningAlertHasFocus = false;
  errorAlertHasFocus = false;
  successAlertHasFocus = false;
  alertHash = {};
  infoAlerts: AlertModel[] = [];
  warningAlerts: AlertModel[] = [];
  errorAlerts: AlertModel[] = [];
  successAlerts: AlertModel[] = [];
  infoAlertPercentComplete: number = 0;
  errorAlertPercentComplete: number = 0;
  warningAlertPercentComplete: number = 0;
  successAlertPercentComplete: number = 0;


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
    this.showUpgradeToProDialog$ = this.orgService.getShowUpgradeToProDialogStream();
    this.showUpgradeToExpertDialog$ = this.orgService.getShowUpgradeToExpertDialogStream();
  }

  ngOnInit(): void {
/*
    this.infoAlertIsVisible = true;
    setTimeout(() => {
      this.infoAlertIsVisible = false;
    }, 12000);
    this.warningAlertIsVisible = true;
    setTimeout(() => {
      this.warningAlertIsVisible = false;
    }, 12000);
    this.errorAlertIsVisible = true;
    setTimeout(() => {
      this.errorAlertIsVisible = false;
    }, 12000);
    this.successAlertIsVisible = true;
    setTimeout(() => {
      this.successAlertIsVisible = false;
    }, 12000);
*/

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
      if (this.orgObj) {
        if (this.orgObj.adminIds.includes(this.authenticatedUser._id)) {
          this.upgradeToExpertOkText = "Upgrade to the Expert Plan Now";
          this.upgradeToProOkText = "Upgrade to the Pro Plan Now";
        } else {
          this.upgradeToExpertOkText = "Send Message";
        }
      }

      this.currentEmail = this.authenticatedUser.email;
      if (this.authenticatedUser.firstName === '') {
        this.firstTimer = true;
        let fullName = localStorage.getItem(this.authenticatedUser.email);
        console.log('local storage for ', this.authenticatedUser.email, fullName);

        if (fullName) {
          let nameParts: string[] = fullName.split(' ');
          if (nameParts.length === 2) {
            this.authenticatedUser.firstName = nameParts[0];
            this.authenticatedUser.lastName = nameParts[1];
          }
          localStorage.removeItem(this.authenticatedUser.email);
        } else {
          this.showNewUserModal = true;
        }

          //        this.showNewUserModal = true;
        //        this.playTaskVideo('gettingStarted');
      }
// commented out the next line on 4/5/21      
//      this.authenticatedUser = user;
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
      if (this.authenticatedUser) {
        if (this.orgObj.adminIds.includes(this.authenticatedUser._id)) {
          this.upgradeToExpertOkText = "Upgrade to the Expert Plan Now";
          this.upgradeToProOkText = "Upgrade to the Pro Plan Now";
        } else {
          this.upgradeToExpertOkText = "Send Message";
          this.upgradeToProOkText = "Send Message";
        }
      }
    })

    this.showUpgradeToExpertDialog$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(showUpgradeToExpertDialog => {
      this.showUpgradeToExpertDialog = showUpgradeToExpertDialog;
    })

    this.showUpgradeToProDialog$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(showUpgradeToProDialog => {
      this.showUpgradeToProDialog = showUpgradeToProDialog;
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

      this.dropDownAlerts.push(alert);
      switch (alert.type) {
        case 'info':
          this.infoAlerts.push(alert);
          this.infoAlertIsVisible = true;
          this.infoAlertPercentComplete = 0;
          let infoFuncId = setInterval(() => {
            if (this.infoAlertPercentComplete < 100) {
              this.infoAlertPercentComplete += (this.alertInterval / this.alertTime) * 100;
            } else {
              clearInterval(infoFuncId);
              this.infoAlertIsVisible = false;
              this.infoAlerts.shift();
            }
          }, this.alertInterval);
          break;
        case 'warning':
          this.warningAlerts.push(alert);
          this.warningAlertIsVisible = true;
          this.warningAlertPercentComplete = 0;
          let warningFuncId = setInterval(() => {
            if (this.warningAlertPercentComplete < 100) {
              this.warningAlertPercentComplete += (this.alertInterval / this.alertTime) * 100;
            } else {
              clearInterval(warningFuncId);
              this.warningAlertIsVisible = false;
              this.warningAlerts.shift();
            }
          }, this.alertInterval);
          break;
        case 'error':
          this.errorAlerts.push(alert);
          this.errorAlertIsVisible = true;
          this.errorAlertPercentComplete = 0;
          let errorFuncId = setInterval(() => {
            if (this.errorAlertPercentComplete < 100) {
              this.errorAlertPercentComplete += (this.alertInterval / this.alertTime) * 100;
            } else {
              clearInterval(errorFuncId);
              this.errorAlertIsVisible = false;
              this.errorAlerts.shift();
            }
          }, this.alertInterval);
          break;
        case 'success':
          this.successAlerts.push(alert);
          this.successAlertIsVisible = true;
          this.successAlertPercentComplete = 0;
          let successFuncId = setInterval(() => {
            if (this.successAlertPercentComplete < 100) {
              this.successAlertPercentComplete += (this.alertInterval / this.alertTime) * 100;
            } else {
              clearInterval(successFuncId);
              this.successAlertIsVisible = false;
              this.successAlerts.shift();
            }
          }, this.alertInterval);
          break;
        default:
          break;
      }

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

  handleUpgradeToProOk() {
    if (this.orgObj.adminIds.includes(this.authenticatedUser._id)) {
      this.orgObj.planId = 'pro';
      this.orgService.setPlan('pro');
      let alert = <AlertModel>{
        type: 'success',
        message: 'You have successfully upgraded to the Pro plan.'
      }
      this.notificationService.showAlert(alert);
    } else {
      let alert = <AlertModel>{
        type: 'info',
        message: 'A message has been sent to your software administrator.'
      }
      this.notificationService.showAlert(alert);
      console.log('handleUpgradeToExpertOk...sending message to admin list');
    }
    this.showUpgradeToProDialog = false;
  }
  handleUpgradeToExpertOk() {
    if (this.orgObj.adminIds.includes(this.authenticatedUser._id)) {
      this.orgObj.planId = 'expert';
      this.orgService.setPlan('expert');
      let alert = <AlertModel>{
        type: 'success',
        message: 'You have successfully upgraded to the Expert plan.'
      }
      this.notificationService.showAlert(alert);
    } else {
      let alert = <AlertModel>{
        type: 'info',
        message: 'A message has been sent to your software administrator.'
      }
      this.notificationService.showAlert(alert);
      console.log('handleUpgradeToExpertOk...sending message to admin list');
    }
    this.showUpgradeToExpertDialog = false;
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