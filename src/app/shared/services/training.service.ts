import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { FileService } from './file.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { TrainingModel, Section, Assessment, Question, Comment } from '../interfaces/training.type';
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

  statusMessageBS$ = new BehaviorSubject<{ color: string, msg: string }>(null);
  titleBS$ = new BehaviorSubject<string>('');
  selectedTrainingBS$ = new BehaviorSubject<TrainingModel>(null);
  selectedTrainingIndexBS$ = new BehaviorSubject<number>(null);
  showStatusBS$ = new BehaviorSubject<boolean>(false);
  showSelectedIndexFeedbackBS$ = new BehaviorSubject<boolean>(true);
  showSelectedItemBS$ = new BehaviorSubject<boolean>(false);
  action = '';
  actionBS$ = new BehaviorSubject<string>('');
  trainingsForSelectBS$ = new BehaviorSubject<{ label: string, value: string }[]>([]);
  trainingOptions: [{ label: string, value: string }] = [null];

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
    this.getTrainings$(this.authenticatedUser._id).subscribe(trainingList => {
      this.allTrainings = trainingList;

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
      this.selectItem(i);
      this.allTrainingsBS$.next(this.allTrainings);
      //      this.myTrainingCntBS$.next(this.myTrainings.length);
      this.allTrainingCntBS$.next(this.allTrainings.length);
    });
  }

  getTrainingOptionsStream(): Observable<{ label: string, value: string }[]> {
    return this.trainingsForSelectBS$.asObservable();
  }

  selectItem(index) {
    if (index < 0 || index >= this.allTrainings.length) {
      //      this.showSelectedItemBS$.next(false);
      //      this.showSelectedIndexFeedbackBS$.next(false);
      this.selectedTrainingBS$.next(null);
      this.selectedTrainingIndexBS$.next(index);
      this.setAction('');
      return;
    }
    this.selectedTrainingBS$.next(this.allTrainings[index]);
    this.selectedTrainingIndexBS$.next(index);
    //    this.showSelectedItemBS$.next(true);
    //    this.showStatusBS$.next(false);
    //    this.showSelectedIndexFeedbackBS$.next(true);
  }

  setAction(action: string) {
    this.actionBS$.next(action);
  }

  getActionStream(): Observable<string> {
    return this.actionBS$.asObservable();
  }

  getShowSelectedItemStream(): Observable<boolean> {
    return this.showSelectedItemBS$.asObservable();
  }

  getSelectedTrainingIndexStream(): Observable<number> {
    return this.selectedTrainingIndexBS$.asObservable();
  }

  getShowSelectedIndexFeedbackStream(): Observable<boolean> {
    return this.showSelectedIndexFeedbackBS$.asObservable();
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
    const assessment = <Assessment>{
      questions: []
    }

    const sections = <Section[]>[
      {
        title: 'Your title goes here',
        intro: 'This is an introduction to the first document',
        files: [],
        assessment: null
      }
    ];

    const newTraining = <TrainingModel>{
      _id: String(new Date().getTime()),
      title: 'New Training',
      description: 'This is a useless description',
      type: 'online',
      iconClass: 'fal fa-file-alt',
      iconColor: 'red',
      iconSource: 'fontawesome',
      teamId: this.authenticatedUser._id,
      owner: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      estimatedTimeToComplete: 0,
      image: 'assets/images/others/blue_matrix-Banner.jpg',
      sections: sections,
      assessment: assessment,
      tags: []
    };
//    this.allTrainings.push(newTraining);
//    this.allTrainingsBS$.next(this.allTrainings);
//    this.selectedTrainingIndexBS$.next(this.allTrainings.length - 1);
    this.actionBS$.next('new');
    //    this.showSelectedIndexFeedbackBS$.next(true);
    //    this.showSelectedItemBS$.next(true);
    this.selectedTrainingBS$.next(newTraining);

  }

  createTraining(training: TrainingModel) {
    this.postTraining$(training).subscribe(trainingObj => {
      this.loadData();
    });
  }

  deleteTraining(id: string) {
    this.deleteTraining$(id).subscribe(item => {
      this.allTrainings.splice(this.selectedTrainingIndexBS$.value, 1);
      this.loadData();
    })
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  getTrainings$(org: string): Observable<TrainingModel[]> {
    return this.http
      .get<TrainingModel[]>(`${ENV.BASE_API}trainings/${org}`)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  saveTraining(training: TrainingModel) {
    this.editTraining$(training).subscribe(data => {
      this.loadData();
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
