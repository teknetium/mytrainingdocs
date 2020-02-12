import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription  } from 'rxjs';
import { EventService } from '../services/event.service';
import { EventModel } from '../interfaces/event.type';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserTrainingModel } from '../interfaces/userTraining.type';
import { AuthService } from './auth.service';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {

  userTrainingBS$ = new BehaviorSubject<UserTrainingModel[]>([]);
  utHash = {};
  utIdHash = {};

  constructor(private eventService: EventService, private http: HttpClient, private auth: AuthService) {
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
      score: 0,
      passedAssessment: false,
      assessmentResponse: []
    };
    this.postUserTraining$(userTraining).subscribe(userTraining => {
      this.getUTForUser$(userTraining.uid).subscribe(list => {
        this.utHash[userTraining.uid] = list;
        for (let userTraining of list) {
          this.utIdHash[userTraining._id] = userTraining;
        }
        this.userTrainingBS$.next(list);
      })
    })
  }

  markUserTrainingAsComplete(utid: string): void {
    let userTraining = this.utIdHash[utid];
    userTraining.dateCompleted = new Date().getTime();
    userTraining.status = 'completed';
    this.updateUserTraining$(userTraining).subscribe(userTraining => {
      this.getUTForUser$(userTraining.uid).subscribe(list => {
        this.userTrainingBS$.next(list);
      })
    })
  }
  
  saveUserTraining(ut: UserTrainingModel): void {
    this.updateUserTraining$(ut).subscribe(userTraining => {
      this.getUTForUser$(userTraining.uid).subscribe(list => {
        this.userTrainingBS$.next(list);
      })
    })
  }

  setAssessmentResult(uid: string, tid: string, score: number, pass: boolean) {
    console.log('setAssessmentResult', this.utHash);
    let userTraining: UserTrainingModel;
    let utList = this.utHash[uid];
    for (let ut of utList) {
      if (ut.uid === uid && ut.tid === tid) {
        userTraining = ut;
      }
    }
    userTraining.score = score;
    userTraining.passedAssessment = pass;
    userTraining.dateCompleted = new Date().getTime();
    userTraining.status = 'completed';
    this.updateUserTraining$(userTraining).subscribe(userTraining => {
      this.getUTForUser$(userTraining.uid).subscribe(list => {
        this.userTrainingBS$.next(list);
      })
    })
  }

  deleteUserTraining(id, uid) {
    this.deleteUserTraining$(id).subscribe(item => {
      this.getUTForUser$(uid).subscribe(list => {
        this.userTrainingBS$.next(list);
      })      
    })
  }
  
  loadTrainingsForUser(userId) {
    this.getUTForUser$(userId).subscribe(list => {
      this.utHash[userId] = list;
      for (let userTraining of list) {
        this.utIdHash[userTraining._id] = userTraining;
      }
      this.userTrainingBS$.next(list);
    })
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  postUserTraining$(userTraining: UserTrainingModel): Observable<UserTrainingModel> {
    return this.http
      .post<UserTrainingModel>(`${ENV.BASE_API}usertraining/new/`, userTraining, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }
  updateUserTraining$(userTraining: UserTrainingModel): Observable<UserTrainingModel> {
    return this.http
      .put<UserTrainingModel>(`${ENV.BASE_API}usertraining/${userTraining._id}`, userTraining, {
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

  getUTForUser$(uid: string): Observable<UserTrainingModel[]> {
    return this.http
      .get<UserTrainingModel[]>(`${ENV.BASE_API}usertraining/${uid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }
  getUTForTraining$(tid: string): Observable<UserTrainingModel[]> {
    return this.http
      .get<UserTrainingModel[]>(`${ENV.BASE_API}usertraining/tid/${tid}`, {
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
