import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError as ObservableThrowError, Observable, AsyncSubject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserModel, UserFail, UserIdHash, OrgChartNode, UserBatchData, BuildOrgProgress } from '../../shared/interfaces/user.type';
import { ENV } from '../../shared/services/env.config';


@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent extends BaseComponent implements OnInit {

  uid: string;
  user: UserModel;

  constructor(private route: ActivatedRoute, private http: HttpClient ) { 
    super();

    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.uid = params.get('uid');

      this.verifyEmail$(this.uid).subscribe(user => {
        this.user = user;
      })
    });

  }

  ngOnInit() {
  }
/*
  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }
*/
  /*
  getUserByUid(uid: string): Observable<UserModel> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}user/uid/${uid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  */
  verifyEmail$(id: string): Observable<UserModel> {
    return this.http
      .get<UserModel>(`${ENV.BASE_API}verifyemail/${id}`)
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }
  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    console.log("_handleError", err);
    return ObservableThrowError(errorMsg);
  }
}
