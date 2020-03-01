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


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private myTeamIdHash: UserIdHash = {};
  private authenticatedUser: UserModel;

  // Writable streams
  private authenticatedUserBS$ = new BehaviorSubject<UserModel>(null);
  private myTeamIdHashBS$ = new BehaviorSubject<UserIdHash>(null);
  private myTeamCntBS$ = new BehaviorSubject<number>(0);
  private selectedUserBS$ = new BehaviorSubject<UserModel>(null);
  private newUser$: Observable<UserModel>;
  private jobTitlesBS$ = new BehaviorSubject<string[]>([]);
  private jobTitles: string[] = [];
  private allOrgUserHash: UserIdHash = {};

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
          this.getAllOrgUsers();
          if (this.authenticatedUser.jobTitle) {
            this.jobTitles.push(this.authenticatedUser.jobTitle);
          }
          this.authenticatedUserBS$.next(this.authenticatedUser);
          this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
          //this.authenticatedUserBS$.complete();
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
              this.getAllOrgUsers();
              if (this.authenticatedUser.jobTitle) {
                this.jobTitles.push(this.authenticatedUser.jobTitle);
              }
              this.authenticatedUserBS$.next(this.authenticatedUser);
              this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
              //              this.authenticatedUserBS$.complete();
              //              this.loadData();
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
                adminUp: false,
                userStatus: 'new-supervisor-without-team',
                trainingStatus: 'uptodate',
                jobTitle: '',
                profilePicUrl: '',
                supervisorId: null,
                settings: {foo: 'test'}
              }

              this.postUser$(this.authenticatedUser).subscribe((data) => {
                this.authenticatedUser = data;
                this.getAllOrgUsers();
                if (this.authenticatedUser.jobTitle) {
                  this.jobTitles.push(this.authenticatedUser.jobTitle);
                }
                this.authenticatedUserBS$.next(this.authenticatedUser);
                //                this.authenticatedUserBS$.complete();
                //                this.logLoginEvent();
                this.userTrainingService.assignTraining(this.authenticatedUser._id, this.authenticatedUser.userType);
                this.userTrainingService.initUserTrainingsForUser(this.authenticatedUser._id);
                //                this.loadData();
                //        this.router.navigate([`gettingstarted`]);
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

  checkUserId(uid: string): Observable<UserModel> {
    return this.getUser$(uid);
  }

  getAllOrgUsers() {
    this.getOrg$(this.authenticatedUser.org).subscribe(userList => {
      if (!userList) {
        return;
      }
      for (let user of userList) {
        this.allOrgUserHash[user._id] = user;
        if (user.jobTitle) {
          this.jobTitles.push(user.jobTitle);
        }
      }
      this.jobTitlesBS$.next(this.jobTitles);
    })
  }

  loadData(teamId) {
    this.getTeam$(teamId).subscribe((userList) => {
      if (!userList) {
        return;
      }
      console.log('UserService:loadData', userList);
      this.myTeamIdHash = {};
      for (let user of userList) {
        this.myTeamIdHash[user._id] = user;
        this.userTrainingService.initUserTrainingsForUser(user._id);
      }

      this.myTeamIdHashBS$.next(this.myTeamIdHash);
      this.myTeamCntBS$.next(Object.keys(this.myTeamIdHash).length);
    });

  }
  /*
    addNewUser() {
      const newUser = <UserModel>{
        _id: String(new Date().getTime()),
        uid: '',
        userType: 'individualContributor',
        firstName: 'New',
        lastName: 'User',
        email: '',
        teamId: this.authenticatedUser.uid,
        userStatus: 'new-user',
        trainingStatus: 'uptodate',
        profilePicUrl: '',
        supervisorId: this.authenticatedUser._id
      }
  
      this.action = 'new';
      this.actionBS$.next(this.action);
      this.selectedUserBS$.next(newUser);
      this.selectedUserIndexBS$.next(-1);
    }
    */

  createNewUser(user: UserModel) {
    this.postUser$(user).subscribe(data => {
      this.userTrainingService.assignTraining(data._id, data.userType);
      this.loadData(this.teamId);
    })
  }

  deleteUser(id: string) {
    this.deleteUser$(id).subscribe(data => {
      this.loadData(this.teamId);
    });
  }
  /*
    getActionStream(): Observable<string> {
      return this.actionBS$.asObservable();
    }
  */
  getSelectedUserStream(): Observable<UserModel> {
    return this.selectedUserBS$.asObservable();
  }

  getJobTitleStream(): Observable<string[]> {
    return this.jobTitlesBS$.asObservable();
  }

  /*
  getSelectedUserIndexStream(): Observable<number> {
    return this.selectedUserIndexBS$.asObservable();
  }
    getMyTrainingsStream(user: UserModel): Observable<{tid: string, status: string, dueDate: number, completedDate: number}> {
      return user
    }
  */
  /*
  assignTraining(user: UserModel, tid: string) {
    const status = 'uptodate';
    const dueDate = 0;
    const completedDate = 0;
    const userTraining = { tid, status, dueDate, completedDate };
    //    user.myTrainings.push(userTraining);
  }
  */

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

  updateUser(user: UserModel, isAuthenticatedUser: boolean) {
    this.action = 'save';
    this.putUser$(user).subscribe((updatedUser) => {
      this.loadData(this.teamId);
      if (isAuthenticatedUser) {
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

  getAuthenticatedUserStream(): Observable<UserModel> {
    return this.authenticatedUserBS$.asObservable();
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
