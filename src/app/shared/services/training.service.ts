import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { FileService } from './file.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { TrainingModel, Page, Portlet, TextBlock, Assessment, TrainingIdHash } from '../interfaces/training.type';
import { UserModel } from '../interfaces/user.type';
import { TrainingsModule } from 'src/app/components/trainings/trainings.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  // The training service maintains a set of hashmaps.
  // These hashmaps map an object id to the object itself.
  // Hashmaps are used because there is no poportunity for duplicate objects in the system
  // and there is no dependency on ones position in an array.
  // This service streams arrays of object ids to the components, these arrays are generated from
  // the hashmap themself and not by pushing id's onto an array.

  private authenticatedUser: UserModel;

  private allTrainingHashBS$ = new BehaviorSubject<TrainingIdHash>({});
  private jobTitlesBS$ = new BehaviorSubject<string[]>([]);

  // teamTrainings is an array of training id's created by the team
  private teamTrainingHashBS$ = new BehaviorSubject<TrainingIdHash>({});
  private teamTrainingCntBS$ = new BehaviorSubject<number>(0);

  private teamTrainingHash = {};
  private systemTrainingHash = {};
  private sharedTrainingHash = {};
  private allTrainingHash = {};
  private jobTitles: string[] = [];
  private teamTrainingIds: string[];
  private systemTrainingIds: string[];
  private sharedTrainingIds: string[];
  private allTrainingIds: string[];

  teamId: string;

  selectedTrainingBS$ = new BehaviorSubject<TrainingModel>(null);

  // Using Angular DI we use the HTTP service
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private userService: UserService,
    private fileService: FileService,
    private sanitizer: DomSanitizer) {

    this.userService.getAuthenticatedUserStream().subscribe(user => {
      if (user) {
        this.teamId;
        this.authenticatedUser = user;
        // non-null teamId indicates an individual contributor
        if (this.authenticatedUser.userType === 'individualContributor') {
          this.teamId = this.authenticatedUser.teamId;
        } else if (this.authenticatedUser.userType === 'supervisor') {
          this.teamId = this.authenticatedUser.uid;
        }

        // load team trainings
        this.getTrainings$(this.teamId).subscribe(teamTrainings => {
          if (!teamTrainings) {
            teamTrainings = [];
          }
          for (let training of teamTrainings) {
            this.teamTrainingHash[training._id] = training;
            this.allTrainingHash[training._id] = training;
            if (training.jobTitle) {
              this.jobTitles.push(training.jobTitle);
            }
          }
          let teamTrainingIds = Object.keys(this.teamTrainingHash);
          this.teamTrainingHashBS$.next(this.teamTrainingHash);
          this.teamTrainingCntBS$.next(teamTrainingIds.length);

          // Load system trainings
          this.getTrainings$('mytrainingdocs').subscribe(systemTrainings => {
            if (!systemTrainings) {
              systemTrainings = [];
            }
            for (let training of systemTrainings) {
              this.systemTrainingHash[training._id] = training;
              this.allTrainingHash[training._id] = training;
              if (training.jobTitle) {
                this.jobTitles.push(training.jobTitle);
              }
            }

            // load shared trainings
            this.getTrainings$(this.authenticatedUser.org).subscribe(sharedTrainings => {
              if (!sharedTrainings) {
                sharedTrainings = [];
              }
              for (let training of sharedTrainings) {
                this.sharedTrainingHash[training._id] = training;
                this.allTrainingHash[training._id] = training;
                if (training.jobTitle) {
                  this.jobTitles.push(training.jobTitle);
                }
              }
              this.allTrainingIds = Object.keys(this.allTrainingHash);

              this.jobTitlesBS$.next(this.jobTitles);
              this.allTrainingHashBS$.next(this.allTrainingHash);
            });
          });
        });
      }
    });
  }

  reloadTeamTrainings() {
    console.log('trainingService reloadTeamTrainings', this.teamId);
    this.teamTrainingHash = {};
    this.getTrainings$(this.teamId).subscribe(teamTrainings => {
      if (!teamTrainings) {
        teamTrainings = [];
      }
      for (let training of teamTrainings) {
        this.teamTrainingHash[training._id] = training;
        this.allTrainingHash[training._id] = training;
      }
      this.teamTrainingHashBS$.next(this.teamTrainingHash);
      this.allTrainingHashBS$.next(this.allTrainingHash);
    });
  }

  reloadAllTrainings() {
    this.allTrainingHash = {};
    this.teamTrainingHash = {};
    this.sharedTrainingHash = {};
    this.systemTrainingHash = {};
    this.getTrainings$(this.teamId).subscribe(teamTrainings => {
      if (!teamTrainings) {
        teamTrainings = [];
      }
      for (let training of teamTrainings) {
        this.teamTrainingHash[training._id] = training;
        this.allTrainingHash[training._id] = training;
      }
      let teamTrainingIds = Object.keys(this.teamTrainingHash);
      this.teamTrainingHashBS$.next(this.teamTrainingHash);
      this.teamTrainingCntBS$.next(teamTrainingIds.length);

    
      console.log('reloadAllTrainings - teamTrainingHash, teamTrainingCnt', this.teamTrainingHash, teamTrainingIds);
      // Load system trainings
      this.getTrainings$('mytrainingdocs').subscribe(systemTrainings => {
        if (!systemTrainings) {
          systemTrainings = [];
        }
        for (let training of systemTrainings) {
          this.systemTrainingHash[training._id] = training;
          this.allTrainingHash[training._id] = training;
        }

        // load shared trainings
        this.getTrainings$(this.authenticatedUser.org).subscribe(sharedTrainings => {
          if (!sharedTrainings) {
            sharedTrainings = [];
          }
          for (let training of sharedTrainings) {
            this.sharedTrainingHash[training._id] = training;
            this.allTrainingHash[training._id] = training;
          }
          this.allTrainingIds = Object.keys(this.allTrainingHash);

          console.log('trainingService init', this.allTrainingHash);
          this.allTrainingHashBS$.next(this.allTrainingHash);
        });
      });
    });
  }

  selectTraining(tid: string): void {
    this.selectedTrainingBS$.next(this.allTrainingHash[tid]);
  }

  getJobTitleStream(): Observable<string[]> {
    return this.jobTitlesBS$.asObservable();
  }

  getAllTrainingHashStream(): Observable<TrainingIdHash> {
    return this.allTrainingHashBS$.asObservable();
  }

  getTeamTrainingHashStream(): Observable<TrainingIdHash> {
    return this.teamTrainingHashBS$.asObservable();
  }

  getTeamTrainingCntStream(): Observable<number> {
    return this.teamTrainingCntBS$.asObservable();
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
    this.postTraining$(newTraining).subscribe(trainingObj => {
      this.reloadAllTrainings();
    });
  }

  addNewPage(trainingId: string, type: string, url: string, fileId: string, pageTitle: string): Page {
    if (!pageTitle || pageTitle === '') {
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

    if (!this.teamTrainingHash[trainingId]) {
      console.log('TrainingService:addNewPage : ERROR : trainingId not found in teamTrainingHash', trainingId, this.teamTrainingHash);
      return;
    }
    this.teamTrainingHash[trainingId].pages.push(newPage);
    this.saveTraining(this.teamTrainingHash[trainingId], false);
    this.selectedTrainingBS$.next(this.teamTrainingHash[trainingId]);
    return newPage;
  }

  createTraining(training: TrainingModel) {
    this.postTraining$(training).subscribe(trainingObj => {
      this.reloadAllTrainings();
    });
  }

  deleteTraining(id: string) {
    this.deleteTraining$(id).subscribe(item => {
      this.reloadAllTrainings();
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

  saveTraining(training: TrainingModel, reload: boolean) {

    this.editTraining$(training).subscribe(data => {
      if (reload) {
        this.reloadAllTrainings();
      }
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
