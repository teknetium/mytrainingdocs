import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TrainingService } from '../../shared/services/training.service';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  userTypes = [
    {
      id: 'individualContributor',
      name: 'Individual Contributor',
      iconClass: 'fal fa-fw fa-user',
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      iconClass: 'fal fa-fw fa-user-tie',
    },
    {
      id: 'volunteer',
      name: 'Volunteer',
      iconClass: 'fal fa-fw fa-user-cowboy',
    },
    {
      id: 'customer',
      name: 'Customer',
      iconClass: 'fal fa-fw fa-user-crown',
    },
  ];

  userTypeFilterHash = {
    individualContributor: true,
    supervisor: true,
    volunteer: false,
    customer: false
  };

  trainingStatus = [
    {
      status: 'uptodate',
      color: 'green'
    },
    {
      status: 'pastdue',
      color: 'red'
    },
  ];
  userTypeHash: {} = {};
  trainingStatusHash: {} = {};

  isAuthenticated$: Observable<boolean>;
  isAuthenticated = false;
  authenticatedUser$: Observable<UserModel>;
  myTeam$: Observable<UserModel[]>;
  myTeamCnt$: Observable<number>;
  selectedUser$: Observable<UserModel>;
  selectedUserIndex$: Observable<number>;
  myTeam: UserModel[];
  showSelectedIndexFeedback$: Observable<boolean>;

  showInfoPanel = true;
  filterTooltipText = '';
  iconColor: string;
  iconClass = '';
  authenticatedUser: UserModel;
  trainingsForSelect$: Observable<{ label: string, value: string }[]>;
  fallbackIcon = 'fas fa-user';
  icon: string;
  status$: Observable<{ color: string, msg: string }>;
  selectedUserId: string;
  selectedUser: UserModel;
  newUser: UserModel;
  statusType = 'success';
  saveButtonLabel = 'Save';
  deleteButtonLabel = 'Delete';
  userTypeValue = 'employee';
  action$: Observable<string>;
  saveNeeded = false;
  isConfirmDeleteModalVisible = false;
  userToDelete: string;
  disableDelete = false;
  action = '';
  nameStr = '';
  userHash = {};
  fullName: string;
  emailUpdated = false;
  showNewUserModal = false;
  userStatus = 'newUser';
  view = 'card';

  newTeamMember: UserModel = {
    _id: null,
    teamId: null,
    firstName: '',
    lastName: '',
    email: '',
    org: '',
    adminUp: false,
    userType: 'individualContributor',
    uid: '',
    userStatus: 'pending',
    trainingStatus: 'uptodate',
    profilePicUrl: '',
    supervisorId: null,
    jobTitle: ''
  }

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private trainingService: TrainingService,
    private router: Router,
    private location: Location) {

    this.selectedUser$ = this.userService.getSelectedUserStream();

    this.isAuthenticated$ = this.auth.getIsAuthenticatedStream();
  }


  ngOnInit() {
    this.isAuthenticated$.subscribe((value) => {
      this.isAuthenticated = value;
    });
    if (!this.auth.isLoggedIn()) {
      this.auth.login();
    }

    this.selectedUserIndex$ = this.userService.getSelectedUserIndexStream();
    //    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.myTeam$ = this.userService.getMyTeamStream();
    this.myTeam$.subscribe(userList => {
      this.myTeam = userList;

      for (const user of this.myTeam) {
        this.userHash[user._id] = user;
      }
    });

    for (const userType of this.userTypes) {
      this.userTypeHash[userType.id] = userType;
    }

    for (const item of this.trainingStatus) {
      this.trainingStatusHash[item.status] = item;
    }

    for (const key of Object.keys(this.userTypeFilterHash)) {
      if (this.userTypeFilterHash[key]) {
        this.filterTooltipText += key + ' - ' + (this.userTypeFilterHash[key] ? 'yes' : 'no');
      }
    }

    this.selectedUser$.subscribe((item) => {
      if (item) {
        this.selectedUserId = item._id;

        // Here we clone the object so we are not fucking with the actual selected object
        this.selectedUser = Object.assign({}, item);
      }
    });
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.authenticatedUser$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.newTeamMember.teamId = this.authenticatedUser.uid;
      this.newTeamMember.supervisorId = this.authenticatedUser.uid;
      this.newTeamMember._id = String(new Date().getTime());
    });

    for (const userType of this.userTypes) {
      this.userTypeHash[userType.name] = userType;
    }

    for (const item of this.trainingStatus) {
      this.trainingStatusHash[item.status] = item;
    }
    this.action$ = this.userService.getActionStream();
    this.action$.subscribe(data => {
      this.action = data;
      if (this.action === 'new') {
        this.disableDelete = true;
      } else {
        this.disableDelete = false;
      }
    });

  }

  viewChanged(event) {
    console.log('viewChanged', event);
  }

  selectFilter(type) {
    this.userTypeFilterHash[type] = !this.userTypeFilterHash[type];
    this.filterTooltipText = '';
    for (const key of Object.keys(this.userTypeFilterHash)) {
      this.filterTooltipText += key + ' - ' + this.userTypeFilterHash[key] + '\n';
    }
  }

  selectUser(index) {
    this.userService.selectUser(index);
  }

  postNewUserForm() {
    this.showNewUserModal = true;
  }

  updateSelectedUser(user: UserModel) {
    this.selectedUser = user;
  }
  /*
    showDeleteModal($event): void {
  
      $event.preventDefault();
      $event.stopPropagation();
  
      this.isConfirmDeleteModalVisible = true;
      this.userToDelete = this.selectedUser._id;
    }
    */

  createNewUser(user) {
    this.userService.createNewUser(user);
    this.emailUpdated = false;
  }

  fullNameChanged(user, val) {
    const nameArray = val.split(' ');
    this.selectedUser.firstName = nameArray[0];
    this.selectedUser.lastName = nameArray[1];
    if (user.userStatus !== 'new-user') {
      this.userService.updateUser(user);
    }
  }

  emailChanged(user, val) {
    this.selectedUser.email = val;
    this.emailUpdated = true;
  }

  deleteUserConfirm(): void {
    this.userService.deleteUser(this.selectedUser._id);
  }

  handleCancel(): void {
    this.showNewUserModal = false;
  }

  handleAddUser() {
    console.log('handleAddUser', this.newTeamMember);
    this.userService.updateUser(this.authenticatedUser);
    this.userService.createNewUser(this.newTeamMember);
    this.showNewUserModal = false;
  }

  cancelNewUser() {
    this.showNewUserModal = false;
  }

}
