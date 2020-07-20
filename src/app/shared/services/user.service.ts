import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserTrainingService } from './userTraining.service';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserModel, UserIdHash, OrgChartNode, UserBatchData, BuildOrgProgress } from '../interfaces/user.type';
import { Auth0ProfileModel } from '../interfaces/auth0Profile.type';
import { Router } from '@angular/router';
import { EventModel } from '../interfaces/event.type';
import { EventService } from './event.service';
import { JobTitleService } from './jobtitle.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private myTeamIdHash: UserIdHash = {};
  private authenticatedUser: UserModel;

  // Writable streams
  private myOrgUserNameListBS$ = new BehaviorSubject<string[]>([]);
  private myOrgBS$ = new BehaviorSubject<OrgChartNode[]>(null);
  private buildOrgProgressBS$ = new BehaviorSubject<BuildOrgProgress>(null);
  private uidReportChainHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private authenticatedUserBS$ = new BehaviorSubject<UserModel>(null);
  private myTeamIdHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private myOrgHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private myTeamBS$ = new BehaviorSubject<UserModel[]>([]);
  private myTeamCntBS$ = new BehaviorSubject<number>(0);
  private selectedUserBS$ = new BehaviorSubject<UserModel>(null);
  private newUserBS$ = new BehaviorSubject<UserModel>(null);
  private allOrgUserHash: UserIdHash = {};
  private myTeam: UserModel[] = [];
  private statusObj;

  userTypeIconHash = {
    supervisor: 'fad fa-user-tie',
    individualContributor: 'fad fa-user',
    volunteer: 'fad fa-user-cowboy',
    customer: 'fad fa-user-crown'
  }

  // Observables
  private authenticatedUserProfile$: Observable<Auth0ProfileModel>;

  private action: string;
  private teamId;

  authProfile: Auth0ProfileModel;
  batchCount = 0;
  org = '';
  newUserHash = {};
  fullNameHash = <UserModel>{};
  newUserIds = [];
  supervisorName: string;
  supervisorObj: UserModel;
  newUserList: UserModel[] = [];

  newTeamMember = <UserModel>{
    userType: 'individualContributor',
    _id: undefined,
    firstName: '',
    lastName: '',
    email: '',
    org: '',
    directReports: [],
  };

  nodes: any = [];
  userNode: OrgChartNode;
  uidReportChainHash = {};
  newUserIndex = 0;
  newUserData: UserBatchData[];
  newUser: UserBatchData;

  orgProgress: BuildOrgProgress = {
    usersAdded: 0,
    usersProcessed: 0,
    usersTotal: 0,
    description: '',
    supervisorMatchFail: []
  }
  myOrgUserNames = [];
  reportChainNodeHash = {};

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private jobTitleService: JobTitleService,
    private userTrainingService: UserTrainingService,
    private router: Router,
    private eventService: EventService,
  ) {
    this.action = 'init';

    this.authenticatedUserProfile$ = this.auth.getAuthenticatedUserProfileStream();
    this.authenticatedUserProfile$.subscribe((profile) => {
      this.getUserByUid(profile.uid).subscribe(
        user => {
          this.authenticatedUser = user;
          //          this.getAllOrgUsers();
          if (this.authenticatedUser.jobTitle) {
            this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
          }
          this.authenticatedUserBS$.next(this.authenticatedUser);
          this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
          this.logLoginEvent();
          if (this.authenticatedUser.userType === 'supervisor') {
            this.teamId = this.authenticatedUser.uid;
            this.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
            this.loadData(this.teamId, null);
          }

        },
        err => {
          this.getUserByEmail(profile.email).subscribe(
            res => {
              res.uid = profile.uid;
              res.userStatus = 'active';
              this.updateUser(res, true);
              this.authenticatedUser = res;
              //              this.getAllOrgUsers();
              if (this.authenticatedUser.jobTitle) {
                this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
              }
              this.authenticatedUserBS$.next(this.authenticatedUser);
              this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
            },
            err => {
              this.authenticatedUser = <UserModel>{
                _id: profile.uid,
                uid: profile.uid,
                userType: 'supervisor',
                firstName: '',
                lastName: '',
                email: profile.email,
                teamId: null,
                org: profile.email.substring(profile.email.indexOf('@' + 1)),
                teamAdmin: false,
                orgAdmin: false,
                appAdmin: false,
                userStatus: 'active',
                trainingStatus: 'none',
                jobTitle: '',
                profilePicUrl: '',
                supervisorId: null,
                directReports: [],
                settings: {
                  foo: 'test',
                  showPageInfo: true,
                  themeColor: {
                    name: 'orange ',
                    bgColor: 'orange',
                    primary: 'white',
                    secondary: '#c54f0a',
                  }
                }
              }

              this.postUser$(this.authenticatedUser).subscribe((data) => {
                this.authenticatedUser = data;
                this.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
                //                this.getAllOrgUsers();
                if (this.authenticatedUser.jobTitle) {
                  this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
                }
                this.authenticatedUserBS$.next(this.authenticatedUser);
                this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
                this.loadData(data._id, null);
              });
            }
          )
        });
    });
  }

  logLoginEvent() {
    let now = new Date().getTime();
    let loginEvent = <EventModel>{
      _id: String(new Date().getTime()),
      title: 'Login Event',
      type: 'loginSession',
      userId: this.authenticatedUser._id,
      teamId: this.authenticatedUser.teamId,
      desc: 'user login',
      mark: {
        iconClass: this.userTypeIconHash[this.authenticatedUser.userType],
        iconColor: 'purple',
        useBadge: false,
        badgeColor: 'blue'
      },
      creationDate: now,
      actionDate: now,
    }

    this.eventService.addEvent(loginEvent);

  }
  /*
    getAllOrgUsers() {
      this.getOrg$(this.authenticatedUser.org).subscribe(userList => {
        if (!userList) {
          return;
        }
        this.myOrgUsers = userList;
        for (let user of userList) {
          this.allOrgUserHash[user._id] = user;
          if (user.jobTitle) {
            this.jobTitleService.addJobTitle(user.jobTitle);
          }
        }
      })
    }
  */
  loadData(teamId, userIdToSelect) {
//    this.getTeam$(teamId).subscribe((userList) => {
    this.getOrg$(this.org).subscribe(userList => {

      if (!userList) {
        return;
      }
      this.myTeam = [];
      this.myTeamIdHash = {};
      this.allOrgUserHash = {};
      this.myOrgUserNames = [];
      for (let user of userList) {
        this.myOrgUserNames.push(user.firstName + ' ' + user.lastName);
        if (user.teamId === this.authenticatedUser._id) {
          this.myTeamIdHash[user._id] = user;
          this.myTeam.push(user);
        }
        this.allOrgUserHash[user._id] = user;
        if (user.jobTitle) {
          this.jobTitleService.addJobTitle(user.jobTitle);
        }
      }
      //        this.userTrainingService.initUserTrainingsForUser(user._id);

      this.userTrainingService.getUTForTeam(this.teamId);

      this.myTeamIdHash[this.authenticatedUser._id] = this.authenticatedUser;
      this.myTeam.push(this.authenticatedUser);
      this.allOrgUserHash[this.authenticatedUser._id] = this.authenticatedUser;
      this.myTeamBS$.next(this.myTeam);
      this.myOrgHashBS$.next(this.allOrgUserHash);

      this.myOrgUserNameListBS$.next(this.myOrgUserNames);

      //      this.myTeamCntBS$.next(Object.keys(this.myTeamIdHash).length);

      this.myTeamIdHashBS$.next(this.myTeamIdHash);
      if (userIdToSelect) {
        this.selectUser(userIdToSelect);
      }

      this.nodes = [];
      let rootNode;
      this.buildOrgChart(this.authenticatedUser._id, false);
      this.nodes.push(rootNode);
      this.myOrgBS$.next(this.nodes);
      this
    });
  }

  buildOrgChart(uid: string, subChart: boolean) {
    if (!this.allOrgUserHash[uid]) {
      return;
    }
    this.nodes = [];
    let rootNode: OrgChartNode = {
      name: this.allOrgUserHash[uid].firstName + ' ' + this.allOrgUserHash[uid].lastName,
      cssClass: 'org-chart-top',
      image: '',
      extra: {
        uid: uid,
        reportChain: [],
        peopleCnt: 0,
      },
      title: this.allOrgUserHash[uid].jobTitle,
      childs: []
    };

    let reportChain = [uid];
    this.reportChainNodeHash[uid] = rootNode;

    for (let dR of this.allOrgUserHash[uid].directReports) {
      rootNode.childs.push(this.buildUserNode(dR, Object.assign([], reportChain)));
    }

    this.nodes.push(rootNode);
    this.myOrgBS$.next(this.nodes);
    if (!subChart) {
      this.uidReportChainHashBS$.next(Object.assign({}, this.uidReportChainHash));
    }
  }

  buildUserNode(userId, reportChain): OrgChartNode {
    this.uidReportChainHash[userId] = reportChain;
    let user = this.allOrgUserHash[userId];
    let userNode = <OrgChartNode>{};
//    userNode.name = user.firstName + ' ' + user.lastName;
    userNode.name = user.firstName;
    userNode.cssClass = 'org-chart-node';
    userNode.image = '';
    userNode.extra = {
      uid: userId,
      reportChain: reportChain,
      peopleCnt: 0
    }

    this.reportChainNodeHash[userId] = userNode;
//    userNode.title = user.jobTitle;
    
    for (let uid of reportChain) {
      this.reportChainNodeHash[uid].extra.peopleCnt++;
    }

    userNode.childs = [];
    let newReportChain = Object.assign([], reportChain);
    newReportChain.push(userId);
    for (let dR of user.directReports) {
      userNode.extra.peopleCnt++;
      userNode.childs.push(this.buildUserNode(dR, Object.assign([], newReportChain)));
    }
    return userNode;
  }

  getOrgProgressStream(): Observable<BuildOrgProgress> {
    return this.buildOrgProgressBS$.asObservable();
  }

  setUserStatusPastDue(uid: string) {
    this.myTeamIdHash[uid].trainingStatus = 'pastDue';
    this.updateUser(this.myTeamIdHash[uid], false);
  }

  setUserStatusUpToDate(uid: string) {
    this.myTeamIdHash[uid].trainingStatus = 'upToDate';
    this.updateUser(this.myTeamIdHash[uid], false);
  }

  setUserStatusNone(uid: string) {
    this.myTeamIdHash[uid].trainingStatus = 'none';
    this.updateUser(this.myTeamIdHash[uid], false);
  }

  processNewUser(newUser:UserModel) {
    this.newUserList.push(newUser);
    this.fullNameHash[newUser.firstName + ' ' + newUser.lastName] = newUser;
    this.allOrgUserHash[newUser._id] = newUser;

    this.orgProgress.usersAdded++;
    this.buildOrgProgressBS$.next(this.orgProgress);

    if (this.newUserIndex < this.batchCount - 1) {
      this.newUserIndex++;
      this.newUser = this.newUserData[this.newUserIndex];

      this.addUserFromBatch(this.newUser);

    } else if (this.newUserIndex === this.batchCount - 1) {
      this.orgProgress.description = 'Building Organization';
      for (let nUser of this.newUserList) {
        if (!this.fullNameHash[this.newUserHash[nUser._id].supervisorName]) {
          this.orgProgress.supervisorMatchFail.push(nUser._id);
          nUser.userStatus = 'bulk-add-fail';
          nUser.supervisorId = this.authenticatedUser._id;
          nUser.teamId = this.authenticatedUser._id;
          this.authenticatedUser.directReports.push(nUser._id);
        } else {
          this.fullNameHash[this.newUserHash[nUser._id].supervisorName].directReports.push(nUser._id);
          this.fullNameHash[this.newUserHash[nUser._id].supervisorName].userType = 'supervisor';
          nUser.supervisorId = this.fullNameHash[this.newUserHash[nUser._id].supervisorName]._id;
          nUser.teamId = this.fullNameHash[this.newUserHash[nUser._id].supervisorName]._id;
        }
        this.orgProgress.usersProcessed++;
        this.buildOrgProgressBS$.next(this.orgProgress);
      }
      let saveCnt = 0;
      let allUsers = Object.values(this.fullNameHash);
      for (let nUser of allUsers) {
        this.putUser$(nUser).subscribe(user => {
          saveCnt++;
          if (saveCnt === this.newUserList.length) {
            this.loadData(this.authenticatedUser._id, null);
          }
        })
      }
    }
  }

  addUserFromBatch(user) {
    this.newTeamMember.userType = 'individualContributor';
    this.newTeamMember._id = String(new Date().getTime());
    this.newTeamMember.firstName = user.firstName;
    this.newTeamMember.lastName = user.lastName;
    this.newTeamMember.email = user.email;
    this.newTeamMember.jobTitle = user.jobTitle;
    this.newTeamMember.trainingStatus = 'none';
    this.newTeamMember.teamAdmin = false;
    this.newTeamMember.userStatus = 'pending';
    this.newUserHash[this.newTeamMember._id] = user;
    this.newUserIds.push(this.newTeamMember._id);

    this.postUser$(this.newTeamMember).subscribe(newUser => {
      this.newUserBS$.next(newUser);
      this.processNewUser(newUser);
    });    
  }

  createNewUsersFromBatch(userData: UserBatchData[]) {
    this.newTeamMember.org = this.authenticatedUser.email.substring(this.authenticatedUser.email.indexOf('@') + 1);
    this.fullNameHash[this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName] = this.authenticatedUser;
    this.newUserData = userData;
    this.batchCount = this.newUserData.length;
    this.orgProgress.usersTotal = this.batchCount;
    this.orgProgress.description = "Creating user accounts";
    this.buildOrgProgressBS$.next(this.orgProgress);

    this.newUserIndex = 0;
    this.newUser = this.newUserData[this.newUserIndex];

    this.addUserFromBatch(this.newUser);
  }
    
  createNewUser(user: UserModel, reload: boolean) {
    this.postUser$(user).subscribe(data => {
      this.authenticatedUser.directReports.push(data._id);
      this.updateUser(this.authenticatedUser, true);

      if (reload) {
        this.loadData(this.authenticatedUser._id, data._id);
      }
    })
  }

  deleteUser(id: string) {
    this.deleteUser$(id).subscribe(data => {
      this.loadData(this.teamId, null);
    });
  }

  getUIDReportChainHashStream(): Observable<UserIdHash> {
    return this.uidReportChainHashBS$.asObservable();
  }

  getOrgHashStream(): Observable<UserIdHash> {
    return this.myOrgHashBS$.asObservable();
  }

  getSelectedUserStream(): Observable<UserModel> {
    return this.selectedUserBS$.asObservable();
  }

  selectAuthenticatedUser() {
    this.selectedUserBS$.next(this.authenticatedUser);
  }

  selectUser(uid: string) {
    if (!uid) {
      this.selectedUserBS$.next(null);
    } else {
      this.selectedUserBS$.next(this.myTeamIdHash[uid]);
    }
    this.buildOrgChart(uid, true);
  }

  updateUser(user: UserModel, reload: boolean) {
    this.action = 'save';
    this.putUser$(user).subscribe((updatedUser) => {
      console.log('updateUser', updatedUser);
      if (reload) {
        this.loadData(this.teamId, user._id);
      }
    });
  }

  statusCheck() {
    this.statusCheck$(this.authenticatedUser._id).subscribe(statusObj => {
      this.loadData(this.authenticatedUser._id, null);
    })
  }

  getMyOrgUserNameListStream(): Observable<string[]> {
    return this.myOrgUserNameListBS$.asObservable();
  }

  getMyTeamIdHashStream(): Observable<UserIdHash> {
    return this.myTeamIdHashBS$.asObservable();
  }

  getMyTeamCntStream(): Observable<number> {
    return this.myTeamCntBS$.asObservable();
  }

  getMyOrgStream(): Observable<OrgChartNode[]> {
    return this.myOrgBS$.asObservable();
  }

  getMyTeamStream(): Observable<UserModel[]> {
    return this.myTeamBS$.asObservable();
  }

  getAuthenticatedUserStream(): Observable<UserModel> {
    return this.authenticatedUserBS$.asObservable();
  }

  getNewUserStream(): Observable<UserModel> {
    return this.newUserBS$.asObservable();
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  // POST new User (login required)
  postUser$(user: UserModel): Observable<UserModel> {
    return this.http
      .post<UserModel>(`${ENV.BASE_API}user/new/`, user, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  activateUser(email: string) {
    this.getUserByEmail(email).subscribe(user => {
      user.userStatus = 'active';
      this.putUser$(user).subscribe(updatedUser => {
        console.log('set userStatus to active');
      })
    })
  }

  //
  getUser$(userId: string): Observable<UserModel> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}user/${userId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  getUserByEmail(email: string): Observable<UserModel> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}user/email/${email}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  getUserByUid(uid: string): Observable<UserModel> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}user/uid/${uid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  /*
    getAllUsers$(teamId: string): Observable<UserModel[]> {
      return this.http
        .get<UserModel>(`${ENV.BASE_API}users/${teamId}`, {
          headers: new HttpHeaders().set('Authorization', this._authHeader)
        })
        .pipe(
          catchError((error) => this._handleError(error))
        );
    }
    */


  getTeam$(teamId: string): Observable<UserModel[]> {
    return this.http
      .get<UserModel[]>(`${ENV.BASE_API}users/${teamId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  getOrg$(org: string): Observable<UserModel[]> {
    return this.http
      .get<UserModel[]>(`${ENV.BASE_API}users/org/${org}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  statusCheck$(teamId: string): Observable<{}> {
    return this.http
      .get(`/api/daily/usertrainingstatuscheck`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  putUser$(user: UserModel): Observable<UserModel> {
    return this.http
      .put<UserModel>(`${ENV.BASE_API}users/${user._id}`, user, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  deleteUser$(userId: string): Observable<{}> {
    return this.http
      .delete(`${ENV.BASE_API}users/${userId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
