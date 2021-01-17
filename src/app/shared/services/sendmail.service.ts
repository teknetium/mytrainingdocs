import { Injectable } from '@angular/core';
import { MessageModel, TemplateMessageModel } from '../interfaces/message.type';
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
  templateHash = {
    resetTrainingStatus: 'd-b4679d4de1fb41e18d1e2487995f9bdf',
    minorChangeNotification: 'd-3d4ee355e8164a999bbd8a4dd3d106dc',
  };

  constructor(private http: HttpClient, private auth: AuthService) {

  }

  sendMessages(msgs: MessageModel[], test: boolean) {
    if (test) {
      console.log('TEST MODE  sendmailService');
      return;
    }
    let startIndex = 0;
    let chunckSize = 200;
    while (startIndex < msgs.length) {
      console.log('sendMessages', chunckSize);
      let tmpArray = Object.assign([], msgs.slice(startIndex, startIndex + chunckSize));
      startIndex += chunckSize;
      this.postMessages$(tmpArray).subscribe(item => {
        console.log('sendmailService : sending messages ', item );
      });
    }
  }

  sendTemplateMessages(msgs: TemplateMessageModel[]) {
    let startIndex = 0;
    let chunckSize = 100;
    while (startIndex < msgs.length) {
      console.log('sendTemplateMessages', chunckSize);
      let tmpArray = Object.assign([], msgs.slice(startIndex, startIndex + chunckSize));
      startIndex += chunckSize;
      this.postTemplateMessages$(tmpArray).subscribe(item => {
        console.log('sendmailService : sending template messages ', item);
      });
    }
  }

  postMessages$(msgs: MessageModel[]): Observable<any> {
    return this.http
      .post<MessageModel[]>(`${ENV.BASE_API}sendmail`, msgs, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  postTemplateMessages$(msgs: TemplateMessageModel[]): Observable<any> {
    return this.http
      .post<TemplateMessageModel[]>(`${ENV.BASE_API}sendmail/template`, msgs, {
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
//      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
