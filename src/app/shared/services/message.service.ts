import { Injectable } from '@angular/core';
import { MessageModel } from '../interfaces/message.type';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import * as cloneDeep from 'lodash/cloneDeep';


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  inbox: MessageModel[] = [];
  sent: MessageModel[] = [];
  inboxBS$ = new BehaviorSubject<MessageModel[]>([]);
  sentBS$ = new BehaviorSubject<MessageModel[]>([]);
  msg: MessageModel;
  templateHash = {
    resetTrainingStatus: 'd-b4679d4de1fb41e18d1e2487995f9bdf',
    minorChangeNotification: 'd-3d4ee355e8164a999bbd8a4dd3d106dc',
  };

  constructor(private http: HttpClient, private auth: AuthService) {

  }

  sendMessages(message: MessageModel, toList: string[], dynamicTemplateData: {}, test: boolean) {
    if (test) {
      console.log('TEST MODE  MessageService');
      return;
    }
    let startIndex = 0;
    let chunckSize = 1000;
    let messages: MessageModel[] = [];
    for (let toAddr of toList) {
      let msg = cloneDeep(message);
      msg._id = String(new Date().getTime()) + String(messages.length);
      msg.to = toAddr;
      if (dynamicTemplateData) {
        msg.dynamicTemplateData = dynamicTemplateData[toAddr];
        msg.uid = msg.dynamicTemplateData.uid;
      }
      messages.push(msg);
      if (messages.length === chunckSize) {
        let msgList = cloneDeep(messages);
        this.postMessages$(msgList).subscribe(item => {
          console.log('messageService : sending messages ', item);
        });
        messages = [];
      }
    }
    if (messages.length > 0) {
      this.postMessages$(cloneDeep(messages)).subscribe(item => {
        console.log('messageService : sending messages ', item);
      });
    }
    /*
    while (startIndex < toList.length) {
      console.log('sendMessages', chunckSize);
      let tmpArray = cloneDeep(.slice(startIndex, startIndex + chunckSize));
      startIndex += chunckSize;
      this.postMessages$(tmpArray).subscribe(item => {
        console.log('MessageService : sending messages ', item );
      });
    }
    */
  }


  /*
  sendTemplateMessages(msgs: TemplateMessageModel[]) {
    let startIndex = 0;
    let chunckSize = 1000;
    while (startIndex < msgs.length) {
      console.log('sendTemplateMessages', chunckSize);
      let tmpArray = cloneDeep(msgs.slice(startIndex, startIndex + chunckSize));
      startIndex += chunckSize;
      this.postTemplateMessages$(tmpArray).subscribe(item => {
        console.log('MessageService : sending template messages ', item);
      });
    }
  }
  */
  
  getInboxStream(): Observable<MessageModel[]> {
    return this.inboxBS$.asObservable();
  }

  getSentStream(): Observable<MessageModel[]> {
    return this.sentBS$.asObservable();
  }
    
  postMessages$(msgs: MessageModel[]): Observable<any> {
    return this.http
      .post<MessageModel[]>(`${ENV.BASE_API}message`, msgs, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  /*
  postTemplateMessages$(msgs: TemplateMessageModel[]): Observable<any> {
    return this.http
      .post<TemplateMessageModel[]>(`${ENV.BASE_API}message/template`, msgs, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  */

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

