import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserTrainingService } from './userTraining.service';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserModel, UserIdHash } from '../interfaces/user.type';
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
  private authenticatedUserBS$ = new BehaviorSubject<UserModel>(null);
  private myTeamIdHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private myTeamBS$ = new BehaviorSubject<UserModel[]>([]);
  private myTeamCntBS$ = new BehaviorSubject<number>(0);
  private selectedUserBS$ = new BehaviorSubject<UserModel>(null);
  private newUserBS$ = new BehaviorSubject<UserModel>(null);
  private allOrgUserHash: UserIdHash = {};
  private myTeam: UserModel[];
  private myOrgUsers: UserModel[];

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
          } else {
            this.teamId = this.authenticatedUser.teamId;
          }
          this.loadData(this.teamId);

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
                userStatus: 'new-supervisor-without-team',
                trainingStatus: 'upToDate',
                jobTitle: '',
                profilePicUrl: '',
                supervisorId: null,
                settings: {
                  foo: 'test',
                  showPageInfo: true,
                  themeColor: {
                    name: 'grey',
                    primary: 'white',
                    secondary: '#999999',
                    bgColor: '#e9e9e9',
                  }
                }
              }

              this.postUser$(this.authenticatedUser).subscribe((data) => {
                this.authenticatedUser = data;
//                this.getAllOrgUsers();
                if (this.authenticatedUser.jobTitle) {
                  this.jobTitleService.addJobTitle(this.authenticatedUser.jobTitle);
                }
                this.authenticatedUserBS$.next(this.authenticatedUser);
                this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
                this.loadData(data._id);
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
  loadData(teamId) {
    this.getTeam$(teamId).subscribe((userList) => {
      if (!userList) {
        return;
      }
      console.log('UserService    loadData', userList);
      this.myTeam = userList;
      this.myTeamIdHash = {};
      for (let user of userList) {
        this.myTeamIdHash[user._id] = user;
        this.userTrainingService.initUserTrainingsForUser(user._id);
        if (user.jobTitle) {
          this.jobTitleService.addJobTitle(user.jobTitle);
        }
      }


      this.myTeamIdHash[this.authenticatedUser._id] = this.authenticatedUser;
      this.myTeam.push(this.authenticatedUser);
      this.myTeamBS$.next(this.myTeam);
      
//      this.myTeamCntBS$.next(Object.keys(this.myTeamIdHash).length);

      console.log('UserService:loadData', userList, this.authenticatedUser._id, this.myTeamIdHash);
      this.myTeamIdHashBS$.next(this.myTeamIdHash);
    });

  }

  createNewUser(user: UserModel) {
    this.postUser$(user).subscribe(data => {
      /*
      this.myTeam.push(data);
      this.myTeamBS$.next(this.myTeam);
      */

      this.loadData(this.authenticatedUser._id);
    })
  }

  deleteUser(id: string) {
    this.deleteUser$(id).subscribe(data => {
      this.loadData(this.teamId);
    });
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
  }

  updateUser(user: UserModel, reload: boolean) {
    this.action = 'save';
    this.putUser$(user).subscribe((updatedUser) => {
      console.log('updateUser', updatedUser);
      this.loadData(this.teamId);
      if (reload) {
        this.authenticatedUserBS$.next(updatedUser);
      }
    });
  }

  getMyTeamIdHashStream(): Observable<UserIdHash> {
    return this.myTeamIdHashBS$.asObservable();
  }

  getMyTeamCntStream(): Observable<number> {
    return this.myTeamCntBS$.asObservable();
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
      .get<UserModel>(`${ENV.BASE_API}users/${teamId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  } 

  getOrg$(org: string): Observable<UserModel[]> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}users/org/${org}`, {
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
