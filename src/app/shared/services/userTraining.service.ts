import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription } from 'rxjs';
import { EventService } from '../services/event.service';
import { EventModel } from '../interfaces/event.type';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserTrainingModel, AssessmentResponse, UserTrainingHash, UTSession, UTSessionHash } from '../interfaces/userTraining.type';
import { AuthService } from './auth.service';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {

  private userTrainingForTidBS$ = new BehaviorSubject<UserTrainingModel[]>([]);
  private userTrainings$BS = new BehaviorSubject<UserTrainingModel[]>(null);
  private allUserTrainingHash: UserTrainingHash = {};
  //  private userTrainingHashBS$ = new BehaviorSubject<UserTrainingHash>({});
  private utSessionsForUidBS$ = new BehaviorSubject<UTSession[]>(null);
  private usersBS$ = new BehaviorSubject<string[]>([]);
  private utSessionHash: UTSessionHash = {};
  private currentUT: string;

  constructor(private eventService: EventService,
    private http: HttpClient,
    private auth: AuthService) {

  }

  selectUser(id) {
    this.getUTForUser$(id).subscribe(userTrainings => {
      console.log('userTrainingService: ', userTrainings);
      this.userTrainings$BS.next(userTrainings);
    })
  }

  initUserTrainingsForUser(uid) {
    let now = new Date().getTime();
    let utHash = {};
    this.getUTForUser$(uid).subscribe(utList => {
      for (let userTraining of utList) {
        utHash[userTraining._id] = userTraining;
        this.allUserTrainingHash[userTraining._id] = userTraining;
      }
    });
  }

  getUserTrainingForTidStream(): Observable<UserTrainingModel[]> {
    return this.userTrainingForTidBS$.asObservable();
  }

  getUserTrainingStream() {
    return this.userTrainings$BS.asObservable();
  }

  getUTSessionsForUidStream(uid: string): Observable<UTSession[]> {
    return this.utSessionsForUidBS$.asObservable();
  }

  getUTSessionsForUid(uid: string) {
    this.getUTSessionsForUser$(uid).subscribe(utSessions => {
      this.utSessionsForUidBS$.next(utSessions);
    })
  }

  startSession(utId: string, uid: string, tid: string) {
    this.currentUT = utId;
    let session = <UTSession>{
      _id: String(new Date().getTime()),
      utId: utId,
      uid: uid,
      tid: tid,
      startTime: new Date().getTime(),
      stopTime: 0
    };
    this.utSessionHash[tid] = session;
  }

  stopSession(tid) {
    if (!this.utSessionHash[tid]) {
      return;
    }
    let session = this.utSessionHash[tid];

    session.stopTime = new Date().getTime();
    console.log('stopSession', this.currentUT, this.allUserTrainingHash);
    let ut = this.allUserTrainingHash[this.currentUT];

    if (!ut) {
      console.log('UserTrainingService:stopSession    allUserTrainingHash[this.currentUT] undefined', this.allUserTrainingHash);
    }
    ut.timeToDate += session.stopTime - session.startTime;
    this.saveUserTraining(ut);
    this.utSessionHash[tid] = null;
    this.postUTSession$(session).subscribe(utSession => {
    });
  }

  getUsersForTrainingStream(): Observable<string[]> {
    return this.usersBS$.asObservable();
  }

  getStatusForUser(uid: string): string {
    this.getUTForUser$(uid).subscribe(userTrainings => {
      for (let ut of userTrainings) {
        if (ut.status === 'pastDue') {
          return 'pastDue';
        }
      }
    })
    return 'upToDate';
  }

  resetUserTrainingStatus(tid) {
    this.getUTForTraining$(tid).subscribe(utList => {
      for (let ut of utList) {
        if (ut.status === 'completed') {
          ut.status = 'upToDate';
          this.saveUserTraining(ut);
        }
      }
    })
  }

/*
  getAllUserTrainings() {
    this.allUserTrainingHash
  }
*/
  
  getUTForTraining(tid: string) {
    let uids: string[] = [];
    this.getUTForTraining$(tid).subscribe(uts => {
      console.log('UserTrainingService:getUTForTraining', uts);
      if (uts.length > 0) {
        for (let ut of uts) {
          uids.push(ut.uid);
        }
      }
      this.userTrainingForTidBS$.next(uts);
      this.usersBS$.next(uids);
    })

  }

  assignTraining(uid: string, tid: string) {
    const userTraining = <UserTrainingModel>{
      _id: String(new Date().getTime()),
      tid: tid,
      uid: uid,
      status: 'upToDate',
      trainingVersion: '',
      dueDate: new Date().getTime() + 1209600000,
      dateCompleted: 0,
      timeToDate: 0,
      assessmentResponses: []
    };
    this.postUserTraining$(userTraining).subscribe(userTraining => {
      this.getUTForUser$(uid).subscribe(userTrainings => {
        console.log('userTrainingService: ', userTrainings);
        this.userTrainings$BS.next(userTrainings);
        this.allUserTrainingHash[userTraining._id] = userTraining;
      })
    })
  }
  saveUserTraining(ut: UserTrainingModel): void {
    this.updateUserTraining$(ut).subscribe(userTraining => {
      this.getUTForUser$(userTraining.uid).subscribe(userTrainings => {
        this.userTrainings$BS.next(userTrainings);
      })
    })
  }

  setAssessmentResult(result: AssessmentResponse) {
    let userTraining = this.allUserTrainingHash[this.currentUT];
    userTraining.assessmentResponses.push(result);
    userTraining.dateCompleted = new Date().getTime();
    userTraining.status = 'completed';
    console.log('setAssessmentResult', userTraining);
    this.updateUserTraining$(userTraining).subscribe(ut => {
      this.getUTForUser$(userTraining.uid).subscribe(userTrainings => {
        this.userTrainings$BS.next(userTrainings);
      })
    })
  }

  deleteUTForUser(uid) {
    this.getUTForUser$(uid).subscribe(utList => {
      for (let ut of utList) {
        this.deleteUserTraining$(ut._id).subscribe(item => {
          console.log('UserTrainingService:deleteUTForUser   deleting...', ut._id);
        });
      }
    })
  }

  deleteUserTrainingByTidUid(tid: string, uid: string) {
    this.getUTForUser$(uid).subscribe(utList => {
      for (let ut of utList) {
        if (ut.tid === tid) {
          this.deleteUserTraining(ut._id, uid);
        }
      }
    })
  }

  deleteUserTraining(id, uid) {
    this.deleteUserTraining$(id).subscribe(item => {
      this.getUTForUser$(uid).subscribe(utList => {
        this.userTrainings$BS.next(utList);
      });
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
  postUTSession$(utSession: UTSession): Observable<UTSession> {
    return this.http
      .post<UTSession>(`${ENV.BASE_API}utsession/new/`, utSession, {
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
      .get<UserTrainingModel[]>(`${ENV.BASE_API}usertraining/uid/${uid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  getUTSessionsForUser$(uid: string): Observable<UTSession[]> {
    return this.http
      .get<UTSession[]>(`${ENV.BASE_API}utsession/uid/${uid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  getUTSeessionForTraining$(tid: string): Observable<UTSession[]> {
    return this.http
      .get<UTSession[]>(`${ENV.BASE_API}utsession/tid/${tid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  getUserTraining$(id: string): Observable<UserTrainingModel[]> {
    return this.http
      .get<UserTrainingModel>(`${ENV.BASE_API}usertraining/${id}`, {
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
