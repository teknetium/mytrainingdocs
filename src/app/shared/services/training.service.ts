import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { FileService } from './file.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { TrainingModel, Page, Portlet, TextBlock, Assessment, TrainingIdHash, TrainingVersion } from '../interfaces/training.type';
import { UserModel } from '../interfaces/user.type';
import { TrainingsModule } from 'src/app/components/trainings/trainings.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as cloneDeep from 'lodash/cloneDeep';


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

  trainingCollectionHash = {};
  trainingWCCollectionHash = {};

  teamId: string;
  archivedTrainingCnt = 0;

  selectedTrainingBS$ = new BehaviorSubject<TrainingModel>(null);
  selectedTrainingWCBS$ = new BehaviorSubject<TrainingModel>(null);
  selectedTrainingVersionsBS$ = new BehaviorSubject<TrainingVersion[]>(null);

  trainingIsDirtyBS$ = new BehaviorSubject<boolean>(false);

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
            this.trainingCollectionHash[training._id] = training;
            /*
            if (training.status === 'unlocked') {
              this.getTrainingWCById$(training._id).subscribe(trainingObj => {
                if (trainingObj) {
                  this.trainingWCCollectionHash[trainingObj._id] = trainingObj;
                  this.allTrainingHash[trainingObj._id] = trainingObj;
                  this.teamTrainingHash[trainingObj._id] = trainingObj;
                }
              });
            }
            */
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
  /*
    getTrainingVersions(tid: string) {
      if (this.trainingWCCollectionHash[tid]) {
        this.selectedTrainingVersionsHash[this.trainingWCCollectionHash[tid].versionPending] = this.trainingWCCollectionHash[tid];
      }
  
      let versions = this.trainingCollectionHash[tid].versions;
      this.archivedTrainingCnt = versions.length - 1;
      let index;
  
      for (index in versions) {
        if (index === 0) {
          this.selectedTrainingVersionsHash[versions[index]] = this.trainingCollectionHash[tid];
        } else {
          this.trainingArchiveService.getArchivedTraining(tid, versions[index]).subscribe(training => {
            if (training) {
              this.selectedTrainingVersionsHash[training.versions[0]] = training;
            }
          })
        }
      }
  
  
  
      if (this.trainingWCCollectionHash[tid] && this.trainingWCCollectionHash[tid].versionPending === version) {
        this.selectedTrainingVersionsHash[]
        this.selectedTrainingBS$.next(this.trainingWCCollectionHash[tid]);
      } else if (this.trainingCollectionHash[tid] && this.trainingCollectionHash[tid].versions[0] === version) {
        this.selectedTrainingBS$.next(this.trainingCollectionHash[tid]);
      } else {
        let archivedTid = tid + '_' + version;
        this.trainingArchiveService.getArchivedTraining(tid, version).subscribe(training => {
          if (training) {
            this.selectedTrainingBS$.next(training);
          }
        })
      }
    }
    */
  /*
    getVersionsForTrainingId(tid): string[] {
      return this.trainingCollectionHash[tid].versions;
    }
  
    getMainCollectionObject(tid: string): TrainingModel {
      return this.trainingCollectionHash[tid];
    }
  
    getWCCollectionObject(tid: string): TrainingModel {
      return this.trainingWCCollectionHash[tid];
    }
  */
  reloadTeamTrainings() {
    console.log('trainingService reloadTeamTrainings', this.teamId);
    this.teamTrainingHash = {};
    //    this.trainingCollectionHash = {};
    //    this.trainingWCCollectionHash = {};
    this.getTrainings$(this.teamId).subscribe(teamTrainings => {
      if (!teamTrainings) {
        teamTrainings = [];
      }
      for (let training of teamTrainings) {
        this.trainingCollectionHash[training._id] = training;
        /*
        if (training.status === 'unlocked') {
          this.getTrainingWCById$(training._id).subscribe(trainingObj => {
            this.trainingWCCollectionHash[trainingObj._id] = trainingObj;
            this.allTrainingHash[trainingObj._id] = trainingObj;
            this.teamTrainingHash[trainingObj._id] = trainingObj;
          });
        }
        */
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
    //    this.sharedTrainingHash = {};
    //    this.systemTrainingHash = {};
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
      /*
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
        */
    });
  }

  selectTraining(tid: string): void {
    if (!tid) {
      this.selectedTrainingBS$.next(null);
      this.selectedTrainingWCBS$.next(null);
      return;
    }

    this.selectedTrainingWCBS$.next(this.allTrainingHash[tid]);
    this.selectedTrainingBS$.next(this.allTrainingHash[tid]);
    this.selectedTrainingVersionsBS$.next(this.allTrainingHash[tid].versions);
  }

  getJobTitleStream(): Observable<string[]> {
    return this.jobTitlesBS$.asObservable();
  }

  getTrainingIsDirtyStream(): Observable<boolean> {
    return this.trainingIsDirtyBS$.asObservable();
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
  getSelectedTrainingWCStream(): Observable<TrainingModel> {
    return this.selectedTrainingWCBS$.asObservable();
  }
  getSelectedTrainingVersionsStream(): Observable<TrainingVersion[]> {
    return this.selectedTrainingVersionsBS$.asObservable();
  }

  addNewTraining() {
    const baseId = new Date().getTime();

    const assessment = <Assessment>{
      _id: String(baseId + 'assessment'),
      type: '',
      timeLimit: 0,
      passingGrade: 70,
      items: []
    }

    let readOnlyTraining: TrainingModel;

    const newTraining = <TrainingModel>{
      _id: String(baseId),
      type: 'online',
      versions: [],
      versionPending: '',
      title: 'New Training Template',
      status: 'locked',
      rating: [],
      teamId: this.teamId,
      owner: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      estimatedTimeToComplete: 0,
      jobTitle: '',
      description: 'This is a useless description',
      image: 'assets/images/others/bb.jpg',
      introductionLabel: 'Training Introduction',
      introduction: 'Replace this text.',
      execSummaryLabel: 'Replace this text.',
      execSummary: 'Replace this text.',
      goalsLabel: 'Replace this text.',
      goals: 'Replace this text.',
      iconClass: 'fad fa-graduation-cap',
      iconColor: 'orange',
      iconSource: 'fontawesome',
      files: [],
      pages: [],
      assessment: assessment,
      useAssessment: true,
      interestList: [],
      shared: false,
      isValid: {
        config: false,
        intro: false,
        mainContent: false,
        assessment: false
      },
      isDirty: false
    };

    let newTrainingVersionObj: TrainingVersion = {
      _id: String(new Date().getTime()),
      version: '1_0_0T',
      pending: true,
      changeLog: 'This is the new training template.',
      ownerId: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      title: 'New Training',
      iconClass: 'fad fa-graduation-cap',
      iconColor: 'orange',
      trainingObj: null
    };
    newTraining.versions.unshift(newTrainingVersionObj);
    readOnlyTraining = cloneDeep(newTraining);

    newTraining.versions[0].trainingObj = readOnlyTraining;

    newTraining.status = 'unlocked';

    this.postTraining$(newTraining).subscribe(trainingObj => {
      this.selectedTrainingBS$.next(trainingObj)  
      this.selectedTrainingWCBS$.next(trainingObj)  
      this.reloadAllTrainings();
    });
  }

  selectVersion(training: TrainingModel) {
    this.selectedTrainingBS$.next(training);

  }

  selectTrainingVersion(training: TrainingModel) {
    this.selectedTrainingBS$.next(training);
  }
  selectTrainingWC(training: TrainingModel) {
    this.selectedTrainingWCBS$.next(training);
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

    let trainingObj = this.teamTrainingHash[trainingId];

    this.teamTrainingHash[trainingId].isValid['mainContent'] = true;
    this.teamTrainingHash[trainingId].pages.push(newPage);
    this.saveTraining(this.teamTrainingHash[trainingId], false);
    this.selectedTrainingWCBS$.next(this.teamTrainingHash[trainingId]);
    return newPage;
  }

  unlockTraining(training) {
    training.status = 'unlocked';
    this.editTraining$(training).subscribe(trainingObj => {

      //      this.createTrainingWC(trainingObj);
      this.reloadAllTrainings();
    })
  }

  createTraining(training: TrainingModel) {
    this.postTraining$(training).subscribe(trainingObj => {
      this.reloadAllTrainings();
    });
  }
  /*
    createTrainingWC(training: TrainingModel) {
      this.postTrainingWC$(training).subscribe(trainingObj => {
        console.log('create training WC', training);
      });
    }
    */

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

  saveNewVersion(training: TrainingModel) {
    console.log('saveNewVersion', training);
    this.editTraining$(training).subscribe(data => {
      console.log('TrainingService:saveNewVersion', training, data);
      this.selectedTrainingVersionsBS$.next(training.versions);
//      this.selectedTrainingBS$.next(data);
      this.reloadAllTrainings();
    });

  }

  saveTraining(training: TrainingModel, reload: boolean) {
    this.trainingIsDirtyBS$.next(true);
    this.editTraining$(training).subscribe(data => {
      if (reload) {
//        this.selectedTrainingBS$.next(data);
        this.reloadAllTrainings();
        this.selectTrainingVersion(training)
      }
    });
    //    this.editTrainingWC$(training).subscribe(data => {
    //      this.reloadAllTrainings();
    //    });
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
  /*
  getTrainingWCById$(id: string): Observable<TrainingModel> {
    return this.http
      .get<TrainingModel>(`${ENV.BASE_API}trainingsworkingcopy/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
*/

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
  /*
    postTrainingWC$(training: TrainingModel): Observable<TrainingModel> {
      return this.http
        .post<TrainingModel>(`${ENV.BASE_API}trainingworkingcopy/new`, training, {
          headers: new HttpHeaders().set('Authorization', this._authHeader)
        })
        .pipe(
          catchError((error) => this._handleError(error))
        );
    }
    */

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
  /*
  editTrainingWC$(training: TrainingModel): Observable<TrainingModel> {
    return this.http
      .put<TrainingModel>(`${ENV.BASE_API}trainingsworkingcopy/${training._id}`, training, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  */

  // DELETE existing training and all associated Users (admin only)
  deleteTraining$(id: string): Observable<TrainingModel> {
    return this.http
      .delete(`${ENV.BASE_API}trainings/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  /*
  deleteTrainingWC$(id: string): Observable<TrainingModel> {
    return this.http
      .delete(`${ENV.BASE_API}trainingsworkingcopy/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }
  */

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
