import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { EventService } from '../../shared/services/event.service';
import { TrainingService } from '../../shared/services/training.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.model';
import { EventModel } from '../../shared/interfaces/event.type';
import { User } from 'src/app/shared/interfaces/user.type';
import { TrainingModel } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';

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

  userTypeIconHash = {
    individualContributor: 'fas fa-fw fa-user',
    supervisor: 'fas fa-fw fa-user-tie',
    volunteer: 'fas fa-fw fa-user-cowboy',
    customer: 'fas fa-fw fa-user-crown',
    candidate: 'fas fa-fw fa-user-graduate'
  }
  includeNewSupervisorsTeam = false;
  isNewSupervisorPanelOpen = false;

  trainingStatusColorHash = {
    uptodate: '#52c41a',
    pastdue: 'red'
  }
  selectedUserBS$ = new BehaviorSubject<UserModel>(null);
  selectedUser$: Observable<UserModel> = this.selectedUserBS$.asObservable();
  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  myTeam: UserModel[];
  myTeam$: Observable<UserModel[]>;
  trainingCnt$: Observable<number>;
  userHash = {};
  showNewUserModal = false;
  supervisorSelected = true;
  newTeamMember: UserModel = {
    _id: '',
    teamId: '',
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
  userIndexSelected = -1;
  myTeamHelpPanelIsVisible = true;
  myTeamTrainingsHelpPanelIsVisible = true;
  currentTab = 'myTeamTrainings';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService,
    private trainingService: TrainingService
  ) {
    this.myTeam$ = this.userService.getMyTeamStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.trainingCnt$ = this.trainingService.getAllTrainingCntObservable();
  }

  ngOnInit() {
    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.newTeamMember.teamId = this.authenticatedUser.uid;
      this.newTeamMember.supervisorId = this.authenticatedUser.uid;
      this.newTeamMember._id = String(new Date().getTime());
    })
    this.myTeam$.subscribe(userList => {
      console.log("myTeam$ subscribe", userList);
      this.myTeam = userList;

      for (const user of this.myTeam) {
        this.userHash[user._id] = user;
      }
    });

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
    this.showNewUserModal = false;
    this.newTeamMember.firstName = '';
    this.newTeamMember.lastName = '';
    this.newTeamMember.email = '';
    this.newTeamMember.adminUp = false;
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
    console.log('myTeam.confirmDelete')
    this.userService.deleteUser(this.myTeam[this.userIndexSelected]._id);
    this.selectedUserBS$.next(null);
    this.userIndexSelected = -1;
    this.supervisorSelected = false;
  }

  createNewTraining() {
    this.trainingService.addNewTraining();
  }

  newSupervisorSelected(open: boolean) {
    this.isNewSupervisorPanelOpen = open;
  }

  setCurrentTab(tabName) {
    this.currentTab = tabName;
  }
}
