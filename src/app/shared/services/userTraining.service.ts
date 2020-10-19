import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription } from 'rxjs';
import { EventService } from '../services/event.service';
import { EventModel } from '../interfaces/event.type';
import { TrainingModel } from '../interfaces/training.type';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserTrainingModel, AssessmentResponse, UserTrainingHash, UTSession, UTSessionHash, UidUTHash } from '../interfaces/userTraining.type';
import { AuthService } from './auth.service';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {

  private userTrainingForTidBS$ = new BehaviorSubject<UserTrainingModel[]>([]);
  private userTrainings$BS = new BehaviorSubject<UserTrainingModel[]>(null);
  private userTrainingCompletedBS$ = new BehaviorSubject<UserTrainingModel>(null);
  private allUserTrainingHash: UserTrainingHash = {};
  //  private userTrainingHashBS$ = new BehaviorSubject<UserTrainingHash>({});
  private utSessionsForUidBS$ = new BehaviorSubject<UTSession[]>(null);
  private usersBS$ = new BehaviorSubject<string[]>([]);
  private utSessionHash: UTSessionHash = {};
  private currentUT: string;
  private uidUTHashBS$ = new BehaviorSubject<UidUTHash>(null);
  private uidUTHash = {};
  private sessionLog: UTSession[] = [];
  private sessionLogBS$ = new BehaviorSubject<UTSession[]>(null);

  constructor(
    private eventService: EventService,
    private http: HttpClient,
    private auth: AuthService) {
  }

  selectUser(id) {
    if (!id) {
      this.userTrainings$BS.next(null);
      return;
    }
    this.getUTForUser$(id).subscribe(userTrainings => {
      this.userTrainings$BS.next(userTrainings);
      this.uidUTHash[id] = userTrainings;
//      this.uidUTHashBS$.next(this.uidUTHash);
    })
  }

  initUserTrainingsForUser(uid) {
    let now = new Date().getTime();
    if (this.uidUTHash[uid]) {
      return;
    }
    this.getUTForUser$(uid).subscribe(utList => {
      this.uidUTHash[uid] = utList;
      for (let userTraining of utList) {
        this.allUserTrainingHash[userTraining._id] = userTraining;
      }
      this.uidUTHashBS$.next(this.uidUTHash);
    });
  }

  updateUTVersion(uid: string, tid: string, newVersion: string) {
    let utList = this.uidUTHash[uid];
    for (let ut of utList) {
      if (ut.tid === tid) {
        if (ut.status !== 'completed') {
          ut.trainingVersion = newVersion;
          this.saveUserTraining(ut);
        }
      }
    }
  }

  getSessionLogStream(): Observable<UTSession[]> {
    return this.sessionLogBS$.asObservable();
  }

  getUidUTHashStream(): Observable<UidUTHash> {
    return this.uidUTHashBS$.asObservable();
  }

  getUserTrainingForTidStream(): Observable<UserTrainingModel[]> {
    return this.userTrainingForTidBS$.asObservable();
  }

  getUserTrainingStream() {
    return this.userTrainings$BS.asObservable();
  }

  getUserTrainingCompletedStream() {
    return this.userTrainingCompletedBS$.asObservable();
  }

  getUTSessionsForUidStream(uid: string): Observable<UTSession[]> {
    return this.utSessionsForUidBS$.asObservable();
  }

  getUTSessionsForUid(uid: string) {
    this.getUTSessionsForUser$(uid).subscribe(utSessions => {
      this.utSessionsForUidBS$.next(utSessions);
    })
  }

  startSession(utId: string, uid: string, tid: string, teamId: string) {
    this.currentUT = utId;
    let session = <UTSession>{
      _id: String(new Date().getTime()),
      utId: utId,
      uid: uid,
      tid: tid,
      teamId: teamId,
      startTime: new Date().getTime(),
      stopTime: 0
    };
    this.utSessionHash[tid] = session;
    console.log('startSession ', session);
  }

  stopSession(ut: UserTrainingModel) {
    if (!ut) {
      return;
    }
    if (!this.utSessionHash[ut.tid]) {
      console.log('stopSession...no session');
      return;
    }
    let session = this.utSessionHash[ut.tid];

    if (session.stopTime !== 0) {
      console.log('stopSession...already stopped', session);
      return;
    }

    session.stopTime = new Date().getTime();


    ut.timeToDate += session.stopTime - session.startTime;
    this.saveUserTraining(ut);
    this.utSessionHash[ut.tid] = null;
    this.postUTSession$(session).subscribe(utSession => {
      this.sessionLog.push(utSession);
      this.sessionLogBS$.next(this.sessionLog);
    });
  }

  getUsersForTrainingStream(): Observable<string[]> {
    return this.usersBS$.asObservable();
  }

  getUidUTList(uid: string): UserTrainingModel[] {
    let utList: UserTrainingModel[] = this.uidUTHash[uid];
    if (!utList) {
      utList = [];
    }
    return utList;
  }
/*
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
*/
  resetUserTrainingStatus(tid, version) {
    this.getUTForTraining$(tid).subscribe(utList => {
      for (let ut of utList) {
        // for onetime trainings, the expirationDate property holds the number of days after assignment that the training is due
        if (ut.status === 'completed') {
          ut.status = 'upToDate';
          ut.dateCompleted = 0;
          ut.dueDate = new Date().getTime() + 604800000;
          ut.trainingVersion = version;
          ut.assessmentResponses = [];
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
  

/*
  deleteUTForTraining(tid: string) {
    let uids: string[] = [];
    let utIds: string[] = [];
    this.getUTForTraining$(tid).subscribe(uts => {
      if (uts.length > 0) {
        for (let ut of uts) {
          utIds.push(ut._id);
        }
        this.deleteUTs$(utIds);
      }
      this.userTrainingForTidBS$.next(uts);
      this.usersBS$.next(uids);
    })
  }
  */
  getUTForTraining(tid: string) {
    let uids: string[] = [];
    this.getUTForTraining$(tid).subscribe(uts => {
      if (uts.length > 0) {
        for (let ut of uts) {
          uids.push(ut.uid);
        }
      }
      this.userTrainingForTidBS$.next(uts);
      this.usersBS$.next(uids);
    })
  }

  getUTForUser(uid: string) {
    this.getUTForUser$(uid).subscribe(userTrainings => {
      this.userTrainings$BS.next(userTrainings);
      this.uidUTHash[uid] = Object.assign([], userTrainings);
      this.uidUTHashBS$.next(this.uidUTHash);
      for (let ut of userTrainings) {
        this.allUserTrainingHash[ut._id] = ut;
      }
    })
  }
  getUTForTeam(teamId: string) {
    this.getUTForTeam$(teamId).subscribe(userTrainings => {
      this.uidUTHash = {};
      for (let ut of userTrainings) {
        if (!this.uidUTHash[ut.uid]) {
          this.uidUTHash[ut.uid] = new Array(ut);
        } else {
          this.uidUTHash[ut.uid].push(ut);
        }
        this.allUserTrainingHash[ut._id] = ut;
      }
      this.uidUTHashBS$.next(this.uidUTHash);
    })
  }



  assignTraining(uid: string, tid: string, teamId: string, version: string, dueDate: number) {
    let userTraining:UserTrainingModel = {
      _id: String(new Date().getTime()),
      tid: tid,
      uid: uid,
      teamId: teamId,
      status: 'upToDate',
      trainingVersion: version,
      dueDate: new Date().getTime() + dueDate,
      dateCompleted: 0,
      timeToDate: 0,
      assessmentResponses: [],
      certImage: null
    };
    this.postUserTraining$(userTraining).subscribe(userTraining => {
      this.getUTForUser$(userTraining.uid).subscribe(userTrainings => {
        console.log('userTrainingService: assignTraining', userTrainings);
        this.userTrainings$BS.next(userTrainings);
        this.uidUTHash[userTraining.uid] = userTrainings;
        this.uidUTHashBS$.next(this.uidUTHash);
        this.allUserTrainingHash[userTraining._id] = userTraining;
      })
    })
  }

  bulkAssignTraining(uids: string[], tid: string, teamId: string, version: string) {
    let userTrainings: UserTrainingModel[] = [];
    let id = String(new Date().getTime());
    let dueDate = new Date().getTime() + 1209600000;
    let counter = 0;
    let found = false;
    for (let uid of uids) {
      found = false;
      let utList = this.uidUTHash[uid];
      if (!utList) {
        utList = [];
      }
      for (let ut of utList) {
        if (ut.tid === tid) {
          found = true;
          break;
        }
      }
      if (!found) {
        let uT: UserTrainingModel = {
          _id: id + counter,
          tid: tid,
          uid: uid,
          teamId: teamId,
          status: 'upToDate',
          trainingVersion: version,
          dueDate: dueDate,
          dateCompleted: 0,
          timeToDate: 0,
          assessmentResponses: [],
          certImage: null
        };
        userTrainings.push(uT);
        counter++;
      }
    }
    this.postBulkUserTraining$(userTrainings).subscribe(userTrainingList => {
      for (let ut of userTrainingList) {

        if (this.uidUTHash[ut.uid]) {
          this.uidUTHash[ut.uid].push(ut);
        } else {
          this.uidUTHash[ut.uid] = [ut];
        }
        this.userTrainings$BS.next(this.uidUTHash[ut.uid]);
        this.allUserTrainingHash[ut._id] = ut;
      }
      console.log('bulk assign returns ...', userTrainingList);
      this.uidUTHashBS$.next(this.uidUTHash);
    });
  }

  saveUserTraining(ut: UserTrainingModel): void {
    this.updateUserTraining$(ut).subscribe(userTraining => {
      console.log('saveUserTraining', userTraining);

      this.getUTForUser$(userTraining.uid).subscribe(userTrainings => {
        this.uidUTHash[userTraining.uid] = userTrainings;
        this.uidUTHashBS$.next(this.uidUTHash);
        this.userTrainings$BS.next(userTrainings);
      })
    })
  }

  setAssessmentResult(result: AssessmentResponse, ut: UserTrainingModel) {
    let userTraining = this.allUserTrainingHash[this.currentUT];
    userTraining.assessmentResponses.push(result);

    if (result.isFinal && result.passed) {
      this.stopSession(userTraining);
      userTraining.dateCompleted = new Date().getTime();
      this.userTrainingCompletedBS$.next(userTraining);
    }
    this.updateUserTraining$(userTraining).subscribe(ut => {
      this.getUTForUser$(userTraining.uid).subscribe(userTrainings => {
        console.log('setAssessmentResult...userTraining list', userTrainings);
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
          utList.splice(utList.indexOf(ut), 1);
          this.uidUTHash[uid] = utList;
        }
      }
      this.uidUTHashBS$.next(this.uidUTHash);
    })
  }

  deleteUserTraining(id, uid) {
    this.deleteUserTraining$(id).subscribe(item => {
      this.getUTForUser$(uid).subscribe(utList => {
        this.uidUTHash[uid] = utList;
        this.uidUTHashBS$.next(this.uidUTHash);
        this.userTrainings$BS.next(utList);
      });
    })
  }

  getUTSessionsForTeam(teamId) {
    this.getUTSessionsForTeam$(teamId).subscribe(utSessions => {
      if (utSessions.length > 0) {
        this.sessionLog = [];
        for (let session of utSessions) {
          this.sessionLog.push(session);
        }
        this.sessionLogBS$.next(this.sessionLog);
      }
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
  postBulkUserTraining$(userTrainings: UserTrainingModel[]): Observable<UserTrainingModel[]> {
    return this.http
      .post<UserTrainingModel>(`${ENV.BASE_API}usertraining/newbulk/`, userTrainings, {
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
  getUTForTeam$(teamId: string): Observable<UserTrainingModel[]> {
    return this.http
      .get<UserTrainingModel[]>(`${ENV.BASE_API}usertraining/teamid/${teamId}`, {
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
  getUTSessionsForTeam$(teamId: string): Observable<UTSession[]> {
    return this.http
      .get<UTSession[]>(`${ENV.BASE_API}utsession/team/${teamId}`, {
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
