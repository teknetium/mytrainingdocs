import { Injectable } from '@angular/core';
import { MessageModel } from '../interfaces/message.type';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';


@Injectable({
  providedIn: 'root'
})
export class SendmailService {

  msg: MessageModel;

  constructor(private http: HttpClient, private auth: AuthService) { }

  sendMessage(msg: MessageModel) {
    this.postMessage$(msg).subscribe(item => {
    })

  }

  postMessage$(msg: MessageModel): Observable<any> {
    return this.http
      .post<MessageModel>(`${ENV.BASE_API}sendmail`, msg, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
