import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { TrainingService } from '../../shared/services/training.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.model';
import { EventModel } from '../../shared/interfaces/event.type';
import { User } from 'src/app/shared/interfaces/user.type';
import { TrainingModel } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SendmailService } from '../../shared/services/sendmail.service';
import { MessageModel } from '../../shared/interfaces/message.type';
import { UserTrainingModel } from '../../shared/interfaces/userTraining.type';


@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.css'],
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

  sub1: Subscription;
  sub2: Subscription;
  sub3: Subscription;
  sub4: Subscription;
  sub5: Subscription;

  userTypeIconHash = {
    individualContributor: 'fas fa-fw fa-user',
    supervisor: 'fas fa-fw fa-user-tie',
    volunteer: 'fas fa-fw fa-user-cowboy',
    customer: 'fas fa-fw fa-user-crown',
    candidate: 'fas fa-fw fa-user-graduate'
  }
  includeNewSupervisorsTeam = false;
  isNewSupervisorPanelOpen = false;
  showAssignTrainingDialog = false;
  userTrainings$: Observable<UserTrainingModel[]>;
  userTrainings: UserTrainingModel[] = [];

  trainingStatusColorHash = {
    uptodate: '#52c41a',
    pastdue: 'red'
  }
  selectedUserBS$ = new BehaviorSubject<UserModel>(null);
  selectedUser$: Observable<UserModel> = this.selectedUserBS$.asObservable();
  selectedUser: UserModel;
  trainings$: Observable<TrainingModel[]>;
  trainings: TrainingModel[] = [];
  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  myTeam: UserModel[];
  myTeam$: Observable<UserModel[]>;
  trainingCnt$: Observable<number>;
  userHash = {};
  trainingIdHash = {};
  showNewUserModal = false;
  supervisorSelected = true;
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
    jobTitle: ''
  }
  message: MessageModel;
  userIndexSelected = -1;
  myTeamHelpPanelIsVisible = true;
  myTeamTrainingsHelpPanelIsVisible = true;
  currentTab = 'myTeamTrainings';
  assignmentList: string[] = [];
  showUserTrainingModal = false;
  selectedTrainingIndex = -1;
  statusIconHash = {
    upToDate: {
      icon: 'calendar',
      color: 'green'
    },
    pastDue: {
      icon: 'close-circle',
      color: 'red'
    },
    completed: {
      icon: 'check-circle',
      color: 'blue'
    }
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService,
    private mailService: SendmailService,
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService
  ) {
    this.myTeam$ = this.userService.getMyTeamStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.trainingCnt$ = this.trainingService.getAllTrainingCntObservable();
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();

  }

  ngOnInit() {
    this.sub1 = this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.newTeamMember.teamId = this.authenticatedUser.uid;
      this.newTeamMember.supervisorId = this.authenticatedUser.uid;
      this.newTeamMember.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@' + 1));
      this.newTeamMember._id = String(new Date().getTime());
    })
    this.sub2 = this.myTeam$.subscribe(userList => {
      if (!userList) {
        return;
      }
      this.myTeam = userList;

      for (const user of this.myTeam) {
        this.userHash[user._id] = user;
      }
    });

    this.sub3 = this.trainings$.subscribe(trainings => {
      this.trainings = trainings;
      for (const training of this.trainings) {
        this.trainingIdHash[training._id] = training;
      }
    });

    this.sub4 = this.selectedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.selectedUser = user;
      this.userTrainingService.loadTrainingsForUser(this.selectedUser._id);
    });

    this.sub5 = this.userTrainings$.subscribe(userTrainingList => {
      this.userTrainings = userTrainingList;
    })

  }

  addUser() {
    this.showNewUserModal = true;
  }

  handleCancel(): void {
    this.showNewUserModal = false;
  }

  handleAddUser() {
    console.log('handleAddUser', this.newTeamMember);
    this.userService.updateUser(this.authenticatedUser);
    this.userService.createNewUser(this.newTeamMember);
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

  handleCancelUserTraining() {
    this.showUserTrainingModal = false;
  }

  handleAssignUserTraining() {
    this.userTrainingService.assignTraining(this.selectedUser._id, this.trainings[this.selectedTrainingIndex]._id);
    this.showUserTrainingModal = false;
  }

  selectUser(index) {
    if (index === -1) {
      this.supervisorSelected = true;
      this.userIndexSelected = index;
    } else {
      this.supervisorSelected = false;
      this.userIndexSelected = index;
      this.selectedUserBS$.next(this.myTeam[index]);
    }
  }
  
  confirmDelete() {
    this.userService.deleteUser(this.myTeam[this.userIndexSelected]._id);
    this.selectedUserBS$.next(null);
    this.userIndexSelected = -1;
    this.supervisorSelected = false;
  }

  confirmDeleteUserTraining(index) {
    this.userTrainingService.deleteUserTraining(this.userTrainings[index]._id, this.selectedUser._id)
  }

  createNewTraining() {
    this.trainingService.addNewTraining();
  }

  assignTrainings() {
//    this.userTrainingService.assignTrainings();

  }

  newSupervisorSelected(open: boolean) {
    this.isNewSupervisorPanelOpen = open;
  }

  setCurrentTab(tabName) {
    this.currentTab = tabName;
  }

  selectTrainingForAssignment(index) {
    this.selectedTrainingIndex = index;
    this.assignmentList.push(this.trainings[index]._id);
  }

  deleteUserTraining(id) {
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    this.sub4.unsubscribe();
    this.sub5.unsubscribe();
  }
}
