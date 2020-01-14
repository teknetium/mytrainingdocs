import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError  } from 'rxjs';
import { EventService } from '../services/event.service';
import { EventModel } from '../interfaces/event.type';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserTrainingModel } from '../interfaces/userTraining.type';
import { AuthService } from './auth.service';
import { User } from '../interfaces/user.type';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {

  userTrainingStreamHash = {};

  constructor(private eventService: EventService, private http: HttpClient, private auth: AuthService) {
  }

  markTrainingAsComplete(tid, uid) {
  }

  getTrainingsForUserStream(uid: string): Observable<UserTrainingModel[]>  {
    const userTrainingBS$ = new BehaviorSubject<UserTrainingModel[]>([]);
    this.userTrainingStreamHash[uid] = userTrainingBS$.asObservable();
    return this.userTrainingStreamHash[uid];
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  getTrainingsForUser$(uid): Observable<UserTrainingModel[]> {
    return this.http
      .get<UserTrainingModel[]>(`${ENV.BASE_API}usertraining/${uid}`, {
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
