import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserBulkAddModel } from '../interfaces/userBulkAdd.type';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class UserBulkAddService {

  usersBS$ = new BehaviorSubject<UserBulkAddModel[]>([]);
  users: UserBulkAddModel[];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
  ) {
  }

  getUserBulkAddStream(): Observable<UserBulkAddModel[]> {
    return this.usersBS$.asObservable();
  }

  saveBulkAddUser(user: UserBulkAddModel) {
    this.postUser$(user).subscribe(user => {

    });
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  postUser$(user: UserBulkAddModel): Observable<UserBulkAddModel> {
    return this.http
      .post<UserBulkAddModel>(`${ENV.BASE_API}userbulkadd/new/`, user, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }
  getUsersBulkAdd$(org: string): Observable<UserBulkAddModel[]> {
    return this.http
      .get<UserBulkAddModel[]>(`${ENV.BASE_API}userbulkadd/${org}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }


  putUser$(user: UserBulkAddModel): Observable<UserBulkAddModel> {
    return this.http
      .put<UserBulkAddModel>(`${ENV.BASE_API}userbulkadd/${user._id}`, user, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  deleteUser$(userId: string): Observable<{}> {
    return this.http
      .delete(`${ENV.BASE_API}userbulkadd/${userId}`, {
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
