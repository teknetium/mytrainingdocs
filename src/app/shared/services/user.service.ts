import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserTrainingService } from './userTraining.service';
import { SendmailService } from './sendmail.service';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserModel, UserFail, UserIdHash, OrgChartNode, UserBatchData, BuildOrgProgress } from '../interfaces/user.type';
import { Auth0ProfileModel } from '../interfaces/auth0Profile.type';
import { Router } from '@angular/router';
import { EventModel } from '../interfaces/event.type';
import { EventService } from './event.service';
import { JobTitleService } from './jobtitle.service';
import { TemplateMessageModel } from '../../shared/interfaces/message.type';
import * as cloneDeep from 'lodash/cloneDeep';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private myTeamIdHash: UserIdHash = {};
  private authenticatedUser: UserModel;

  // Writable streams
  private httpErrorBS$ = new BehaviorSubject<HttpErrorResponse>(null);
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
  private userFailBS$ = new BehaviorSubject<UserFail>(null);

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

  userFails: UserFail[] = [];

  nodes: any = [];
  userNode: OrgChartNode;
  uidReportChainHash = {};
  newBatchUserIndex = 0;
  newBatchUserData: UserBatchData[];
  newBatchUser: UserBatchData;
  batchUserAddedBS$ = new BehaviorSubject<UserModel>(null);
  batchUserFailedBS$ = new BehaviorSubject<UserBatchData>(null);

  orgProgress: BuildOrgProgress = {
    usersAdded: 0,
    usersProcessed: 0,
    usersTotal: 0,
    description: '',
    supervisorMatchFail: []
  }
  myOrgUserNames = [];
  reportChainNodeHash = {};
  myTeamIdIndexHash = {};

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private jobTitleService: JobTitleService,
    private userTrainingService: UserTrainingService,
    private sendmailService: SendmailService,
    private router: Router,
    private eventService: EventService,
  ) {
    this.action = 'init';

    this.authenticatedUserProfile$ = this.auth.getAuthenticatedUserProfileStream();
    this.authenticatedUserProfile$.subscribe((profile) => {
      this.getUserByUid(profile.uid).subscribe(
        user => {

          // This is the uid field is the user id from Auth0.  This is set for the initial supervisor registrant 
          this.authenticatedUser = user;
          //          this.getAllOrgUsers();
          if (this.authenticatedUser.jobTitle) {
            this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
          }
          this.authenticatedUserBS$.next(this.authenticatedUser);
          this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
          if (this.authenticatedUser.userType === 'supervisor') {
//            this.org = this.authenticatedUser.org;
            this.teamId = this.authenticatedUser.uid;
            this.loadData(this.authenticatedUser.org, null);
          }
        },
        err => {
          this.getUserByEmail(profile.email).subscribe(
            res => {
              res.uid = profile.uid;
              res.userStatus = 'active';
              res.emailVerified = true;
              this.updateUser(res, false);
              this.authenticatedUser = res;
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
                emailVerified: false,
                teamId: null,
                org: profile.email.substring(profile.email.indexOf('@') + 1),
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
                if (this.authenticatedUser.jobTitle) {
                  this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
                }
                this.authenticatedUserBS$.next(this.authenticatedUser);
                this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
                this.loadData(this.authenticatedUser.org, null);
              });
            }
          )
        });
    });
  }

  sendVerifyEmailMsg(toAddr, uid) {
    let message = <TemplateMessageModel>{
      to: toAddr,
      from: 'support@mytrainingdocs.com',
      templateId: 'd-5559cf461838417887b8ffd247983c92',
      dynamicTemplateData: {
        uid: uid
      },
    }
    this.sendmailService.sendTemplateMessage(message);
  }

  sendRegistrationMsg(toAddr, fromAddr) {
    let message = <TemplateMessageModel>{
      to: toAddr,
      from: fromAddr,
      templateId: 'd-2d4430d31eee4a929344c8aa05e4afc7',
      dynamicTemplateData: {
        email: toAddr
      },
    }
    this.sendmailService.sendTemplateMessage(message);
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
  loadData(org, userIdToSelect) {
    //    this.getTeam$(teamId).subscribe((userList) => {
    this.getOrg$(org).subscribe(userList => {
      console.log('loadData : users returned from getOrg$', userList);

      if (!userList) {
        userList = [];
      }

      userList = userList.concat(this.newUserList);
      console.log('loadData : after merging with this.newUserLst', userList);      

      this.myTeam = [];
      this.myTeamIdHash = {};
      this.allOrgUserHash = {};
      this.myOrgUserNames = [];

      let index = 0;
      for (let user of userList) {
        let fullName = user.firstName + ' ' + user.lastName;
        this.myOrgUserNames.push(fullName);
        if (user.teamId === this.authenticatedUser._id) {
          this.myTeamIdHash[user._id] = user;
          if (!this.myTeam.includes(user)) {
            this.myTeamIdIndexHash[user._id] = index++;
            this.myTeam.push(user);
          }
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
    console.log('BuildUserNode', this.allOrgUserHash);
    this.uidReportChainHash[userId] = reportChain;
    let user = this.allOrgUserHash[userId];
    if (!user) {
      console.log('buildUserNode ', userId, this.allOrgUserHash);
    }
    let userNode = <OrgChartNode>{
      name: user.firstName,
      cssClass: 'org-chart-node',
      image: '',
      title: '',
      extra: {
        uid: userId,
        reportChain: reportChain,
        peopleCnt: 0
      },
      childs: []
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

  getHttpErrorStream(): Observable<HttpErrorResponse> {
    return this.httpErrorBS$.asObservable();
  }

  getUserFailStream(): Observable<UserFail> {
    return this.userFailBS$.asObservable();
  }

  getOrgProgressStream(): Observable<BuildOrgProgress> {
    return this.buildOrgProgressBS$.asObservable();
  }

  setUserStatusPastDue(uid: string) {
    this.myTeamIdHash[uid].trainingStatus = 'pastDue';
//    this.myTeam[]
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

  createNewUsersFromBatch(batchUsers: UserBatchData[]) {

    let emailList = [];
    let batchUserFails: UserBatchData[] = [];
    let supervisorMatchFail = [];
    this.newTeamMember.org = this.authenticatedUser.org;
    this.fullNameHash[this.authenticatedUser.firstName + ' ' + this.authenticatedUser.lastName] = this.authenticatedUser;
    let batchCnt = 1;
    let _id = String(new Date().getTime());
    for (let batchUser of batchUsers) {
      if (emailList.includes(batchUser.email)) {
        batchUserFails.push(batchUser);
        continue;
      }
      emailList.push(batchUser.email);
      this.newTeamMember = cloneDeep(this.newTeamMember);
      this.newTeamMember.userType = 'individualContributor';
      this.newTeamMember._id = String(_id + '-' + batchCnt++);
      this.newTeamMember.firstName = batchUser.firstName;
      this.newTeamMember.lastName = batchUser.lastName;
      this.newTeamMember.email = batchUser.email;
      this.newTeamMember.jobTitle = batchUser.jobTitle;
      this.newTeamMember.trainingStatus = 'none';
      this.newTeamMember.teamAdmin = false;
      this.newTeamMember.userStatus = 'pending';
      this.newTeamMember.settings = {
        foo: 'test',
        showPageInfo: true,
        themeColor: {
          name: 'orange ',
          bgColor: 'orange',
          primary: 'white',
          secondary: '#c54f0a',
        }
      }
      this.newUserHash[this.newTeamMember._id] = batchUser;
      this.newUserIds.push(this.newTeamMember._id);
      this.newUserList.push(this.newTeamMember);
      this.fullNameHash[this.newTeamMember.firstName + ' ' + this.newTeamMember.lastName] = this.newTeamMember;
      this.allOrgUserHash[this.newTeamMember._id] = this.newTeamMember;
      console.log('add user ', this.newTeamMember.firstName + ' ' + this.newTeamMember.lastName);
    }
    for (let nUser of this.newUserList) {
      if (!this.fullNameHash[this.newUserHash[nUser._id].supervisorName]) {
        supervisorMatchFail.push(nUser._id);
        nUser.supervisorId = this.authenticatedUser._id;
        nUser.teamId = this.authenticatedUser._id;
        this.authenticatedUser.directReports.push(nUser._id);
      } else {
        this.fullNameHash[this.newUserHash[nUser._id].supervisorName].directReports.push(nUser._id);
        this.fullNameHash[this.newUserHash[nUser._id].supervisorName].userType = 'supervisor';
        nUser.supervisorId = this.fullNameHash[this.newUserHash[nUser._id].supervisorName]._id;
        nUser.teamId = this.fullNameHash[this.newUserHash[nUser._id].supervisorName]._id;
      }
    }
    let dbCnt = 0;
    for (let user of this.newUserList) {
      this.postUser$(user).subscribe(user => {
        dbCnt++;
        if (dbCnt === this.newUserList.length) {
          this.newUserList = [];
          this.loadData(this.authenticatedUser.org, null);
        }
      }, err => {
          
      });
    }
    this.updateUser(this.authenticatedUser, false);
  }

  createNewUser(user: UserModel, reload: boolean) {
    this.postUser$(user).subscribe(data => {
      this.authenticatedUser.directReports.push(data._id);
      let fullName = user.firstName + ' ' + user.lastName;
      this.myOrgUserNames.push(fullName);
      this.myOrgUserNameListBS$.next(this.myOrgUserNames);
      this.allOrgUserHash[user._id] = user;
      this.myTeamIdHash[user._id] = user;
      if (!this.myTeam.includes(user)) {
        this.myTeam.push(user);
      }
      this.myTeamBS$.next(this.myTeam);
      this.myOrgHashBS$.next(this.allOrgUserHash);
      this.myTeamIdHashBS$.next(this.myTeamIdHash);
      this.updateUser(this.authenticatedUser, false);

      this.buildOrgChart(this.authenticatedUser._id, false);
      if (data.jobTitle) {
        this.jobTitleService.addJobTitle(data.jobTitle);
      }

      this.sendRegistrationMsg(data.email, this.authenticatedUser.email);
/*
      if (reload) {
        this.loadData(this.authenticatedUser._id, data._id);
      }
      */
    },
      err => {
        console.log('postUser$ ', err);
        let userFail = {
          user: user,
          errorType: 'http',
          message: err
        }

        this.userFailBS$.next(userFail);
    })
  }

  deleteUser(id: string) {
    this.deleteUser$(id).subscribe(data => {
      let deletedUser = this.allOrgUserHash[id];
      this.allOrgUserHash[deletedUser.supervisorId].directReports.splice(this.allOrgUserHash[deletedUser.supervisorId].directReports.indexOf(id, 1));
      delete this.allOrgUserHash[id];
      delete this.myTeamIdHash[id];
      this.myTeam.splice(this.myTeam.indexOf(deletedUser), 1);
      this.myOrgUserNames.splice(this.myOrgUserNames.indexOf(deletedUser.firstName + ' ' + deletedUser.lastName));

      this.myTeamBS$.next(this.myTeam);
      this.myOrgUserNameListBS$.next(this.myOrgUserNames);
      this.myTeamIdHashBS$.next(this.myTeamIdHash);
      this.myOrgHashBS$.next(this.allOrgUserHash);
//      this.loadData(this.teamId, null);
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
    const errorMsg = err.error.message || 'Error: Unable to complete request.';
    console.log("_handleError", err);
//    this.httpErrorBS$.next(err);
    if (err.error.message && err.error.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
