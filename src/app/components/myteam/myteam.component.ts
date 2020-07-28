import { Component, OnInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { ResizeEvent } from '../../shared/interfaces/event.type';
import { TrainingService } from '../../shared/services/training.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { UserTrainingModel, UidUTHash } from '../../shared/interfaces/userTraining.type';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { Observable, BehaviorSubject, Subscription, defer } from 'rxjs';
import { UserModel, UserFail, UserIdHash, OrgChartNode, BuildOrgProgress, UserBatchData } from '../../shared/interfaces/user.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SendmailService } from '../../shared/services/sendmail.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { UserBulkAddService } from '../../shared/services/userBulkAdd.service';
import { MessageModel, TemplateMessageModel } from '../../shared/interfaces/message.type';
import { takeUntil, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import * as cloneDeep from 'lodash/cloneDeep';
import { BaseComponent } from '../base.component';
import FlatfileImporter from "flatfile-csv-importer";
import { JoyrideService } from 'ngx-joyride';
import { UserBulkAddModel } from 'src/app/shared/interfaces/userBulkAdd.type';

@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('supervisorSignupToggle', [
      // ...
      state('closed', style({
        'height': '0'
      })),
      state('open', style({
        'height': '50px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
    trigger('userSlide', [
      // ...
      state('in', style({
        'opacity': '1'
      })),
      state('out', style({
        'opacity': '0'
      })),
      transition('in => out', [
        animate('400ms')
      ]),
      transition('out => in', [
        animate('400ms')
      ])
    ]),
    trigger('switchUserToggle', [
      // ...
      state('', style({
        'visibility': 'hidden',
        'height': '0'
      })),
      state('open', style({
        'visibility': 'visible',
        'height': 'fit-content',
      })),
      transition('open => closed', [
        animate('700ms')
      ]),
      transition('* => open', [
        animate('1000ms')
      ]),
    ])
  ]
})
export class MyteamComponent extends BaseComponent implements OnInit {

  LICENSE_KEY = "2bda9380-a84c-11e7-8243-1d92e7c67d6d";
  results = "";
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
    this.orgChartWidth = window.innerWidth - (window.innerWidth * this.teamContainerWidth / 100);
    if (this.orgChartWidth < 800) {
      this.orgChartContainerSize = 'small';
    } else if (this.orgChartWidth < 900) {
      this.orgChartContainerSize = 'medium';
    } else {
      this.orgChartContainerSize = 'large';
    }
    this.peopleCntArray = this.peopleCntHash[this.orgChartContainerSize];
  }

  private importer: FlatfileImporter;

  userTypeIconHash = {
    individualContributor: 'fad fa-fw fa-user',
    supervisor: 'fad fa-fw fa-user-tie',
    volunteer: 'fad fa-fw fa-user-cowboy',
    customer: 'fad fa-fw fa-user-crown',
    candidate: 'fad fa-fw fa-user-graduate'
  }
  /*
  trainingStatusHash = {
    upToDate: {
      class
    }
  }
  */
  userTrainingStatusColorHash = {
    upToDate: '#52c41a',
    pastDue: 'red',
    none: 'black'
  }
  includeNewSupervisorsTeam = true;
  isNewSupervisorPanelOpen = false;
  isUserAddPanelOpen = false;
  assignableTrainings: TrainingModel[] = [];
  showUserTrainingModal = false;

  buildOrgProgress$: Observable<BuildOrgProgress>;
  myOrgChartData$: Observable<OrgChartNode[]>;
  myOrgUserHash$: Observable<UserIdHash>;
  myOrgUserList$: Observable<UserModel[]>;
  userTrainings$: Observable<UserTrainingModel[]>;
  selectedUser$: Observable<UserModel>;
  newUser$: Observable<UserModel>;
  selectedUser: UserModel;
  selectedUserId: string;
  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  myOrgUserHash: UserIdHash = {};
  myOrgUsers: string[] = [];
  myOrgSupervisors: string[] = [];
  myTeamIdHash: UserIdHash;
  myTeam$: Observable<UserModel[]>;
  myTeam: UserModel[] = [];
  myTeamFiltered: UserModel[] = [];
  jobTitles$: Observable<string[]>;
  jobTitles: string[] = [];
  options: string[];
  uidReportChainHash$: Observable<UserIdHash>;
  myTeamIdHash$: Observable<UserIdHash>;
  showNewUserModal = false;
  supervisorSelected = false;
  newTeamMember: UserModel = {
    _id: '',
    teamId: '',
    org: '',
    firstName: '',
    lastName: '',
    email: '',
    emailVerified: false,
    teamAdmin: false,
    appAdmin: false,
    orgAdmin: false,
    userType: 'individualContributor',
    uid: '',
    userStatus: 'pending',
    trainingStatus: 'none',
    profilePicUrl: '',
    supervisorId: null,
    directReports: [],
    settings: {},
    jobTitle: ''
  }
  message: TemplateMessageModel;
  userIdSelected = '';
  matchingJobTitles: string[] = [];
  matchingUsers: string[] = [];
  matchingSupervisors: string[] = [];
  uid: string;
  teamTrainings: TrainingModel[] = [];
  userPanelVisible = false;
  newUser = false;
  selectedTrainingId = null;
  allTrainingIdHash$: Observable<TrainingIdHash>;
  allTrainingIdHash: TrainingIdHash = {};
  newUsers: [{ firstName: string, lastName: string, email: string, jobTitle: string, supervisorName }];
  supervisorHash = {};
  userNameHash = {};
  authenticatedUserFullName;
  usersNotOnMyTeam: string[] = [];
  showNone = true;
  showUpToDate = true;
  showPastDue = true;
  showIndividualContributors = true;
  showSupervisors = true;
  showVolunteers = true;
  showCustomers = true;
  showUpToDateTrainings = true;
  showCompletedTrainings = true;
  showPastDueTrainings = true;
  showOnetime = true;
  showRecurring = true;
  uidUTHash$: Observable<UidUTHash>;
  uidUTHash = {};
  showTrainingHash = {};
  trainingStatusFilterVal: string;
  myGroup: UserModel[];
  teamContainerWidth = 25;
  browserWidth;
  browserHeight;
  newWidth;
  resizeBarColor;
  dragging;
  bulkUploadCount = 0;
  fullNameHash = {};
  newUserHash = {};
  newUserIds = [];
  org;
  teamId;
  nodes: OrgChartNode[] = [];
  chartOrientation = 'vertical';
  orgChartFontSize = 2;
  reportChain: string[] = [];
  orgNodeHash = {};
  uidReportChainHash = {};
  orgChartHeight;
  currentTab = 0;
  tourStepsHash = {};
  bulkAdd = false;
  orgProgress: BuildOrgProgress = {
    usersTotal: 0,
    usersAdded: 0,
    description: '',
    usersProcessed: 0,
    supervisorMatchFail: []
  }
  myOrgUserNameHash = {};
  userNameToSearchFor: string;
  showAddToUserListButton = false;
  invalidSupervisorName = true;
  supervisorName;
  supervisorChanged = false;
  showSupervisorAssignmentDialog = false;
  supervisorMatchFails: string[] = [];
  supervisorsFixedCnt = 0;
  bulkAddFail = false;
  myOrgUsers$: Observable<string[]>;
  reportChainWidth = 0;
  orgChartWidth = 0;
  emailUnique = false;
  userFail$: Observable<UserFail>;
  orgChartContainerSize: 'small' | 'medium' | 'large';
  peopleCntArray = [];
  peopleCntArrayIndex;
  peopleCntHash = {
    small: [3, 8, 13, 18, 23, 28, 33, 38, 43, 45],
    medium: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48],
    large: [8, 13, 18, 23, 28, 33, 38, 43, 48, 53]
  }
  batchFails$: Observable<UserBatchData[]>;
  batchFails = [];
  batchUsers$: Observable<UserBulkAddModel[]>;
  batchUsers: UserBulkAddModel[];

  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private mailService: SendmailService,
    private trainingService: TrainingService,
    private userBulkAddService: UserBulkAddService,
    private jobTitleService: JobTitleService,
    private userTrainingService: UserTrainingService,
    private joyrideService: JoyrideService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
    this.batchUsers$ = this.userBulkAddService.getUserBulkAddStream();
    this.batchFails$ = this.userService.getBatchUserFailsStream();
    this.userFail$ = this.userService.getUserFailStream();
    this.myOrgUsers$ = this.userService.getMyOrgUserNameListStream();
    this.buildOrgProgress$ = this.userService.getOrgProgressStream();
    this.uidReportChainHash$ = this.userService.getUIDReportChainHashStream();
    this.myOrgChartData$ = this.userService.getMyOrgStream();
    this.myOrgUserHash$ = this.userService.getOrgHashStream();
    this.uidUTHash$ = this.userTrainingService.getUidUTHashStream();
    this.allTrainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.myTeam$ = this.userService.getMyTeamStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.newUser$ = this.userService.getNewUserStream();
    this.jobTitles$ = this.jobTitleService.getJobTitleStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
  }

  ngOnInit() {
    this.tourStepsHash['myTeam'] = ['Step1-myTeam', 'Step2-myTeam', 'Step3-myTeam', 'Step4-myTeam', 'Step5-myTeam'];
    this.tourStepsHash['memberDetails'] = ['Step1-memberDetails'];
    this.tourStepsHash['orgChart'] = ['Step1-orgChart'];


    this.contentHeight = Math.floor((window.innerHeight - (.3 * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);
    this.orgChartWidth = window.innerWidth - (window.innerWidth * this.teamContainerWidth / 100);
    if (this.orgChartWidth < 800) {
      this.orgChartContainerSize = 'small';
    } else if (this.orgChartWidth < 900) {
      this.orgChartContainerSize = 'medium';
    } else {
      this.orgChartContainerSize = 'large';
    }
    this.peopleCntArray = this.peopleCntHash[this.orgChartContainerSize];
    FlatfileImporter.setVersion(2);
    this.initializeImporter();
    /*
    this.newUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(newUser => {
      if (!newUser) {
        return;
      }
      let message = <TemplateMessageModel>{
        to: newUser.email,
        from: this.authenticatedUser.email,
        templateId: 'd-2d4430d31eee4a929344c8aa05e4afc7',
        dynamicTemplateData: {
          email: newUser.email
        },
      }
      this.mailService.sendTemplateMessage(message);


      this.trainingService.assignTrainingsForJobTitle(newUser.jobTitle, newUser._id, newUser.teamId);
    });
    */
    this.batchUsers$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(users => {
      if (!users) {
        return;
      }
      this.batchUsers = users;
    });

    this.batchFails$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(failList => {
      if (!failList) {
        return;
      }

      this.batchFails = failList;
    });

    this.buildOrgProgress$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgProgress => {
      if (!orgProgress) {
        return;
      }
      this.bulkAdd = true;
      console.log('Org Progress', orgProgress);
      this.orgProgress = orgProgress;
      if (orgProgress.usersProcessed === orgProgress.usersTotal && orgProgress.supervisorMatchFail.length > 0) {
        this.supervisorMatchFails = orgProgress.supervisorMatchFail;
      }
    });

    this.myOrgUserHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgUserHash => {
      if (!orgUserHash) {
        return;
      }
      this.myOrgUserHash = orgUserHash;
      let myOrgUserObjects = Object.values(this.myOrgUserHash);
      this.myOrgSupervisors = [];
      let bulkAddFailFound = false;
      for (let user of myOrgUserObjects) {
        this.myOrgUserNameHash[user.firstName + ' ' + user.lastName] = user;
        if (user.userStatus === 'bulk-add-fail') {
          bulkAddFailFound = true;
          this.bulkAddFail = true;
        }
        if (user.userType === 'supervisor') {
          this.myOrgSupervisors.push(user.firstName + ' ' + user.lastName);
        }
      }
      this.matchingSupervisors = this.myOrgSupervisors;
    });
    this.myOrgUsers$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myOrgUsers => {
      if (!myOrgUsers) {
        return;
      }
      this.myOrgUsers = myOrgUsers;
      this.matchingUsers = this.myOrgUsers;
    });
    this.uidReportChainHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidReportChainHash => {
      if (!uidReportChainHash) {
        return;
      }
      this.uidReportChainHash = uidReportChainHash;
    });
    this.uidUTHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uidUTHash => {
      if (!uidUTHash) {
        return;
      }
      this.uidUTHash = uidUTHash;
    });
    this.myOrgChartData$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(nodes => {
      if (!nodes) {
        return;
      }

      // this next bit of code tries to set the org chart font size to a reasponable value for the
      // number of people in the chart

      this.nodes = nodes;
      let peopleCnt = this.nodes[0].extra.peopleCnt;
      if (peopleCnt < this.peopleCntArray[0]) {
        this.peopleCntArrayIndex = 0;
        this.orgChartFontSize = 12;
      } else if (peopleCnt < this.peopleCntArray[1]) {
        this.peopleCntArrayIndex = 1;
        this.orgChartFontSize = 11;
      } else if (peopleCnt < this.peopleCntArray[2]) {
        this.peopleCntArrayIndex = 2;
        this.orgChartFontSize = 10;
      } else if (peopleCnt < this.peopleCntArray[3]) {
        this.peopleCntArrayIndex = 3;
        this.orgChartFontSize = 9;
      } else if (peopleCnt < this.peopleCntArray[4]) {
        this.peopleCntArrayIndex = 4;
        this.orgChartFontSize = 8;
      } else if (peopleCnt < this.peopleCntArray[5]) {
        this.peopleCntArrayIndex = 5;
        this.orgChartFontSize = 7;
      } else if (peopleCnt < this.peopleCntArray[6]) {
        this.peopleCntArrayIndex = 6;
        this.orgChartFontSize = 6;
      } else if (peopleCnt < this.peopleCntArray[7]) {
        this.peopleCntArrayIndex = 7;
        this.orgChartFontSize = 5;
      } else if (peopleCnt < this.peopleCntArray[8]) {
        this.peopleCntArrayIndex = 8;
        this.orgChartFontSize = 4;
      } else if (peopleCnt < this.peopleCntArray[9]) {
        this.peopleCntArrayIndex = 9;
        this.orgChartFontSize = 3;
      } else {
        this.peopleCntArrayIndex = 10;
        this.orgChartFontSize = 2;
      }
    });
    this.myTeam$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userList => {
      console.log('myTeam$  ', userList);
      if (!userList) {
        return;
      }
      this.myGroup = userList;
      this.myTeam = userList;
      /*
      let teamIdHash = {};
      for (let teamMember of this.myTeam) {
        teamIdHash[teamMember._id] = teamMember;
      }
      */
    });

    this.myTeamIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamIdHash => {
      if (!myTeamIdHash) {
        return;
      }
      this.myTeamIdHash = myTeamIdHash;
    });

    this.selectedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        this.userIdSelected = null;
        return;
      }
      this.userIdSelected = user._id;
      this.selectedUser = user;
      if ((user.supervisorId && this.myOrgUserHash[user.supervisorId]) && (this.authenticatedUser && user._id !== this.authenticatedUser._id)) {
        this.supervisorName = this.myOrgUserHash[user.supervisorId].firstName + ' ' + this.myOrgUserHash[user.supervisorId].lastName;
      }
      this.reportChain = Object.assign([], this.uidReportChainHash[this.selectedUser._id]);
      this.trainingService.selectTraining(null);
    });

    this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
      if (!userTrainings) {
        return;
      }
      this.assignableTrainings = [];
      let tids = [];
      let pastDueFound = false;
      for (let ut of userTrainings) {
        tids.push(ut.tid);
      }

      for (let training of this.teamTrainings) {
        if (tids.includes(training._id)) {
          continue;
        } else {
          if (training.versions.length < 2) {
            continue;
          }
          this.assignableTrainings.push(training);
        }
      }

    });

    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }

      this.authenticatedUser = user;
      this.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
      this.teamId = this.authenticatedUser._id;
      this.authenticatedUserFullName = this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName;
      this.importer.setCustomer({
        userId: this.authenticatedUser._id,
        name: this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName
      });
      
      this.userBulkAddService.getUsersBulkAdd$(this.authenticatedUser.org).subscribe(bulkAddUsers => {
        if (!bulkAddUsers) {
          return;
        }
        this.batchUsers = bulkAddUsers;
      })

      this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.uid = params.get('uid');
        if (!this.uid) {
          this.uid = this.authenticatedUser._id;
        }
        this.userService.selectUser(this.uid);
      });
      //      this.selectUser(this.authenticatedUser._id);
      this.assignableTrainings = [];

      this.allTrainingIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(allTrainingIdHash => {
        this.allTrainingIdHash = allTrainingIdHash;
        let trainings = Object.values(this.allTrainingIdHash);
        this.teamTrainings = [];
        for (let training of trainings) {
          if (training.teamId === this.authenticatedUser.uid) {
            this.teamTrainings.push(training);
            this.showTrainingHash[training._id] = training
          }
        }
      })
    })

    this.jobTitles$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(jobTitles => {
      this.jobTitles = jobTitles;
      this.matchingJobTitles = this.jobTitles;
    })

    this.userFail$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userFail => {
      
    })
  }

  increaseFontSize() {
    this.orgChartFontSize += 1;
  }
  decreaseFontSize() {
    this.orgChartFontSize -= 1;
  }

  checkUniqueEmail(data) {
    if (!this.selectedUser.email || this.selectedUser.email === '') {
      this.emailUnique = false;
      return;
    }
    console.log('checkUniqueEmail', data);
    this.userService.getUserByEmail(this.selectedUser.email).subscribe(user => {
      this.emailUnique = false;
    },
      err => {
        this.emailUnique = true;
    })
  }

  selectReportChainItem(uid) {
    this.reportChain = this.uidReportChainHash[uid];
    if (this.reportChain && this.reportChain.length < 1) {
      this.reportChain = null;
    }
    this.userService.buildOrgChart(uid, true);
  }

  selectNode(event) {
    this.reportChain = Object.assign([], this.uidReportChainHash[event.extra.uid]);
    this.userService.buildOrgChart(event.extra.uid, true);
    console.log('selectNode', event);
  }

  toggleFilter(filter: string) {
    this.myTeamFiltered = [];

    if (filter === 'up-to-date') {
      this.showUpToDate = !this.showUpToDate;
    } else if (filter === 'past-due') {
      this.showPastDue = !this.showPastDue;
    } else if (filter === 'none') {
      this.showNone = !this.showNone;
    } else if (filter === 'individual-contributor') {
      this.showIndividualContributors = !this.showIndividualContributors;
    } else if (filter === 'supervisor') {
      this.showSupervisors = !this.showSupervisors;
    } else if (filter === 'volunteer') {
      this.showVolunteers = !this.showVolunteers;
    } else if (filter === 'customer') {
      this.showCustomers = !this.showCustomers;
    } else if (filter === 'trainingUpToDate') {
      this.showUpToDateTrainings = !this.showUpToDateTrainings;
    } else if (filter === 'trainingCompleted') {
      this.showCompletedTrainings = !this.showCompletedTrainings;
    } else if (filter === 'trainingPastDue') {
      this.showPastDueTrainings = !this.showPastDueTrainings;
    } else if (filter === 'onetime') {
      this.showOnetime = !this.showOnetime;
    } else if (filter === 'recurring') {
      this.showRecurring = !this.showRecurring;
    }

  }

  async launchImporter() {
    try {

      let results = await this.importer.requestDataFromUser();
      this.importer.displayLoader();
      this.importer.displaySuccess("Success!");
      this.results = JSON.stringify(results.validData, null, 2);

      this.newUsers = JSON.parse(this.results);
      this.userService.createNewUsersFromBatch(this.newUsers);
      //        this.trainingService.assignTrainingsForJobTitle(this.newTeamMember.jobTitle, this.newTeamMember._id, this.newTeamMember.teamId);
      //        this.newUsers = [{ firstName: '', lastName: '', email: '', jobTitle: '', supervisorName: '' }];
    } catch (e) {
      console.info(e || "window close");
    }
  }


  initializeImporter() {
    this.importer = new FlatfileImporter(this.LICENSE_KEY, {
      fields: [
        {
          label: "First Name",
          key: "firstName",
          validators: [{ validate: "required" }]
        },
        {
          label: "Last Name",
          key: "lastName",
          validators: [{ validate: "required" }]
        },
        {
          label: "Email Address",
          key: "email",
          validators: [
            { validate: "required" },
            {
              validate: "regex_matches",
              regex:
                "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])",
              error: "Must be in email format"
            }
          ]
        },
        {
          label: "Job Title",
          key: "jobTitle",
          validators: []
        },
        {
          label: "Supervisor",
          key: "supervisorName",
          validators: []
        }
      ],
      type: "Users",
      allowInvalidSubmit: true,
      managed: true,
      allowCustom: true,
      disableManualInput: false
    });
  }

  setJobTitle(value) {
    this.jobTitleService.addJobTitle(this.newTeamMember.jobTitle);
    //    this.userService.updateUser(this.authenticatedUser, false);
  }

  onUserSearchChange(value: string): void {
    this.matchingUsers = this.myOrgUsers.filter(user => user.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    if (this.myOrgUsers.indexOf(value) > -1) {
      this.showAddToUserListButton = true;
    }
  }

  onSupervisorNameChange(value: string): void {
    this.matchingSupervisors = this.myOrgSupervisors.filter(user => user.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    let userObj;
    if (this.myOrgSupervisors.indexOf(value) > -1) {
      this.invalidSupervisorName = false;
      this.supervisorChanged = true;
    } else {
      this.invalidSupervisorName = true;
    }
  }

  onJobTitleChange(value: string): void {
    this.matchingJobTitles = this.jobTitles.filter(jobTitle => jobTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }

  addFoundUser() {
    let userObj = this.myOrgUserNameHash[this.userNameToSearchFor];
    this.myTeam.push(userObj);
    this.myTeamIdHash[userObj._id] = userObj;
    this.showAddToUserListButton = false;
    this.currentTab = 0;
    this.userNameToSearchFor = '';
    this.matchingUsers = this.myOrgUsers;
    this.selectUser(userObj._id);
  }

  addUser() {
    this.newUser = true;
    this.newTeamMember._id = String(new Date().getTime());
    this.newTeamMember.uid = ''
    this.newTeamMember.org = this.org;
    this.newTeamMember.firstName = '';
    this.newTeamMember.lastName = '';
    this.newTeamMember.email = '';
    this.newTeamMember.emailVerified = false;
    this.newTeamMember.jobTitle = '';
    this.newTeamMember.teamId = this.teamId;
    this.newTeamMember.supervisorId = this.authenticatedUser._id;
    this.newTeamMember.teamAdmin = false;
    this.newTeamMember.userStatus = 'pending';
    this.newTeamMember.trainingStatus = 'none';
    this.newTeamMember.teamAdmin = false;
    this.newTeamMember.orgAdmin = false;
    this.newTeamMember.appAdmin = false;
    this.newTeamMember.profilePicUrl = '';
    this.newTeamMember.directReports = [];
    this.newTeamMember.settings = {
      themeColor: {
        name: 'grey',
        primary: 'white',
        secondary: '#999999',
        bgColor: '#e9e9e9',
      }
    };
    this.supervisorName = this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName;
    this.selectedUser = this.newTeamMember;
    this.userPanelVisible = true;
    this.options = [];
  }

  handleCancel(): void {
    if (this.newUser) {
      this.userService.selectUser(this.authenticatedUser._id);
      this.newUser = false;
    }
    this.emailUnique = false;
    this.userPanelVisible = false;
  }

  handleAddUser(reload: boolean) {
    this.newUser = false;

    this.userService.createNewUser(this.newTeamMember, reload);

    this.userPanelVisible = false;
  }


  handleUpdateUser() {
    this.userPanelVisible = false;
    let supervisorObj = this.myOrgUserNameHash[this.supervisorName];
    if (this.selectedUser.supervisorId !== supervisorObj._id) {
      if (this.selectedUser.userStatus === 'bulk-add-fail') {
        this.selectedUser.userStatus = 'active';
      }
      this.selectedUser.supervisorId = supervisorObj._id;
      this.selectedUser.teamId = supervisorObj._id;
      supervisorObj.directReports.push(this.selectedUser._id);
      this.authenticatedUser.directReports.splice(this.authenticatedUser.directReports.indexOf(this.selectedUser._id), 1);
      this.userService.updateUser(this.authenticatedUser, false);
      this.userService.updateUser(supervisorObj, false);
    }
    this.userService.updateUser(this.selectedUser, false);
  }

  selectUser(userId) {
    console.log('selectUser', userId);
    this.userService.selectUser(userId);
  }

  selectSupervisor() {
    this.selectUser(null);
    this.supervisorSelected = true;
  }

  newSupervisorSelected(open: boolean) {
    this.isNewSupervisorPanelOpen = open;
  }

  handleCancelUserTraining() {
    this.showUserTrainingModal = false;
    this.selectedTrainingId = null;
  }

  editUser() {
    this.userPanelVisible = true;
  }

  onInput(value: string): void {
    for (let jobTitle of this.jobTitles) {
      if (jobTitle.startsWith(value)) {
        if (!this.options.includes(jobTitle)) {
          this.options.push(jobTitle);
        }
      }
    }
  }

  confirmDelete(user: UserModel) {
    if (user._id === this.authenticatedUser._id) {
      return;
    }
    this.userService.deleteUser(user._id);
    this.userTrainingService.deleteUTForUser(user._id);
    this.userService.selectAuthenticatedUser();
  }

  handleAssignUserTraining() {
    if (!this.selectedTrainingId || this.assignableTrainings.length === 0) {
      this.showUserTrainingModal = false;
      return;
    }
    this.userTrainingService.assignTraining(this.userIdSelected, this.selectedTrainingId, this.authenticatedUser._id, this.allTrainingIdHash[this.selectedTrainingId].versions[0].version);

    if (this.selectedUser.trainingStatus === 'none') {
      this.selectedUser.trainingStatus = 'upToDate';
      this.userService.updateUser(this.selectedUser, false);
    }

    this.showUserTrainingModal = false;
    this.assignableTrainings.splice(this.assignableTrainings.indexOf(this.selectedTrainingId), 1);
    this.selectedTrainingId = null;
    this.userTrainingService.getUTForUser(this.userIdSelected);
  }

  onDragStart(event) {
    this.dragging = true;
    this.resizeBarColor = '#7fa9f9';
  }

  onDrag(event) {
    this.newWidth = Math.floor((event.clientX / window.innerWidth) * 100);
    this.teamContainerWidth = this.newWidth;
    this.orgChartWidth = window.innerWidth - (window.innerWidth * this.teamContainerWidth / 100);
    if (this.orgChartWidth < 800) {
      this.orgChartContainerSize = 'small';
    } else if (this.orgChartWidth < 900) {
      this.orgChartContainerSize = 'medium';
    } else {
      this.orgChartContainerSize = 'large';
    }
    this.peopleCntArray = this.peopleCntHash[this.orgChartContainerSize];
  }

  onDragEnd(event) {
    this.resizeBarColor = 'white';
  }

  drop(event) {
  }

  allowDrop(event) {
    event.preventDefault();
  }

  startTour(section) {
    let steps = this.tourStepsHash[section];
    this.joyrideService.startTour({ steps: steps });
  }


}
