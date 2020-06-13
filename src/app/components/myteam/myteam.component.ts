import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { TrainingService } from '../../shared/services/training.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { UserTrainingModel } from '../../shared/interfaces/userTraining.type';
import { TrainingModel, TrainingIdHash } from '../../shared/interfaces/training.type';
import { Observable, BehaviorSubject, Subscription, defer } from 'rxjs';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SendmailService } from '../../shared/services/sendmail.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { MessageModel } from '../../shared/interfaces/message.type';
import { takeUntil, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import FlatfileImporter from "flatfile-csv-importer";


@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.css'],
  //  changeDetection: ChangeDetectionStrategy.OnPush,
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
      transition('* => open', [
        animate('300ms')
      ]),
    ]),
    trigger('userAddToggle', [
      // ...
      state('closed', style({
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

  private importer: FlatfileImporter;



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
  includeNewSupervisorsTeam = true;
  isNewSupervisorPanelOpen = false;
  isUserAddPanelOpen = false;
  assignableTrainings: TrainingModel[] = [];
  showUserTrainingModal = false;

  userTrainings$: Observable<UserTrainingModel[]>;
  selectedUser$: Observable<UserModel>;
  newUser$: Observable<UserModel>;
  selectedUser: UserModel;
  selectedUserId: string;
  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  myTeamIdHash: UserIdHash;
  myTeam: UserModel[] = [];
  jobTitles$: Observable<string[]>;
  jobTitles: string[] = [];
  options: string[];
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
    teamAdmin: false,
    appAdmin: false,
    orgAdmin: false,
    userType: 'individualContributor',
    uid: '',
    userStatus: 'pending',
    trainingStatus: 'upToDate',
    profilePicUrl: '',
    supervisorId: null,
    settings: {},
    jobTitle: ''
  }
  message: MessageModel;
  userIdSelected = '';
  matchingJobTitles: string[] = [];
  uid: string;
  teamTrainings: TrainingModel[] = [];
  userPanelVisible = false;
  newUser = false;
  selectedTrainingId = null;
  allTrainingIdHash$: Observable<TrainingIdHash>;
  allTrainingIdHash: TrainingIdHash = {};
  newUsers: UserModel[];

  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private mailService: SendmailService,
    private trainingService: TrainingService,
    private jobTitleService: JobTitleService,
    private userTrainingService: UserTrainingService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
    this.allTrainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.newUser$ = this.userService.getNewUserStream();
    this.jobTitles$ = this.jobTitleService.getJobTitleStream();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
  }

  ngOnInit() {
    FlatfileImporter.setVersion(2);
    this.initializeImporter();
    this.newUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(newUser => {
      if (!newUser) {
        return;
      }
      this.trainingService.assignTrainingsForJobTitle(newUser.jobTitle, newUser._id);
    });
    this.myTeamIdHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamIdHash => {
      if (!myTeamIdHash) {
        return;
      }
      this.myTeamIdHash = myTeamIdHash;

      this.myTeam = Object.values(this.myTeamIdHash);
      //      this.cd.detectChanges();
      /*
            if (this.myTeam.length > 0) {
              this.userIdSelected = this.myTeam[0]._id;
              this.userService.selectUser(this.myTeam[0]._id);
            }
            */
    });
    this.selectedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        this.userIdSelected = null;
        return;
      }
      this.userIdSelected = user._id;
      this.selectedUser = user;
      this.trainingService.selectTraining(null);
      this.userTrainings$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
        if (!userTrainings) {
          return;
        }
        this.assignableTrainings = [];
        let tids = [];
        for (let ut of userTrainings) {
          tids.push(ut.tid);
        }
        for (let training of this.teamTrainings) {
          if (tids.includes(training._id)) {
            continue;
          } else {
            if (training.versions.length === 0) {
              continue;
            }
            this.assignableTrainings.push(training);
          }
        }

      })

    });

    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.importer.setCustomer({
        userId: this.authenticatedUser._id,
        name: this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName
      });


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
          }
        }
      })
      this.newTeamMember.teamId = this.authenticatedUser.uid;
      this.newTeamMember.supervisorId = this.authenticatedUser.uid;
      this.newTeamMember.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
    })

    this.jobTitles$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(jobTitles => {
      this.jobTitles = jobTitles;
      this.matchingJobTitles = this.jobTitles;
    })
  }

  async launchImporter() {
    if (!this.LICENSE_KEY) {
      return alert("Set LICENSE_KEY on Line 13 before continuing.");
    }
    try {
      /*
      Observable.defer(this.importer.requestDataFromUser().subscribe(results => {

      }))
      */
      let results = await this.importer.requestDataFromUser();
      this.importer.displayLoader();
      this.importer.displaySuccess("Success!");
      this.results = JSON.stringify(results.validData, null, 2);

      this.newUsers = JSON.parse(this.results);
      for (let user of this.newUsers) {
        this.newTeamMember._id = String(new Date().getTime());
        this.newTeamMember.firstName = user.firstName;
        this.newTeamMember.lastName = user.lastName;
        this.newTeamMember.email = user.email;
        this.newTeamMember.jobTitle = user.jobTitle;
        this.newTeamMember.teamAdmin = false;
        this.handleAddUser();
        this.trainingService.assignTrainingsForJobTitle(this.newTeamMember.jobTitle, this.newTeamMember._id);
      }
/*
      // emulate a server call, replace the timeout with an XHR request
      setTimeout(() => {
        this.importer.displaySuccess("Success!");
        this.results = JSON.stringify(results.validData, null, 2);
        
      }, 500);
*/
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

  onJobTitleChange(value: string): void {
    console.log('onJobTitleChange', this.jobTitles);
    this.matchingJobTitles = this.jobTitles.filter(jobTitle => jobTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }

  addUser() {
    this.newUser = true;
    this.newTeamMember._id = String(new Date().getTime());
    this.newTeamMember.firstName = '';
    this.newTeamMember.lastName = '';
    this.newTeamMember.email = '';
    this.newTeamMember.teamAdmin = false;
    this.selectedUser = this.newTeamMember;
    this.userPanelVisible = true;
    this.options = [];
  }

  handleCancel(): void {
    if (this.newUser) {
      this.userService.selectUser(this.authenticatedUser._id);
      this.newUser = false;
    }
    this.userPanelVisible = false;
  }

  handleAddUser() {
    this.newUser = false;
    console.log('handleAddUser', this.newTeamMember);
    this.userService.updateUser(this.authenticatedUser, false);
    this.userService.createNewUser(this.newTeamMember);
    if (this.newTeamMember.jobTitle) {
      this.jobTitleService.addJobTitle(this.newTeamMember.jobTitle);
    }
    this.options = [];
    let url = 'https://mytrainingdocs.com/signup/' + this.newTeamMember.email;
    this.message = <MessageModel>{
      to: this.newTeamMember.email,
      from: this.authenticatedUser.email,
      subject: 'Please Register',
      html: 'Please <a href="' + url + '">register</a>'
    }
    this.mailService.sendMessage(this.message);
    this.userPanelVisible = false;
    this.cd.detectChanges();
  }

  handleUpdateUser() {
    this.userPanelVisible = false;
    this.userService.updateUser(this.selectedUser, true);
  }

  selectUser(userId) {
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
    this.userTrainingService.assignTraining(this.userIdSelected, this.selectedTrainingId);
    this.showUserTrainingModal = false;
    this.assignableTrainings.splice(this.assignableTrainings.indexOf(this.selectedTrainingId), 1);
    this.selectedTrainingId = null;
  }
}
