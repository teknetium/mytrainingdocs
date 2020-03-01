import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription } from 'rxjs';
import { EventService } from '../services/event.service';
import { EventModel } from '../interfaces/event.type';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserTrainingModel, UserTrainingHash, UidUserTrainingHash } from '../interfaces/userTraining.type';
import { AuthService } from './auth.service';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {

  private uidUserTrainingHash: UidUserTrainingHash = {};
  private allUserTrainingHash: UserTrainingHash = {};
  private userTrainingHashBS$ = new BehaviorSubject<UserTrainingHash>({});
  private usersBS$ = new BehaviorSubject<string[]>([]);

  
  constructor(private eventService: EventService,
    private http: HttpClient,
    private auth: AuthService) {
    
  }

  initUserTrainingsForUser(uid) {
    let now = new Date().getTime();
    let utHash = {};
    this.getUTForUser$(uid).subscribe(utList => {
      for (let userTraining of utList) {
        utHash[userTraining._id] = userTraining;
        this.allUserTrainingHash[userTraining._id] = userTraining;
      }
      this.userTrainingHashBS$.next(utHash);
      this.uidUserTrainingHash[uid] = utHash;
    });

  }

  loadTrainingsForUser(userId) {
    this.userTrainingHashBS$.next(this.uidUserTrainingHash[userId]);
  }

  getUsersForTrainingStream(): Observable<string[]> {
    return this.usersBS$.asObservable();
  }

  getStatusForUser(uid: string): string {
   let utHash = this.uidUserTrainingHash[uid];
    let userTrainings = Object.values(utHash);
    for (let ut of userTrainings) {
      if (ut.status === 'pastDue') {
        return 'pastdue';
      }
    }
    return 'uptodate';
  }
  
  getUserTrainingHashStream(): Observable<UserTrainingHash> {
    return this.userTrainingHashBS$.asObservable();
  }

  getUTforTraining(tid: string) {
    let uids: string[] = [];
    this.getUTForTraining$(tid).subscribe(uts => {
      console.log('UserTrainingService:getUTforTraining', uts);
      if (uts.length > 0) {
        for (let ut of uts) {
          uids.push(ut.uid);
        }
        this.usersBS$.next(uids);
      } else {
        this.usersBS$.next(uids);
      }
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
      score: 0,
      passedAssessment: false,
      assessmentResponse: []
    };
    this.postUserTraining$(userTraining).subscribe(userTraining => {
      let utHash = this.uidUserTrainingHash[uid];
      if (!utHash) {
        utHash = {};
      }
      utHash[userTraining._id] = userTraining;

      this.userTrainingHashBS$.next(utHash);
      this.getUTforTraining(tid);
    })
  }

  markUserTrainingAsComplete(utid: string): void {
    let userTraining = this.allUserTrainingHash[utid];
    userTraining.dateCompleted = new Date().getTime();
    userTraining.status = 'completed';
    this.updateUserTraining$(userTraining).subscribe(ut => {
      let utHash = this.uidUserTrainingHash[ut.uid];
      utHash[ut._id] = ut;
      this.uidUserTrainingHash[ut.uid] = utHash;
      this.userTrainingHashBS$.next(this.uidUserTrainingHash[ut.uid]);
    })
  }

  saveUserTraining(ut: UserTrainingModel): void {
    this.updateUserTraining$(ut).subscribe(userTraining => {
      let utHash = this.uidUserTrainingHash[userTraining.uid];
      utHash[userTraining._id] = userTraining;
      this.uidUserTrainingHash[userTraining.uid] = utHash;
      this.userTrainingHashBS$.next(this.uidUserTrainingHash[userTraining.uid]);
    })
  }

  setAssessmentResult(uid: string, tid: string, score: number, pass: boolean) {
    let userTraining: UserTrainingModel;
    let utHash = this.uidUserTrainingHash[uid];
    let utList = Object.values(utHash);
    for (let ut of utList) {
      if (ut.tid === tid) {
        userTraining = ut;
      }
    }
    userTraining.score = score;
    userTraining.passedAssessment = pass;
    userTraining.dateCompleted = new Date().getTime();
    userTraining.status = 'completed';
    this.updateUserTraining$(userTraining).subscribe(ut => {
      let utHash = this.uidUserTrainingHash[ut.uid];
      utHash[ut._id] = ut;
      this.uidUserTrainingHash[ut.uid] = utHash;
      this.userTrainingHashBS$.next(this.uidUserTrainingHash[ut.uid]);
    })
  }

  deleteUTForUser(uid) {
    let utHash = this.uidUserTrainingHash[uid];
    let utIdList = Object.keys(utHash);
    for (let utId of utIdList) {
      this.deleteUserTraining$(utId).subscribe(item => {
        console.log('UserTrainingService:deleteUTForUser   deleting...', utId);
      })
    }
  }

  deleteUserTrainingByTidUid(tid: string, uid: string) {
    let utHash = this.uidUserTrainingHash[uid];
    let utList = Object.values(utHash);
    for (let ut of utList) {
      if (ut.tid === tid) {
        this.deleteUserTraining(ut._id, uid); 
      }
    }
  }

  deleteUserTraining(id, uid) {
    this.deleteUserTraining$(id).subscribe(item => {
      this.allUserTrainingHash = {};
      this.getUTForUser$(uid).subscribe(utList => {
        let utHash = {};
        for (let userTraining of utList) {
          utHash[userTraining._id] = userTraining;
          this.allUserTrainingHash[userTraining._id] = userTraining;
        }

        console.log('UserTrainingService:deleteUserTraining   ',utHash);

        this.uidUserTrainingHash[uid] = utHash;
        this.userTrainingHashBS$.next(utHash);
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
