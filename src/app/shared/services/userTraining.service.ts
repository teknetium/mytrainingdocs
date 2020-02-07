import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription  } from 'rxjs';
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

  userTrainingBS$ = new BehaviorSubject<UserTrainingModel[]>([]);

  constructor(private eventService: EventService, private http: HttpClient, private auth: AuthService) {
  }

  markTrainingAsComplete(tid, uid) {
  }

  getUserTrainingStream(): Observable<UserTrainingModel[]>  {
    return this.userTrainingBS$.asObservable();
  }

  assignTraining(uid, tid) {
    const userTraining = <UserTrainingModel>{
      _id: String(new Date().getTime()),
      tid: tid,
      uid: uid,
      status: 'upToDate',
      trainingVersion: '',
      dueDate: new Date().getTime() + 2419200000,
      dateCompleted: 0,
      timeToDate: 0,
      assessmentResponse: []
    };
    this.postUsertraining$(userTraining).subscribe(userTraining => {
      this.getTrainingsForUser$(userTraining.uid).subscribe(list => {
        this.userTrainingBS$.next(list);
      })
    })
  }

  deleteUserTraining(id, uid) {
    this.deleteUserTraining$(id).subscribe(item => {
      this.getTrainingsForUser$(uid).subscribe(list => {
        this.userTrainingBS$.next(list);
      })      
    })
  }
  
  loadTrainingsForUser(userId) {
    this.getTrainingsForUser$(userId).subscribe(list => {
      this.userTrainingBS$.next(list);
    })
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  postUsertraining$(userTraining: UserTrainingModel): Observable<UserTrainingModel> {
    return this.http
      .post<UserTrainingModel>(`${ENV.BASE_API}usertraining/new/`, userTraining, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  deleteUserTraining$(id: string): Observable<any> {
    return this.http
      .delete(`${ENV.BASE_API}usertraining/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
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
