import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AlertModel } from '../interfaces/notification.type';
import { TrainingModel } from '../interfaces/training.type';
import { UserModel } from '../interfaces/user.type';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UserTrainingModel, AssessmentResponse, NotifyEvent, UserTrainingHash, UTSession, UTSessionHash, UidUTHash } from '../interfaces/userTraining.type';
import { AuthService } from './auth.service';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';
import * as cloneDeep from 'lodash/cloneDeep';
import { start } from 'repl';


@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {

  private userTrainingForTidBS$ = new BehaviorSubject<UserTrainingModel[]>([]);
  private userTrainings$BS = new BehaviorSubject<UserTrainingModel[]>(null);
  private orgUserTrainingsBS$ = new BehaviorSubject<UserTrainingModel[]>(null);
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
  private bulkUserStatusUpdateBS$ = new BehaviorSubject<string[]>(null);
  private uidList: string[] = [];

  constructor(
    private notifyService: NotificationService,
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

  getOrgUserTrainingsStream(): Observable<UserTrainingModel[]> {
    return this.orgUserTrainingsBS$.asObservable();
  }

  getSessionLogStream(): Observable<UTSession[]> {
    return this.sessionLogBS$.asObservable();
  }

  getBulkUserStatusUpdateStream(): Observable<string[]> {
    return this.bulkUserStatusUpdateBS$.asObservable();
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
  
  resetUserTrainingStatus(tid, version) {
    let utObj = <UserTrainingModel>{
      _id: null,
      tid: tid,
      trainingVersion: version,
      uid: null,
      teamId: null,
      status: 'upToDate',
      dueDate: new Date().getTime() + 604800000,
      dateCompleted: 0,
      timeToDate: 0,
      assessmentResponses: null,
      certImage: null,
      notifySchedule: []
    }
    this.resetStatusForMany$(utObj).subscribe(responseObj => {
      console.log("resetStatusForMany", responseObj);
      let alert = <AlertModel>{
        timestamp: new Date().getTime(),
        type: 'success',
        message: 'Reset status for ' + responseObj.n + ' users.'
      }
      this.notifyService.showAlert(alert);
    });
  }

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



  assignTraining(user: UserModel, training: TrainingModel) {
    let userTraining:UserTrainingModel = {
      _id: String(new Date().getTime()),
      tid: training._id,
      uid: user._id,
      teamId: user._id,
      orgId: user.org,
      status: 'upToDate',
      trainingVersion: training.versions[0].version,
      dueDate: new Date().getTime() + training.expirationDate,
      dateCompleted: 0,
      timeToDate: 0,
      assessmentResponses: [],
      certImage: null,
      notifySchedule: []
    };
    for (let notifyDays of training.notifySchedule) {
      let notifyEvent: NotifyEvent = {
        date: 0,
        subject: '',
        message: '',
        recipient: ''
      }
      let notifyMs = 86400000 * notifyDays;
      notifyEvent.date = (userTraining.dueDate - notifyMs);
      notifyEvent.subject = 'Training ' + training.title + ' must be completed in ' + notifyDays + ' days.';
      notifyEvent.message = "This is a Training due date notification.  Your training '" + training.title + "' must be completed in " + notifyDays + ".";
      notifyEvent.recipient = user.email;
      userTraining.notifySchedule.push(notifyEvent);
    }
    this.postUserTraining$(userTraining).subscribe(userTraining => {
      this.getUTForUser$(userTraining.uid).subscribe(userTrainings => {
        this.userTrainings$BS.next(userTrainings);
        this.uidUTHash[userTraining.uid] = userTrainings;
        this.uidUTHashBS$.next(this.uidUTHash);
        this.allUserTrainingHash[userTraining._id] = userTraining;
        let alert = <AlertModel>{
          type: 'success',
          message: 'The training "' + training.versions[0].title + '" has been assigned to ' + user.firstName + ' ' + user.lastName
        }
        this.notifyService.showAlert(alert);
      })
    })
  }

  bulkAssignTraining(uids: string[], training: TrainingModel, teamId: string, orgId: string) {
    let userTrainings: UserTrainingModel[] = [];
    let id = String(new Date().getTime());
    let dueDate = new Date().getTime() + (training.expirationDate * 86400000);
    let counter = 0;
    let found = false;
    let notifySchedule: NotifyEvent[] = [];
    for (let notifyDay of training.notifySchedule) {
      console.log('bulkAssignTraining', notifyDay, typeof notifyDay);
      let notifyEvent: NotifyEvent = {
        date: 0,
        subject: '',
        message: '',
        recipient: ''
      }
      let notifyMs = 86400000 * notifyDay;
      notifyEvent.date = dueDate - notifyMs;
      notifyEvent.subject = "Training '" + training.title + "' must be completed in " + notifyDay + " days.";
      notifyEvent.message = "This is a Training due date notification.  Your training '" + training.title + "' must be completed in " + notifyDay + " days.";
      notifySchedule.push(notifyEvent);
    }
    for (let uid of uids) {
      found = false;
      let utList = this.uidUTHash[uid];
      if (!utList) {
        utList = [];
      }
      for (let ut of utList) {
        if (ut.tid === training._id) {
          found = true;
          break;
        }
      }
      if (!found) {
        let uT: UserTrainingModel = {
          _id: id + counter,
          tid: training._id,
          uid: uid,
          teamId: teamId,
          orgId: orgId,
          status: 'upToDate',
          trainingVersion: training.versions[0].version,
          dueDate: dueDate,
          dateCompleted: 0,
          timeToDate: 0,
          assessmentResponses: [],
          certImage: null,
          notifySchedule: notifySchedule,
        };


        userTrainings.push(uT);
        utList.push(cloneDeep(uT));
        this.uidUTHash[uid] = cloneDeep(utList);
        counter++;
      }
    }

    let warningAlert: AlertModel;
    if (userTrainings.length === 0) {
      warningAlert = <AlertModel>{
        timestamp: new Date().getTime(),
        type: 'warning',
        message: 'The training "' + training.title + '" has already been assigned to these users.'
      }
      this.notifyService.showAlert(warningAlert);
    } else if (userTrainings.length < uids.length) {
      warningAlert = <AlertModel>{
        timestamp: new Date().getTime(),
        type: 'warning',
        message: (uids.length - userTrainings.length) + ' out of the ' + uids.length + ' users selected already have the training "' + training.title + '" assigned to them.'
      }
      this.notifyService.showAlert(warningAlert);
    }

    this.uidUTHashBS$.next(cloneDeep(this.uidUTHash));
    let dbCnt = 0;
    let batchAddedCount = 0;
    let startIndex = 0;
    let chunckSize = 500;
    let loopCnt = 0;
    let iterationCnt = Math.floor(userTrainings.length / chunckSize) + 1;
    while (startIndex < userTrainings.length) {
      let tmpArray = Object.assign([], userTrainings.slice(startIndex, startIndex + chunckSize));
      startIndex += chunckSize;
      this.postBulkUserTraining$(tmpArray).subscribe(userTrainingList => {
        loopCnt++;
        batchAddedCount += userTrainingList.length;
        for (let ut of userTrainingList) {
          this.uidList.push(ut.uid);
          /*
          if (this.uidUTHash[ut.uid]) {
            this.uidUTHash[ut.uid].push(ut);
          } else {
            this.uidUTHash[ut.uid] = [ut];
          }
          */
//          this.userTrainings$BS.next(this.uidUTHash[ut.uid]);
          this.allUserTrainingHash[ut._id] = ut;
        }
//        console.log('bulk assign returns ...', userTrainingList);
        this.bulkUserStatusUpdateBS$.next(cloneDeep(this.uidList));
        this.uidList = [];

        if ((loopCnt === iterationCnt) && (batchAddedCount === userTrainings.length)) {
          let successAlert = <AlertModel>{
            timestamp: new Date().getTime(),
            type: 'success',
            message: 'The training "' + training.title + '" has been assigned to ' + batchAddedCount + ' users.'
          }
          this.notifyService.showAlert(successAlert);
        } else if ((loopCnt === iterationCnt) && (batchAddedCount < userTrainings.length)) {
          let errorAlert = <AlertModel>{
            timestamp: new Date().getTime(),
            type: 'error',
            message: 'Houston, we have a problem.  We were only able to assign the training "' + training.title + '" to ' + batchAddedCount + ' out of ' + userTrainings.length + ' users.'
          }
          this.notifyService.showAlert(errorAlert);
        }
      });
    }
    this.getOrgUserTrainings(orgId);
  }

  deleteUTForTid(tid: string) {
    this.deleteUTForTid$(tid).subscribe();
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

  getOrgUserTrainings(orgId: string) {
    this.getUTForOrg$(orgId).subscribe(utList => {
      this.orgUserTrainingsBS$.next(utList);
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

  bulkDeleteTraining(uids: string[], tid: string) {
    /*
    let utIds: string[] = [];
    let utList: UserTrainingModel[] = [];
    for (let uid of uids) {
      utList = this.uidUTHash[uid];
      for (let ut of utList) {
        if (ut.tid === tid) {
          utIds.push(ut._id);
        }
      }
    }
    */
    let chunks = [];
    let deletedCnt = 0;
    let startIndex = 0;
    let chunkSize = 5000;
    let iterationCnt = uids.length / chunkSize;
    if (uids.length % chunkSize > 0) {
      iterationCnt++;
    }
    for (let i = 0; i < iterationCnt - 1; i++) {
      chunks.push(uids.slice(startIndex, startIndex + chunkSize));
      startIndex += chunkSize;
    }
    console.log('bulkDeleteTraining', chunks)
    for (let index in chunks) {

      this.bulkDeleteUserTrainings$(tid, chunks[index]).subscribe(responseObj => {
        console.log('bulkDeleteUserTrainings ', responseObj);
        deletedCnt += responseObj.n;

        if (Number(index) === (chunks.length - 1)) {
          let alert = <AlertModel>{
            timestamp: new Date().getTime(),
            type: 'success',
            message: 'The selected training has been removed from ' + deletedCnt + ' users.'
          }
          this.notifyService.showAlert(alert);

          let newUTList: UserTrainingModel[] = [];
          let utList: UserTrainingModel[];
          for (let uid of uids) {
            utList = this.uidUTHash[uid];
            for (let ut of utList) {
              if (ut.tid !== tid) {
                newUTList.push(ut);
              }
            }
            this.uidUTHash[uid] = cloneDeep(newUTList);
          }
          this.uidUTHashBS$.next(this.uidUTHash);
        }
      })
    }
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  bulkDeleteUserTrainings$(tid: string, uids: string[]): Observable<any> {
    return this.http
      .put<string[]>(`${ENV.BASE_API}usertraining/bulkdelete/${tid}`, uids, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  resetStatusForMany$(utObj: UserTrainingModel): Observable<any> {
    return this.http
      .put<UserTrainingModel>(`${ENV.BASE_API}usertraining/resetstatus/`, utObj, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

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
      .post<UserTrainingModel[]>(`${ENV.BASE_API}usertraining/newbulk/`, userTrainings, {
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

  deleteUTForTid$(tid: string): Observable<any> {
    return this.http
      .delete(`${ENV.BASE_API}usertraining/deletebulk/${tid}`, {
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
  getUTForOrg$(orgId: string): Observable<UserTrainingModel[]> {
    return this.http
      .get<UserTrainingModel[]>(`${ENV.BASE_API}usertraining/orgid/${orgId}`, {
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
  getUserTraining$(id: string): Observable<UserTrainingModel> {
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
//      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }


}
