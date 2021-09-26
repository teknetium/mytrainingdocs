import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
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

  private showUpgradeToExpertDialogBS$ = new BehaviorSubject<boolean>(false);
  private showUpgradeToProDialogBS$ = new BehaviorSubject<boolean>(false);
  private authenticatedUser$: Observable<UserModel>;
  private authenticatedUser: UserModel;
  private orgBS$ = new BehaviorSubject<OrgModel>(null);
  private currentOrg: OrgModel = null;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {
  }

  getAllOrgs() {
    //    this.getOrgs$(
  }

  createOrg(newOrg: OrgModel) {
    console.log('createOrg', newOrg, this.currentOrg);
    if (this.currentOrg) {
      return;
    }
    this.postOrg$(newOrg).subscribe(orgObj => {
      if (!orgObj) {
        return;
      }
      console.log('createOrg', orgObj);
      this.currentOrg = orgObj;
      this.orgBS$.next(this.currentOrg);
    });
  }

  getOrg(org) {
    this.getOrgObj$(org).subscribe(orgObj => {
      console.log('getOrg', org);
      this.currentOrg = orgObj;
      this.orgBS$.next(this.currentOrg);
    })
  }

  setAdminIds(uidList: string[]) {
    this.currentOrg.adminIds = uidList;
    this.updateOrg(this.currentOrg);
    this.orgBS$.next(this.currentOrg);
  }

  setPlan(planId, planName) {
    if (this.currentOrg) {
      this.currentOrg.planId = planId;
      this.currentOrg.planName = planName;
      this.updateOrg(this.currentOrg);
      this.orgBS$.next(this.currentOrg);
    }
  }

  showUpgradeToProDialog(show: boolean) {
    this.showUpgradeToProDialogBS$.next(show);
  }

  showUpgradeToExpertDialog(show: boolean) {
    this.showUpgradeToExpertDialogBS$.next(show);
  }

  updateOrg(orgObj: OrgModel) {
    if (orgObj) {
      this.updateOrg$(orgObj).subscribe(org => {
        console.log('updateOrg', orgObj);
      })
    }
  }

  getShowUpgradeToProDialogStream(): Observable<boolean> {
    return this.showUpgradeToProDialogBS$.asObservable();
  }

  getShowUpgradeToExpertDialogStream(): Observable<boolean> {
    return this.showUpgradeToExpertDialogBS$.asObservable();
  }

  getOrgStream(): Observable<OrgModel> {
    return this.orgBS$.asObservable();
  }

  getAllOrgs$(): Observable<OrgModel[]> {
    return this.http
      .get<OrgModel[]>(`${ENV.BASE_API}orgs/all/`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  getOrgObj$(domain): Observable<OrgModel> {
    return this.http
      .get<OrgModel>(`${ENV.BASE_API}orgs/${domain}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  postOrg$(org: OrgModel): Observable<OrgModel> {
    return this.http
      .post<OrgModel>(`${ENV.BASE_API}orgs/new/`, org, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  updateOrg$(org: OrgModel): Observable<OrgModel> {
    console.log('updateOrg$', org);
    return this.http
      .put<OrgModel>(`${ENV.BASE_API}orgs/update/`, org, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing comment
  deleteOrg$(id: string): Observable<OrgModel> {
    return this.http
      .delete(`${ENV.BASE_API}org/${id}`, {
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
//      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
