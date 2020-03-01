import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { TrainingService } from '../../shared/services/training.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { UserModel, UserIdHash } from '../../shared/interfaces/user.type';
import { EventModel } from '../../shared/interfaces/event.type';
import { TrainingModel, TrainingIdHash } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SendmailService } from '../../shared/services/sendmail.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { MessageModel } from '../../shared/interfaces/message.type';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ])
  ]
})
export class MyteamComponent implements OnInit {

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
  includeNewSupervisorsTeam = false;
  isNewSupervisorPanelOpen = false;
  
  selectedUser$: Observable<UserModel>;
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
    adminUp: false,
    userType: 'individualContributor',
    uid: '',
    userStatus: 'pending',
    trainingStatus: 'uptodate',
    profilePicUrl: '',
    supervisorId: null,
    settings: {},
    jobTitle: ''
  }
  message: MessageModel;
  userIdSelected = '';


  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService,
    private mailService: SendmailService,
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService,
    private jobTitleService: JobTitleService
  ) {
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.jobTitles$ = this.jobTitleService.getJobTitleStream();
  }

  ngOnInit() {
    this.myTeamIdHash$.subscribe(myTeamIdHash => {
      if (!myTeamIdHash) {
        return;
      }
      this.myTeamIdHash = myTeamIdHash;

      this.myTeam = Object.values(this.myTeamIdHash);
      if (this.myTeam.length > 0) {
        this.selectUser(this.myTeam[0]._id);
      }
/*
      if (this.myTeam.length > 0) {
        this.userIdSelected = this.myTeam[0]._id;
        this.userService.selectUser(this.myTeam[0]._id);
      }
      */
    });
    this.selectedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.userIdSelected = user._id;
      this.trainingService.selectTraining(null);

    });

    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.newTeamMember.teamId = this.authenticatedUser.uid;
      this.newTeamMember.supervisorId = this.authenticatedUser.uid;
      this.newTeamMember.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
      this.newTeamMember._id = String(new Date().getTime());
    })

    this.jobTitles$.subscribe(jobTitles => {
      this.jobTitles = jobTitles;
    })


  }

  addUser() {
    this.showNewUserModal = true;
    this.options = [];
  }

  handleCancel(): void {
    this.showNewUserModal = false;
  }

  handleAddUser() {
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
    this.showNewUserModal = false;
    this.newTeamMember.firstName = '';
    this.newTeamMember.lastName = '';
    this.newTeamMember.email = '';
    this.newTeamMember.adminUp = false;
  }


  selectUser(userId) {
    this.userService.selectUser(userId);
  }


  newSupervisorSelected(open: boolean) {
    this.isNewSupervisorPanelOpen = open;
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
}
