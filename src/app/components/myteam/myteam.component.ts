import { Component, OnInit } from '@angular/core';
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
import { MessageModel } from '../../shared/interfaces/message.type';
import { take, filter } from 'rxjs/operators';

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
  showAssignTrainingDialog = false;

  trainingStatusColorHash = {
    uptodate: '#52c41a',
    pastdue: 'red'
  }
  allTrainingIdHash$: Observable<TrainingIdHash>;
  allTrainingIdHash: TrainingIdHash = {};
  assignableTrainings: TrainingModel[] = [];
  trainings: TrainingModel[] = [];
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;
  selectedUserId: string;
  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  myTeamIdHash: UserIdHash;
  myTeam: UserModel[] = [];
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
    jobTitle: ''
  }
  message: MessageModel;
  showUserTrainingModal = false;
  userIdSelected = '';
  selectedTrainingId = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService,
    private mailService: SendmailService,
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService
  ) {
    this.myTeamIdHash$ = this.userService.getMyTeamIdHashStream();
    this.allTrainingIdHash$ = this.trainingService.getAllTrainingHashStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.selectedUser$ = this.userService.getSelectedUserStream();
  }

  ngOnInit() {
    this.myTeamIdHash$.pipe(take(1)).subscribe(myTeamIdHash => {
      if (!myTeamIdHash) {
        return;
      }
      this.myTeamIdHash = myTeamIdHash;

      this.myTeam = Object.values(this.myTeamIdHash);

      if (this.myTeam.length > 0) {
        this.userIdSelected = this.myTeam[0]._id;
        this.userService.selectUser(this.myTeam[0]._id);
      }
    });
    this.myTeamIdHash$.subscribe(myTeamIdHash => {
      if (!myTeamIdHash) {
        return;
      }
      this.myTeamIdHash = myTeamIdHash;

      this.myTeam = Object.values(this.myTeamIdHash);

    });

    this.selectedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.userIdSelected = user._id;
      this.trainingService.selectTraining(null);
//      this.selectUser(user);
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
      this.allTrainingIdHash$.subscribe(allTrainingIdHash => {
        this.allTrainingIdHash = allTrainingIdHash;
        let trainings = Object.values(this.allTrainingIdHash);
        this.assignableTrainings = [];
        for (let training of trainings) {
          if (training.teamId === this.authenticatedUser.uid) {
            this.assignableTrainings.push(training);
          }
        }
      })

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
    this.userService.updateUser(this.authenticatedUser, false);
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
    if (!this.selectedTrainingId) {
      this.showUserTrainingModal = false;
      return;
    }
    console.log('handleAssignUserTraining', this.assignableTrainings, this.selectedUser);
    this.userTrainingService.assignTraining(this.userIdSelected, this.selectedTrainingId);
    this.showUserTrainingModal = false;
  }

  selectUser(userId) {
    this.userService.selectUser(userId);
  }

  confirmDelete(user: UserModel) {
    this.userService.deleteUser(user._id);
    this.userService.selectUser(user._id);
  }

  newSupervisorSelected(open: boolean) {
    this.isNewSupervisorPanelOpen = open;
  }

}
