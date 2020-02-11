import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { FileService } from './file.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { TrainingModel, Page, Portlet, TextBlock, Assessment } from '../interfaces/training.type';
import { UserModel } from '../interfaces/user.type';
import { SafeResourceUrl } from '@angular/platform-browser';


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
  trainingIdHash = {};
  teamId;

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
        if (this.authenticatedUser.userType === 'supervisor') {
          this.teamId = this.authenticatedUser.uid;
        } else if (this.authenticatedUser.userType === 'individualContributor') {
          this.teamId = this.authenticatedUser.teamId;
        }
        this.loadData();
        /*
        this.getTrainings$(this.authenticatedUser.uid).subscribe(trainingList => {
          if (!trainingList) {
            return;
          }

          this.allTrainings = trainingList;

          for (const training of this.allTrainings) {
            this.trainingIdHash[training._id] = training;
          }
        });
        */
      }
    });
  }

  loadData() {
    this.getTrainings$(this.teamId).subscribe(trainingList => {
      this.allTrainings = trainingList;
      for (const training of this.allTrainings) {
        this.trainingIdHash[training._id] = training;
      }
      this.allTrainingsBS$.next(this.allTrainings);
      //      this.myTrainingCntBS$.next(this.myTrainings.length);
      this.allTrainingCntBS$.next(this.allTrainings.length);
      this.selectItemForEditing(this.currentTrainingIndex, '');

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

  selectItemForEditing(index: number, utid: string) {
    if (index < 0 || index >= this.allTrainings.length) {
      //      this.showSelectedItemBS$.next(false);
      //      this.showSelectedIndexFeedbackBS$.next(false);
      this.showEditor$.next(false);
      this.selectedTrainingIndexBS$.next(-1);
      this.currentTrainingIndex = -1;
      this.setAction('');
      this.selectedTrainingBS$.next(null);
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
      width: 300,
      height: 200,
      xLoc: 0,
      yLoc: 0
    };
    const textBlock1 = <TextBlock>{
      _id: String(baseId + '-01'),
      label: '1  This is the LABEL of this text block.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ',
      width: 300,
      height: 200,
      xLoc: 0,
      yLoc: 0
    };

    const textBlock2 = <TextBlock>{
      _id: String(baseId + '-01'),
      label: '2  This is the LABEL of this text block.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ',
      width: 40,
      height: 20,
      xLoc: 0,
      yLoc: 0
    };

    const mainContentPage = <Page>{
      _id: String(new Date().getTime()),
      type: 'text',
      url: '',
      title: 'Upload Your Content Here',
      intro: 'Introduction',
      file: null,
      portlets: [portlet1],
      textBlocks: [textBlock1, textBlock2]
    };
    const introPage = <Page>{
      _id: String(new Date().getTime()),
      type: 'text',
      url: '',
      title: 'Title Page',
      intro: 'Introduction',
      file: null,
      portlets: [portlet1],
      textBlocks: [textBlock1, textBlock2]
    };
    const assessmentPage = <Page>{
      _id: String(new Date().getTime()),
      type: 'text',
      url: '',
      title: 'Assessments',
      intro: 'Create a test to evaluate mastery of the content presented in this training. Questions are multiple choice and can have multiple correct choices. Each test must include at least 3 questions.',
      file: null,
      portlets: [],
      textBlocks: []
    };
    const rateCommentPage = <Page>{
      _id: String(new Date().getTime()),
      type: 'text',
      url: '',
      title: 'Ratings and Comments',
      intro: '',
      file: null,
      portlets: [portlet1],
      textBlocks: [textBlock1, textBlock2]
    };

    const assessment = <Assessment>{
      _id: String(new Date().getTime()),
      type: 'choiceFeedback',
      timeLimit: 0,
      passingGrade: 70,
      items: []
    }

    const newTraining = <TrainingModel>{
      _id: String(new Date().getTime()),
      type: 'online',
      version: '1.0.0',
      title: 'New Training',
      status: 'Under Development',
      rating: [],
      teamId: this.teamId,
      owner: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      estimatedTimeToComplete: 30,
      jobTitle: '',
      description: 'This is a useless description',
      image: 'assets/images/others/bb.jpg',
      introductionLabel: 'Training Introduction',
      introduction: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ',
      execSummaryLabel: 'Executive Summary Label',
      execSummary: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      goalsLabel: 'Goals Label',
      goals: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      iconClass: 'fad fa-graduation-cap',
      iconColor: 'black',
      iconSource: 'fontawesome',
      files: [],
      pages: [],
      assessment: assessment,
      useAssessment: false,
      interestList: [],
      shared: false
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

  addNewPage(trainingId: string, type: string, url: string, fileId: string, pageTitle: string) {
    if (pageTitle === '') {
      return;
    }
    const newPage = <Page>{
      _id: String(new Date().getTime()),
      type: type,
      url: url,
      title: pageTitle,
      intro: 'Introduction to the document',
      file: fileId,
      portlets: [],
    };

    this.trainingIdHash[trainingId].pages.push(newPage);
    this.saveTraining(this.trainingIdHash[trainingId], true);
    this.selectedTrainingBS$.next(this.trainingIdHash[trainingId]);
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

  saveTraining(training: TrainingModel, loadData: boolean) {
    
    this.editTraining$(training).subscribe(data => {

      if (loadData) {
        this.loadData();
      }
      //      this.selectItemForEditing(this.currentTrainingIndex);
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
