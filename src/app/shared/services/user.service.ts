import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserModel } from '../interfaces/user.model';
import { Auth0ProfileModel } from '../interfaces/auth0Profile.type';
import { Router } from '@angular/router';
import { EventModel } from '../interfaces/event.type';
import { EventService } from './event.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private myTeam: UserModel[] = [];
  private authenticatedUser: UserModel;

  // Writable streams
  //  private authenticatedUser$ = new AsyncSubject<UserModel>();
  private authenticatedUserBS$ = new BehaviorSubject<UserModel>(null);
  private myTeamBS$ = new BehaviorSubject<UserModel[]>([]);
  private myTeamCntBS$ = new BehaviorSubject<number>(0);
  private myTeamCnt$ = new BehaviorSubject<number>(0);
  private actionBS$ = new BehaviorSubject<string>('');
  private titleBS$ = new BehaviorSubject<string>('');
  private selectedUserBS$ = new BehaviorSubject<UserModel>(null);
  private selectedUserIndexBS$ = new BehaviorSubject<number>(null);
  private newUser$: Observable<UserModel>;

  userTypeIconHash = {
    supervisor: 'fad fa-user-tie',
    individualContributor: 'fad fa-user',
    volunteer: 'fad fa-user-cowboy',
    customer: 'fad fa-user-crown'
  }

  // Observables
  private newuser$: Observable<UserModel>;
  private authenticatedUserProfile$: Observable<Auth0ProfileModel>;

  private action: string;

  authProfile: Auth0ProfileModel;
  view = 'card';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private eventService: EventService,
  ) {
    this.action = 'init';

    this.authenticatedUserProfile$ = this.auth.getAuthenticatedUserProfileStream();
    this.authenticatedUserProfile$.subscribe((profile) => {
      this.getUserByUid(profile.uid).subscribe(
        user => {
          this.authenticatedUser = user;
          this.authenticatedUserBS$.next(this.authenticatedUser);
          this.logLoginEvent();
          this.loadData();
        },
        err => {
          this.getUserByEmail(profile.email).subscribe(
            res => {
              res.uid = profile.uid;
              res.userStatus = 'active';
              this.updateUser(res);
              this.authenticatedUser = res;
              this.authenticatedUserBS$.next(this.authenticatedUser);
              this.loadData();
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
                supervisorId: null  
              }

              this.newUser$ = this.postUser$(this.authenticatedUser);
              this.newUser$.subscribe((data) => {
                this.authenticatedUser = data;
                this.authenticatedUserBS$.next(this.authenticatedUser);
                this.logLoginEvent();
                this.authenticatedUserBS$.complete();
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

  loadData() {
    this.getTeam$(this.authenticatedUser.uid).subscribe((userList) => {
      if (!userList) {
        return;
      }
      this.myTeam = userList;
      this.myTeamBS$.next(this.myTeam);
      this.myTeamCntBS$.next(this.myTeam.length);
      let i;
      if (this.action === 'save') {
        i = this.selectedUserIndexBS$.value;
      } else if (this.action === 'init') {
        i = 0;
      } else if (this.action === 'add') {
        i = this.myTeam.length - 1;
      } else {
        if (this.selectedUserIndexBS$.value > this.myTeam.length - 1) {
          i = this.myTeam.length - 1;
        } else {
          i = this.selectedUserIndexBS$.value;
        }
      }
      this.selectUser(i);
      this.action = '';
    });

  }

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

  createNewUser(user: UserModel) {
    this.postUser$(user).subscribe(data => {
      this.loadData();
    })
  }

  deleteUser(id: string) {
    this.deleteUser$(id).subscribe(data => {
      this.loadData();
    });
  }

  getActionStream(): Observable<string> {
    return this.actionBS$.asObservable();
  }

  getSelectedUserStream(): Observable<UserModel> {
    return this.selectedUserBS$.asObservable();
  }

  getSelectedUserIndexStream(): Observable<number> {
    return this.selectedUserIndexBS$.asObservable();
  }
  /*
    getMyTrainingsStream(user: UserModel): Observable<{tid: string, status: string, dueDate: number, completedDate: number}> {
      return user
    }
  */
  assignTraining(user: UserModel, tid: string) {
    const status = 'uptodate';
    const dueDate = 0;
    const completedDate = 0;
    const userTraining = { tid, status, dueDate, completedDate };
    //    user.myTrainings.push(userTraining);
  }

  selectUser(index: number) {
    this.selectedUserBS$.next(this.myTeam[index]);
    this.selectedUserIndexBS$.next(index);
    this.titleBS$.next('BLAH');
    this.actionBS$.next('edit');
  }

  updateUser(user: UserModel) {
    this.action = 'save';
    this.putUser$(user).subscribe((updatedUser) => {
      this.loadData();
    });
  }

  getTitleStream(): Observable<string> {
    return this.titleBS$.asObservable();
  }

  getMyTeamStream(): Observable<UserModel[]> {
    return this.myTeamBS$.asObservable();
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
