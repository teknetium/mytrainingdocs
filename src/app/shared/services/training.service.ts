import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserTrainingService } from './userTraining.service';
import { JobTitleService } from './jobtitle.service';
import { UserService } from './user.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { AssessmentItem } from "../interfaces/assessment.type";
import { TrainingModel, Page, Content, TrainingIdHash, TrainingVersion } from '../interfaces/training.type';
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

  private teamTrainingHashBS$ = new BehaviorSubject<TrainingIdHash>({});
  private teamTrainingCntBS$ = new BehaviorSubject<number>(0);


  private teamTrainingHash = {};
  private systemTrainingHash = {};
  private sharedTrainingHash = {};
  private allTrainingHash = {};
  private trainingArchiveListHash = {};
  private teamTrainingIds: string[];
  private systemTrainingIds: string[];
  private sharedTrainingIds: string[];
  private allTrainingIds: string[];

  //  trainingCollectionHash = {};

  teamId: string;
  archivedTrainingCnt = 0;

  selectedTrainingBS$ = new BehaviorSubject<TrainingModel>(null);
  selectedTrainingWCBS$ = new BehaviorSubject<TrainingModel>(null);
  selectedTrainingVersionsBS$ = new BehaviorSubject<TrainingVersion[]>(null);

  trainingIsDirtyBS$ = new BehaviorSubject<boolean>(false);
  categoriesBS$ = new BehaviorSubject<string[]>([]);
  categories: string[] = [];
  subcategoriesBS$ = new BehaviorSubject<string[]>([]);
  subcategories: string[] = [];
  previousVersionBS$ = new BehaviorSubject<TrainingModel>(null);
  assessmentItemsBS$ = new BehaviorSubject<AssessmentItem[]>(null);
  assessmentItems: AssessmentItem[] = [];

  // Using Angular DI we use the HTTP service
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private userService: UserService,
    private userTrainingService: UserTrainingService,
    private jobTitleService: JobTitleService) {

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
              this.jobTitleService.addJobTitle(training.jobTitle);
            }
            if (training.category) {
              this.addCategory(training.category);
            }
            if (training.subcategory) {
              this.addSubcategory(training.subcategory);
            }

            for (let page of training.pages) {
              if (page.type === 'assessment' && page.content.assessment) {
                this.addAssessmentItems(page.content.assessment.items);
              }
            }

          }
          let teamTrainingIds = Object.keys(this.teamTrainingHash);
          this.teamTrainingHashBS$.next(this.teamTrainingHash);
          this.teamTrainingCntBS$.next(teamTrainingIds.length);
          this.allTrainingHashBS$.next(this.allTrainingHash);

          // Load system trainings
          this.getTrainings$('mytrainingdocs').subscribe(systemTrainings => {
            if (!systemTrainings) {
              systemTrainings = [];
            }
            for (let training of systemTrainings) {
              this.systemTrainingHash[training._id] = training;
              this.allTrainingHash[training._id] = training;
              if (training.jobTitle) {
                this.jobTitleService.addJobTitle(training.jobTitle);
              }
              if (training.category) {
                this.addCategory(training.category);
              }
              if (training.subcategory) {
                this.addSubcategory(training.subcategory);
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
                  this.jobTitleService.addJobTitle(training.jobTitle);
                }
                if (training.category) {
                  this.addCategory(training.category);
                }
                if (training.subcategory) {
                  this.addSubcategory(training.subcategory);
                }

                for (let page of training.pages) {
                  if (page.type === 'assessment') {
                    this.addAssessmentItems(page.content.assessment.items);
                  }
                }

              }
              this.allTrainingIds = Object.keys(this.allTrainingHash);
              this.allTrainingHashBS$.next(this.allTrainingHash);
            });
          });
        });
      }

    });
  }
  getAssessmentItemStream(): Observable<AssessmentItem[]> {
    return this.assessmentItemsBS$.asObservable();
  }

  getTraining(tid: string): TrainingModel {
    return this.allTrainingHash[tid];
  }

  addAssessmentItems(items: AssessmentItem[]): void {
    let newItems = false;
    for (let newItem of items) {
      let itemFound = false;
      for (let existingItem of this.assessmentItems) {
        if (newItem.question === existingItem.question) {
          itemFound = true;
          break;
        }
      }
      if (!itemFound) {
        newItems = true;
        this.assessmentItems.push(newItem);
      }
    }
    if (newItems) {
      this.assessmentItemsBS$.next(this.assessmentItems);
    }
  }
    
  getCategoryStream(): Observable<string[]> {
    return this.categoriesBS$.asObservable();
  }
  addCategory(category: string) {
    category = category.trim();
    if (category && !this.categories.includes(category)) {
      this.categories.push(category);
      this.categoriesBS$.next(this.categories);
    }
  }

  getSubcategoryStream(): Observable<string[]> {
    return this.subcategoriesBS$.asObservable();
  }
  addSubcategory(subcategory: string) {
    subcategory = subcategory.trim();
    if (subcategory && !this.subcategories.includes(subcategory)) {
      this.subcategories.push(subcategory);
      this.subcategoriesBS$.next(this.subcategories);
    }
  }

  getPreviousVersionStream(): Observable<TrainingModel> {
    return this.previousVersionBS$.asObservable();
  }

  assignTrainingsForJobTitle(jobTitle: string, userId: string, teamId: string): void {
    let trainings: TrainingModel[] = Object.values(this.allTrainingHash);
    for (const training of trainings) {
      if (training.jobTitle === jobTitle) {
        this.userTrainingService.assignTraining(userId, training._id, teamId);
      }
    }
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
        if (training.jobTitle) {
          this.jobTitleService.addJobTitle(training.jobTitle);
        }
      }
      let teamTrainingIds = Object.keys(this.teamTrainingHash);
      this.teamTrainingHashBS$.next(this.teamTrainingHash);
      this.teamTrainingCntBS$.next(teamTrainingIds.length);

      this.allTrainingHashBS$.next(this.allTrainingHash);
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
      return;
    }

    this.selectedTrainingBS$.next(this.allTrainingHash[tid]);
    this.selectedTrainingVersionsBS$.next(cloneDeep(this.allTrainingHash[tid].versions));
    let previousVersionId = tid + '-' + this.allTrainingHash[tid].versions[0].version;
    this.getTrainingArchive$(previousVersionId).subscribe(trainingArchive => {
      this.previousVersionBS$.next(trainingArchive);
    })
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
  getSelectedTrainingVersionsStream(): Observable<TrainingVersion[]> {
    return this.selectedTrainingVersionsBS$.asObservable();
  }

  addNewTraining() {
    const baseId = new Date().getTime();

    const page = <Page>{
      _id: 'training-introduction',
      type: 'training-intro',
      title: 'Introduction',
      text: 'Your introduction goes here.',
      content: null,
      froalaOptions: {}
    }
    const newTraining = <TrainingModel>{
      _id: String(baseId),
      type: 'onetime',
      category: '',
      subcategory: '',
      versions: [],
      title: 'New Training Template',
      status: 'locked',
      rating: [],
      teamId: this.teamId,
      owner: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      estimatedTimeToComplete: 30,
      jobTitle: '',
      description: 'This is a useless description',
      image: 'assets/images/others/bb.jpg',
      iconClass: 'fad fa-graduation-cap',
      iconColor: '#ff0000',
      iconSource: 'fontawesome',
      pages: [page],
      interestList: [],
      shared: false,
      isDirty: false,
      useFinalAssessment: false,
      notifySchedule: [],
      expirationDate: 0
    };

    let newTrainingVersionObj: TrainingVersion = {
      _id: String(new Date().getTime()),
      version: '0_0_1',
      pending: true,
      changeLog: 'This is the new training template.',
      ownerId: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      title: 'New Training',
      iconClass: 'fad fa-graduation-cap',
      iconColor: '#ff0000',
    };
    newTraining.versions.unshift(newTrainingVersionObj);

    this.postTraining$(newTraining).subscribe(trainingObj => {
      //      this.saveNewVersion(trainingObj);
      let archiveId = trainingObj._id + '-' + newTrainingVersionObj.version;
      let trainingArchive = cloneDeep(trainingObj);
      trainingArchive._id = archiveId;
      this.postTrainingArchive$(trainingArchive).subscribe(tA => {
        this.reloadAllTrainings();
        this.selectedTrainingVersionsBS$.next(trainingObj.versions);
      });
      this.allTrainingHash[trainingObj._id] = trainingObj;
      trainingObj.status = 'unlocked';
      this.saveTraining(trainingObj, true);
      //      this.reloadAllTrainings();
      this.selectedTrainingBS$.next(trainingObj);
    });
  }

  rollback(tid: string): TrainingModel {
    return this.trainingArchiveListHash[tid][0];
  }

  selectVersion(training: TrainingModel) {
    this.selectedTrainingBS$.next(training);
  }

  selectTrainingVersion(training: TrainingModel) {
    this.selectedTrainingBS$.next(training);
  }
  /*
  selectTrainingArchive(archiveId: string) {
    this.selectedTrainingBS$.next(this.trainingArchiveHash[archiveId,]);
  }
*/
  /*
  addNewPage(trainingId: string, type: string, url: string, fileId: string, pageTitle: string): Page {
    if (!pageTitle || pageTitle === '') {
      return;
    }

    const content = <Content>{
      _id: String(new Date().getTime()),
      type: 'none'
    }


    const newPage = <Page>{
      _id: String(new Date().getTime()),
      type: 'none',
      content: content,
    };

    if (!this.teamTrainingHash[trainingId]) {
      console.log('TrainingService:addNewPage : ERROR : trainingId not found in teamTrainingHash', trainingId, this.teamTrainingHash);
      return;
    }

    let trainingObj = this.teamTrainingHash[trainingId];

    this.teamTrainingHash[trainingId].isValid['mainContent'] = true;
    this.teamTrainingHash[trainingId].pages.push(newPage);
    this.saveTraining(this.teamTrainingHash[trainingId], false);
    this.selectedTrainingBS$.next(this.teamTrainingHash[trainingId]);
    return newPage;
  }
*/
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

  selectTrainingArchive(trainingArchiveID: string) {
    this.getTrainingArchive$(trainingArchiveID).subscribe(trainingArchive => {
      this.selectTrainingVersion(trainingArchive);
    })
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

  getTrainingArchive$(trainingId: string): Observable<TrainingModel> {
    return this.http
      .get<TrainingModel>(`${ENV.BASE_API}trainingarchive/${trainingId}`)
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  saveNewVersion(training: TrainingModel) {
    let newVersion = training.versions[0];

    let trainingArchiveId = training._id + '-' + newVersion.version;
    let trainingArchive = cloneDeep(training);
    trainingArchive._id = trainingArchiveId;
    this.editTraining$(training).subscribe(obj => {
      this.postTrainingArchive$(trainingArchive).subscribe(tA => {
        this.previousVersionBS$.next(tA);
        this.reloadAllTrainings();
        this.selectedTrainingVersionsBS$.next(training.versions);
      });
    })
  }

  saveTraining(training: TrainingModel, reload: boolean) {
    this.trainingIsDirtyBS$.next(true);
    training.isDirty = true;
    console.log('trainingService.saveTraining', training);
    this.editTraining$(training).subscribe(data => {
      //        this.selectedTrainingBS$.next(data);
      if (reload) {
        this.reloadAllTrainings();
        this.selectTrainingVersion(training)
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
  postTrainingArchive$(trainingArchive: TrainingModel): Observable<TrainingModel> {
    return this.http
      .post<TrainingModel>(`${ENV.BASE_API}trainingarchive/new`, trainingArchive, {
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

  deleteTraining$(id: string): Observable<TrainingModel> {
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

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
