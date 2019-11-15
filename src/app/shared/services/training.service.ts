import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { FileService } from './file.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { TrainingModel, Page, Portlet } from '../interfaces/training.type';
import { UserModel } from '../interfaces/user.model';


@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  private authenticatedUser: UserModel;
  private allTrainings: TrainingModel[] = [];
  private myTrainings: TrainingModel[] = [];

  private allTrainingsBS$: BehaviorSubject<TrainingModel[]>;
  private myTrainingsBS$: BehaviorSubject<TrainingModel[]>;
  private allTrainingCntBS$: BehaviorSubject<number>;
  private myTrainingCntBS$: BehaviorSubject<number>;
  private viewModeBS$ = new BehaviorSubject<string>('edit');

  statusMessageBS$ = new BehaviorSubject<{ color: string, msg: string }>(null);
  titleBS$ = new BehaviorSubject<string>('');
  selectedTrainingBS$ = new BehaviorSubject<TrainingModel>(null);
  selectedTrainingIndexBS$ = new BehaviorSubject<number>(null);
  currentTrainingIndex = -1;
  
  action = '';
  actionBS$ = new BehaviorSubject<string>('');
  trainingsForSelectBS$ = new BehaviorSubject<{ label: string, value: string }[]>([]);
  trainingOptions: [{ label: string, value: string }] = [null];
  showEditor$ = new BehaviorSubject<boolean>(false);

  // Using Angular DI we use the HTTP service
  constructor(private http: HttpClient, private auth: AuthService, private userService: UserService, private fileService: FileService) {
    this.allTrainingsBS$ = new BehaviorSubject<TrainingModel[]>(this.allTrainings);
    this.allTrainingCntBS$ = new BehaviorSubject<number>(this.allTrainings.length);
    this.myTrainingsBS$ = new BehaviorSubject<TrainingModel[]>(this.myTrainings);
    this.myTrainingCntBS$ = new BehaviorSubject<number>(this.myTrainings.length);
    this.userService.getAuthenticatedUserStream().subscribe(user => {
      if (user) {
        this.authenticatedUser = user;
        this.action = 'init';
        this.loadData();
      }

    });
  }

  loadData() {
    this.getTrainings$(this.authenticatedUser.uid).subscribe(trainingList => {
      this.allTrainings = trainingList;
/*
      let i;
      if (this.action === 'save') {
        i = this.selectedTrainingIndexBS$.value;
      } else if (this.action === 'init') {
        i = -1;
      } else if (this.action === 'add') {
        i = this.allTrainings.length - 1;
      } else {
        if (this.selectedTrainingIndexBS$.value > this.allTrainings.length - 1) {
          i = this.allTrainings.length - 1;
        } else {
          i = this.selectedTrainingIndexBS$.value;
        }
      }
      */
      
      this.allTrainingsBS$.next(this.allTrainings);
      //      this.myTrainingCntBS$.next(this.myTrainings.length);
      this.allTrainingCntBS$.next(this.allTrainings.length);
      this.selectItemForEditing(this.currentTrainingIndex);

    });
  }

  getShowEditorStream() {
    return this.showEditor$.asObservable();
  }

  changeEditorVisualState(newState) {
    this.showEditor$.next(newState);
    this.selectedTrainingIndexBS$.next(-1);
  }

  getTrainingOptionsStream(): Observable<{ label: string, value: string }[]> {
    return this.trainingsForSelectBS$.asObservable();
  }

  setViewMode(mode) {
    this.viewModeBS$.next(mode);
  }

  selectItemForEditing(index) {
    if (index < 0 || index >= this.allTrainings.length) {
      //      this.showSelectedItemBS$.next(false);
      //      this.showSelectedIndexFeedbackBS$.next(false);
      this.showEditor$.next(false);
      this.selectedTrainingIndexBS$.next(-1);
      this.currentTrainingIndex = -1;
      this.setAction('');
      return;
    }

    this.currentTrainingIndex = index;

    this.showEditor$.next(true);
    this.selectedTrainingBS$.next(this.allTrainings[index]);
    this.selectedTrainingIndexBS$.next(index);
    this.actionBS$.next('editTraining');

  }
/*
  selectItem(index) {
    if (index < 0 || index >= this.allTrainings.length) {
      //      this.showSelectedItemBS$.next(false);
      //      this.showSelectedIndexFeedbackBS$.next(false);
      this.showEditor$.next(false);
      this.selectedTrainingIndexBS$.next(-1);
      this.setAction('');
      return;
    }

    this.showEditor$.next(true);
    this.selectedTrainingBS$.next(this.allTrainings[index]);
    this.selectedTrainingIndexBS$.next(index);
    this.actionBS$.next('editTraining');

    //    this.showSelectedItemBS$.next(true);
    //    this.showStatusBS$.next(false);
    //    this.showSelectedIndexFeedbackBS$.next(true);
  }
*/
  setAction(action: string) {
    this.actionBS$.next(action);
  }

  getViewModeStream(): Observable<string> {
    return this.viewModeBS$.asObservable();
  }

  getActionStream(): Observable<string> {
    return this.actionBS$.asObservable();
  }

  getSelectedTrainingIndexStream(): Observable<number> {
    return this.selectedTrainingIndexBS$.asObservable();
  }

  getStatusStream(): Observable<{ color: string, msg: string }> {
    return this.statusMessageBS$.asObservable();
  }

  getMyTrainingsObservable(): Observable<TrainingModel[]> {
    return this.myTrainingsBS$.asObservable();
  }

  getAllTrainingsObservable(): Observable<TrainingModel[]> {
    return this.allTrainingsBS$.asObservable();
  }
  getMyTrainingCntObservable(): Observable<number> {
    return this.myTrainingCntBS$.asObservable();
  }

  getAllTrainingCntObservable(): Observable<number> {
    return this.allTrainingCntBS$.asObservable();
  }

  getSelectedTrainingStream(): Observable<TrainingModel> {
    return this.selectedTrainingBS$.asObservable();
  }

  addNewTraining() {
    const baseId = new Date().getTime();
    const portlet1 = <Portlet>{
      _id: String(baseId + '-01'),
      file: null,
      width: 100,
      height: 80,
      xLoc: 0,
      yLoc: 0
    };

    const page = <Page>{
      _id: String(new Date().getTime()),
      title: 'Page Title',
      intro: 'Page Intro',
      portlets: [portlet1],
    };

    const newTraining = <TrainingModel>{
      _id: String(new Date().getTime()),
      type: 'online',
      title: 'New Training',
      teamId: this.authenticatedUser.uid,
      owner: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      estimatedTimeToComplete: 0,
      description: 'This is a useless description',
      introduction: 'This is the introduction to this training.',
      introductionLabel: 'Introduction',
      execSummaryLabel: 'Executive Summary',
      execSummary: 'Tell the execs whatever they need to hear.',
      goals: 'What your manager hopes you get out of this experience.',
      goalsLabel: 'Goals',
      image: 'assets/images/others/bb.jpg',
      iconClass: 'fal fa-graduation-cap',
      iconColor: 'black',
      iconSource: 'fontawesome',
      pages: [page],
      assessment: null
    };
//    this.allTrainings.push(newTraining);
//    this.allTrainingsBS$.next(this.allTrainings);
//    this.selectedTrainingIndexBS$.next(this.allTrainings.length - 1);
    this.postTraining$(newTraining).subscribe(trainingObj => {
      this.loadData();
      this.selectedTrainingIndexBS$.next(-1);
      this.showEditor$.next(false);
    });
    this.actionBS$.next('newTraining');
    //    this.showSelectedIndexFeedbackBS$.next(true);
    //    this.showSelectedItemBS$.next(true);
//    this.selectedTrainingBS$.next(newTraining);
//    this.showEditor$.next(true);

  }

  createTraining(training: TrainingModel) {
    this.postTraining$(training).subscribe(trainingObj => {
      this.loadData();
      this.showEditor$.next(false);
      this.selectedTrainingIndexBS$.next(-1);
    });
  }

  deleteTraining(id: string) {
    this.deleteTraining$(id).subscribe(item => {
      this.allTrainings.splice(this.selectedTrainingIndexBS$.value, 1);
      this.loadData();
      this.showEditor$.next(false);
      this.selectedTrainingIndexBS$.next(-1);
      })
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  getTrainings$(teamId: string): Observable<TrainingModel[]> {
    return this.http
      .get<TrainingModel[]>(`${ENV.BASE_API}trainings/${teamId}`)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  saveTraining(training: TrainingModel) {
    this.editTraining$(training).subscribe(data => {

      this.loadData();
      this.selectItemForEditing(this.currentTrainingIndex);
    });
  }


  // GET a training by ID (login required)
  getTrainingById$(id: string): Observable<TrainingModel> {
    return this.http
      .get<TrainingModel>(`${ENV.BASE_API}training/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }


  // POST new training (admin only)
  postTraining$(training: TrainingModel): Observable<TrainingModel> {
    return this.http
      .post<TrainingModel>(`${ENV.BASE_API}training/new`, training, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // PUT existing training (admin only)
  editTraining$(training: TrainingModel): Observable<TrainingModel> {
    return this.http
      .put<TrainingModel>(`${ENV.BASE_API}trainings/${training._id}`, training, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing training and all associated Users (admin only)
  deleteTraining$(id: string): Observable<any> {
    return this.http
      .delete(`${ENV.BASE_API}trainings/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET all trainings for a specific user
  getUserTrainings$(userId: string): Observable<TrainingModel[]> {
    return this.http
      .get<TrainingModel[]>(`${ENV.BASE_API}trainings/${userId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  // GET Users by training ID (login required)
  /*
  getUsersBytrainingId$(trainingId: string): Observable<UserModel[]> {
    return this.http
      .get<UserModel[]>(`${ENV.BASE_API}training/${trainingId}/Users`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  */

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
