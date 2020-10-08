import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { UserModel } from '../interfaces/user.type';
import { OrgModel } from '../interfaces/org.type';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class OrgService {

  private authenticatedUser: UserModel;


  constructor( private http: HttpClient,  private auth: AuthService ) {
  }

  getAllOrgs() {
    this.getOrgs$
  }

  getOrgs$(): Observable<OrgModel[]> {
    return this.http
      .get<OrgModel[]>(`${ENV.BASE_API}org/`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  // POST new comment (admin only)
  postOrg$(org: OrgModel): Observable<OrgModel> {
    return this.http
      .post<OrgModel>(`${ENV.BASE_API}orgs/new`, org, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing comment
  deleteOrg$(id: string): Observable<OrgModel> {
    return this.http
      .delete(`${ENV.BASE_API}orgs/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
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
