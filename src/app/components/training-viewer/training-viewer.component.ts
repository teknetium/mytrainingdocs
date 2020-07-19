import { Component, OnInit, HostListener, Input, Output, EventEmitter, ElementRef, ViewChild, TemplateRef, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FileService } from '../../shared/services/file.service';
import { TrainingService } from '../../shared/services/training.service';
import { UserService } from '../../shared/services/user.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { AuthService } from '../../shared/services/auth.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { TrainingModel, Page, Content, TrainingVersion } from 'src/app/shared/interfaces/training.type';
import { Assessment, AssessmentItem } from 'src/app/shared/interfaces/assessment.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileModel, FilePlusModel } from 'src/app/shared/interfaces/file.type';
import { UserModel, UserIdHash } from 'src/app/shared/interfaces/user.type';
import { VgAPI } from 'videogular2/compiled/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { merge, take } from 'rxjs/operators';
import { SendmailService } from '../../shared/services/sendmail.service';
import { EventService } from '../../shared/services/event.service';
import { MessageModel, TemplateMessageModel } from '../../shared/interfaces/message.type';
import { NzMessageService } from 'ng-zorro-antd';
import * as cloneDeep from 'lodash/cloneDeep';
import { NzModalService } from 'ng-zorro-antd/modal';
import { read } from 'fs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';
import { JoyrideService } from 'ngx-joyride';
import { AssessmentResponse, UserTrainingModel } from 'src/app/shared/interfaces/userTraining.type';


@Component({
  selector: 'app-training-viewer',
  templateUrl: './training-viewer.component.html',
  styleUrls: ['./training-viewer.component.css'],
  //  encapsulation: ViewEncapsulation.Native,
  //    changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('headerToggle', [
      // ...
      state('closed', style({
        'height': '64px'
      })),
      state('open', style({
        'height': '150px',
      })),
      transition('open => closed', [
        animate('200ms')
      ]),
      transition('* => open', [
        animate('200ms')
      ]),
    ]),
    trigger('questionSlide', [
      // ...
      state('in', style({
        'left': '0',
        'opacity': '1'
      })),
      state('out', style({
        'left': ' 600px',
        'opacity': '0'
      })),
      transition('in => out', [
        animate('200ms')
      ]),
      transition('out => in', [
        animate('200ms')
      ])
    ]),
    trigger('itemFocus', [
      // ...
      state('in', style({
        'font-size': '28px',
        'margin-left': '16px'
      })),
      state('out', style({
        'font-size': '16px',
        'margin-left': '24px'

      })),
      transition('in => out', [
        animate('200ms')
      ]),
      transition('out => in', [
        animate('200ms')
      ])
    ])
  ]


})
export class TrainingViewerComponent extends BaseComponent implements OnInit {

  vgApi: VgAPI;

  fileExtensionHash = {
    doc: 'file-word',
    docx: 'file-word',
    ppt: 'file-ppt',
    pptx: 'file-ppt',
    xls: 'file-excel',
    xlsx: 'file-excel',
    pdf: 'file-pdf',
  }

  page$ = new BehaviorSubject<Page>(null);
  trainingIsDirty$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  isIconSelectModalVisible = false;
  selectedTraining$: Observable<TrainingModel>;
  trainingArchiveList$: Observable<TrainingModel[]>;
  selectedTrainingVersions$: Observable<TrainingVersion[]>;
  //  selectedTrainingIndex$: Observable<number>;
  fileUploaded$: Observable<FilePlusModel>;
  safeFileUrl$: Observable<SafeResourceUrl>;
  safeFileUrl: SafeResourceUrl;
  myTeamHash$: Observable<UserIdHash>;
  myTeamHash: UserIdHash;
  usersAffected: UserModel[] = [];
  teamMembers: UserModel[] = [];
  users$: Observable<string[]>;
  assignableUsers: string[] = [];
  assignedToUsers: string[] = [];
  assignToUser: UserModel;
  currentSelectedUserToAssign = '';
  currentPageId = undefined;
  isOpen = true;
  pageContainerMarginLeft = '270';
  selectedTraining: TrainingModel;
  fullscreen = true;
  helpPanelIsVisible = true;
  badUrl = false;
  more = '...';
  lockTrainingModalIsVisible = false;

  userTypeIconHash = {
    individualContributor: 'fad fa-fw fa-user',
    supervisor: 'fad fa-fw fa-user-tie',
    volunteer: 'fad fa-fw fa-user-cowboy',
    customer: 'fad fa-fw fa-user-crown',
    candidate: 'fad fa-fw fa-user-graduate'
  };

  trainingStatusColorHash = {
    upToDate: '#52c41a',
    pastDue: 'red'
  }

  okDisabled = true;
  cancelDisabled = false;
  messageDialogVisible = false;

  toAddresses: string[];
  subject: string = 'Feedback Requested'
  messageBody: string = 'Please'
  usersToDelete
  currentStep = -1;

  rating = 0;

  tempIcon = '';
  tempIconColor = '';
  showConfirmDeleteTrainingWithAffectedUsers = false;
  showConfirmDeleteTrainingWithoutAffectedUsers = false;
  showRollbackModalFlag = false;
  showAssignToUserDialog = false;
  assignedUserIdSelected = '';


  assessment;

  assessmentResponseHash = {};
  assessmentResponse: AssessmentResponse = {
    tid: undefined,
    uid: undefined,
    assessmentId: undefined,
    executionDate: 0,
    passed: false,
    isFinal: false,
    score: -1,
    answers: []
  };
  showNext = false;
  //  runningTour = false;

  @Input() mode = 'Edit';
  @Input() trainingStatus = 'unlocked';
  @Input() trainingId = null;
  @Input() production = 'false';
  @Input() version = '';
  @Input() currentUT: UserTrainingModel = null;
  @Output() assessmentResult = new EventEmitter<string>();
  pageFileHash = {};
  pageIdHash = {};
  commentsVisible = false;
  questionEditorVisible = false;
  newChoice: string;

  selectedTrainingIndex = -1;
  error1 = false;
  error2 = false;
  changeLevel = '';


  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedFile: FileModel;
  safeFileUrlHash = {};


  inputValue = '';
  currentAssessmentItemIndex = -1;
  assessmentInProgress = false;
  assessmentCorrectCnt = 0;
  assessmentIncorrectCnt = 0;
  answerIsCorrect = false;

  currentQuestion: AssessmentItem = {
    question: '',
    choices: [],
    extraInfo: [],
    correctChoice: -1
  }

  alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  slideNewQuestionHash = {};
  currentQuestionIndex = -1;
  currentCorrectChoice: string;

  markCompletedModalIsVisible = false;
  emailAddr: string;
  pageUrl: string = '';
  urlError = false;
  safeUrlHash = {};
  passingGrade: number = 70;
  /*
  currentQuestion: AssessmentItem = {
    question: '',
    choices: [],
    correctChoice: -1
  }
  */
  assignToDisabled = false;
  currentVersionIndex = 0;
  trainingArchive: TrainingModel;

  rollbackVersion = '';
  currentTrainingState = 'invalid';
  //  previousSelectedTraining: TrainingModel = null;
  justLocked = false;
  versionCnt = 0;
  selectedTrainingVersionHash = {};
  selectedTrainingVersions: TrainingVersion[] = [];
  newTraining = true;
  changeLog = '';
  currentSelectedTrainingVersions: TrainingVersion[] = [];
  currentSelectedTrainingVersionObj: TrainingVersion;
  debug = false;
  versionRequestError = false;
  trainingClone: TrainingModel;
  currentTraining: TrainingModel;
  mainContentPageHash = {};
  safeContentUrlHash = {};
  currentPage = null;
  videoWidth = 500;
  isNewVersionModalVisible = false;
  //  previewBase = 'https://cdn.filestackcontent.com/preview=css:"https://cdn.filestackcontent.com/2fnGzVLASRGFGHQ1reBF"/';
  previewBase = 'https://cdn.filestackcontent.com/preview=css:"https://cdn.filestackcontent.com/jtNVfsaDTieo28ZL7hkr"/';
  showVersions = false;
  currentSection = null;
  pageIndexHash = {};
  pageIndex;
  currentPageIndex: number = 0;

  assessmentItems: AssessmentItem[] = [];
  matchingQuestions: string[] = [];
  questions: string[] = [];
  assessmentItems$: Observable<AssessmentItem[]>;
  assessmentHash = {};

  jobTitles: string[] = [];
  categories: string[] = [];
  subcategories: string[] = [];
  matchingJobTitles: string[] = [];
  matchingCategories: string[] = [];
  matchingSubcategories: string[] = [];
  jobTitles$: Observable<string[]>;
  categories$: Observable<string[]>;
  subcategories$: Observable<string[]>;
  previousVersion$: Observable<TrainingModel>;
  previousVersion: TrainingModel;
  assignedFromJobTitle: string[] = [];
  removedFromJobTitle: string[] = [];
  assignedFromJobTitleDialogIsVisible = false;
  trainingArchiveList: TrainingModel[] = [];
  trainingArchiveHash = {};
  trainingVersions$: Observable<TrainingVersion[]>;

  currentObjects: any[] = [];
  tid: string = null;
  icon = 'file';
  nextIsActive = true;
  prevIsActive = false;
  browserInnerWidth: number;
  browserInnerHeight: number;
  contentWidth: number;
  unlockedContentHeight: number;
  lockedContentHeight: number;
  contentHeight: number;
  showCloseButton = false;
  percentageOfBrowserHeight = .60;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    this.contentHeight = Math.floor((window.innerHeight - (this.percentageOfBrowserHeight * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);
  }
  embeddedPageDialogIsVisible = false;
  tourModalIsVisible = false;
  //  startTour$: Observable<string>;
  viewingArchiveVersion = false;
  currentAssessmentId = null;
  editor;
  froalaContents: string = 'Replace with your content';
  assessmentStatusHash = {};
  responseObjHash = {};
  iFrameBorder = 1;
  introEditorHash = {};
  introHash = {};
  showAssessmentAlert = false;
  millisecondsPerDay = 86400000;
  notifyPeriod;

  tourStepsHash = {};
  //    header: ,
  //    page-navigation: { steps: ['Step1-header', 'Step2-header', 'Step3-header', 'Step4-header', 'Step5-header', 'Step6-header', 'Step7-header', 'Step8-header', 'Step9-header'] },



  constructor(
    private trainingService: TrainingService,
    private modalService: NzModalService,
    private fileService: FileService,
    private eventService: EventService,
    private jobTitleService: JobTitleService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private userService: UserService,
    private userTrainingService: UserTrainingService,
    private mailService: SendmailService,
    private joyrideService: JoyrideService,
    private cd: ChangeDetectorRef,
    private message: NzMessageService,
    private authService: AuthService) {
    super();
    //    this.startTour$ = this.eventService.getStartTourStream();
    this.assessmentItems$ = this.trainingService.getAssessmentItemStream();
    this.jobTitles$ = this.jobTitleService.getJobTitleStream();
    this.categories$ = this.trainingService.getCategoryStream();
    this.subcategories$ = this.trainingService.getSubcategoryStream();
    this.previousVersion$ = this.trainingService.getPreviousVersionStream();
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.myTeamHash$ = this.userService.getMyTeamIdHashStream();
    //    this.newVersion$ = this.fileService.getNewVersionStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.selectedTrainingVersions$ = this.trainingService.getSelectedTrainingVersionsStream();
    this.safeFileUrl$ = this.fileService.getSafeFileUrlStream();
    this.users$ = this.userTrainingService.getUsersForTrainingStream();
    this.fileUploaded$ = this.fileService.getUploadedFileStream();
    this.trainingIsDirty$ = this.trainingService.getTrainingIsDirtyStream();

  }

  ngOnInit() {
    this.tourStepsHash['header'] = ['Step1-header', 'Step2-header', 'Step3-header', 'Step4-header', 'Step5-header', 'Step6-header', 'Step7-header', 'Step8-header', 'Step9-header'];
    this.tourStepsHash['page-navigation'] = ['Step1-pn', 'Step2-pn', 'Step3-pn', 'Step4-pn', 'Step5-pn', 'Step6-pn', 'Step7-pn', 'Step8-pn', 'Step9-pn'];
    this.tourStepsHash['training-intro'] = ['Step1-header', 'Step2-header', 'Step3-header', 'Step4-header', 'Step5-header', 'Step6-header', 'Step7-header', 'Step8-header', 'Step9-header'];

    console.log('ngOnInit');

    if (this.production === 'true') {
      //      this.iFrameBorder = 0;
      this.percentageOfBrowserHeight = .35;
    }
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;

    this.contentHeight = Math.floor((window.innerHeight - (this.percentageOfBrowserHeight * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);

    if (this.currentUT) {
      if (this.currentUT.assessmentResponses) {
        for (let item of this.currentUT.assessmentResponses) {
          this.responseObjHash[item.assessmentId] = item;
          if (item.passed) {
            this.assessmentStatusHash[item.assessmentId] = 'passed';
          } else {
            this.assessmentStatusHash[item.assessmentId] = 'failed';
          }
        }
      }
    }

    /*
      this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.tid = params.get('tid');
        this.trainingService.selectTraining(this.tid);
      });
      */
    this.currentVersionIndex = 0;
    this.mode = 'Edit';
    this.currentTraining = null;
    /*
        this.startTour$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          if (data == 'trainings') {
            this.tourModalIsVisible = true;
          }
        });
        */
    this.jobTitles$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(jobTitles => {
      this.jobTitles = jobTitles;
      this.matchingJobTitles = this.jobTitles;
    });

    this.categories$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(categories => {
      this.categories = categories;
      this.matchingCategories = this.categories;
    });
    this.subcategories$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(subcategories => {
      this.subcategories = subcategories;
      this.matchingSubcategories = this.subcategories;
    });

    this.previousVersion$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(training => {
      if (!training) {
        return;
      }
      this.previousVersion = training;
      this.previousVersion._id = training._id.substring(0, training._id.indexOf('-'));
    });

    this.selectedTraining$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(training => {

      if (!training) {
        this.currentTraining = null;
        return;
      }

      if (!this.currentTraining) {
        this.currentTraining = training;
        this.currentSelectedTrainingVersions = training.versions;
        this.currentSelectedTrainingVersionObj = training.versions[0];
        this.selectedTraining = training;
        // new trainings come with a defualt intro page...
        if (this.selectedTraining.pages.length === 1) {

        }
      } else {
        this.selectedTraining = training;
      }

      this.currentPage = this.selectedTraining.pages[0];
      this.currentPageId = this.currentPage._id;
      this.currentPageIndex = 0;


      for (let pageIndex in this.selectedTraining.pages) {
        this.pageIndexHash[this.selectedTraining.pages[pageIndex]._id] = pageIndex;
      }

      this.currentPageIndex = parseInt(this.pageIndexHash[this.currentPageId], 10);

      if (this.selectedTraining.pages) {
        for (let page of this.selectedTraining.pages) {
          if (page.type === 'file' || page.type === 'url' || page.type === 'assessment') {
            this.introHash[page._id] = 'yes';
          } else if (page.type === 'text') {
            this.introHash[page._id] = 'no';
          }
          /*
          if (page.froalaOptions) {
            page.froalaOptions = {
              immediateAngularModelUpdate: true,
              key: "0BA3jA11D9C4F6A3E4asftscjjlhi1lfixF6nablA3C11A8C6D2B4A4G2F3A3==",
              events: {
                'blur': (e) => {
                  this.saveTraining(false);
                },
                'contentChanged': () => {
                  this.saveTraining(false);
                }
              }
            }
            this.cd.detectChanges();

          }
          */
          if (page.content) {
            if (page.content.type === 'video') {
              this.safeUrlHash[page.content.file.fileStackUrl] = page.content.file.fileStackUrl;
            } else if (page.content.type === 'file' && page.content.file) {
              this.safeUrlHash[page.content.file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.previewBase + page.content.file.fileStackId));
            } else if (page.content.type === 'url') {
              this.safeUrlHash[page.content.webUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(page.content.webUrl));
            }
          }
          this.mainContentPageHash[page._id] = page;
        }
      }

      this.userTrainingService.getUTForTraining(this.selectedTraining._id);
      //      this.setCurrentPage(this.currentPageId);
      /*
      for (const page of this.selectedTraining.pages) {
        for (const item of page.content) {  
          if (item.type === 'url') {
            this.safeContentUrlHash[item.url] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(item.url));
          } else if (item.type === 'file') {
            let file: FileModel = this.fileService.getFile(item.file);
            this.FileHash[page._id] = file;
          }
        }
      }
      */
      this.tempIconColor = this.selectedTraining.iconColor;
      this.tempIcon = this.selectedTraining.iconClass;
      if (!this.currentPageId) {
        this.currentPageId = this.selectedTraining.pages[0]._id;
      }
      this.setCurrentPage(this.currentPageId, 0);
    });

    this.selectedTrainingVersions$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(versions => {
      if (!versions) {
        return;
      }
      this.selectedTrainingVersions = versions;
    })

    /*
        this.trainingArchiveList$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(trainingArchiveList => {
          if (!trainingArchiveList) {
            return;
          }
          this.trainingArchiveList = trainingArchiveList; 
          for (let training of this.trainingArchiveList) {
            this.trainingArchiveHash[training._id] = training;
          }
        });
        */

    this.fileUploaded$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(filePlus => {
      if (!filePlus) {
        return;
      }
      this.currentPage = filePlus.page;
      let file = {
        name: filePlus.name,
        fileStackId: filePlus.fileStackId,
        fileStackUrl: filePlus.fileStackUrl,
        mimeType: filePlus.mimeType,
        dateUploaded: filePlus.dateUploaded,
      }

      if (!this.currentPage) {
        return;
      }

      let newContent = <Content>{
        _id: String(new Date().getTime()),
        type: undefined,
        file: file
      };
      if (file.mimeType.includes('video')) {
        newContent.type = 'video';
        this.safeUrlHash[file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(file.fileStackUrl));
      } else if (file.mimeType.includes('application') || file.mimeType.includes('image')) {
        newContent.type = 'file';
        this.safeUrlHash[file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.previewBase + file.fileStackId));
      } else if (file.mimeType.includes('audio')) {
        newContent.type = 'audio';
        this.safeUrlHash[file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.previewBase + file.fileStackId));
      } else if (file.mimeType.includes('text')) {
        newContent.type = 'text';
        this.safeUrlHash[file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(file.fileStackUrl));
      }

      this.currentPage.title = file.name;
      this.currentPage.type = 'file';

      if (this.currentPage._id === 'training-introduction') {
        console.log('fileUploaded - ERROR - currentPage is training-introduction');
      }
      this.currentPage.content = newContent;


      this.saveTraining(false);
      this.cd.detectChanges();
    });

    this.myTeamHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamHash => {
      console.log('myTeamHash$  ', myTeamHash);
      this.myTeamHash = myTeamHash;
    })

    this.users$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userList => {
      if (!userList) {
        return;
      }
      this.assignableUsers = [];
      if (this.myTeamHash) {
        this.assignedToUsers = userList;
        let teamMemberIds = Object.keys(this.myTeamHash);
        for (let userId of teamMemberIds) {
          if (this.assignedToUsers.includes(userId)) {
            continue;
          } else {
            this.assignableUsers.push(userId);
          }
        }
      }
      if (this.assignableUsers.length > 0) {
        this.assignToDisabled = false;
      } else {
        this.assignToDisabled = true;
      }
    })
    /*
        this.assessmentItems$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(items => {
          if (!items) {
            return;
          }
    
          this.assessmentItems = items;
          this.questions = [];
          this.assessmentHash = {};
          for (let item of this.assessmentItems) {
            this.questions.push(item.question);
            this.assessmentHash[item.question] = item;
          }
          this.matchingQuestions = this.questions;
        });
        */

    /*
    this.newVersion$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(version => {
      if (!version) {
        return;
      }
    
    
      console.log('newVersion$.subscribe', version, this.currentPageId, this.pageFileHash); 
      this.fileService.selectFsHandle(this.currentPage.content[0].file, 0);
    })
    */

    this.authenticatedUser$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(user => {
      this.authenticatedUser = user;
    })

  }
  /*
    getSafeUrl(mimeType: string, url: string): SafeResourceUrl {
      if (mimeType.includes('video')) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(url));
      } else {
        this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI((this.previewBase) + this.uploadedFile.fileStackId));      
      }
    }
    */

  hideEditor(event) {
    event.preventDefault();
    this.introEditorHash[this.currentPageId] = false;
    this.saveTraining(false);
  }

  editIntro(event, pageId, action) {
    event.preventDefault();
    this.introEditorHash[pageId] = action;
  }

  getFroalaOptions(pageId: string): Object {
    return new Object({
      placeholderText: 'Edit Your Content Here!',
      immediateAngularModelUpdate: true,
      key: "0BA3jA11D9C4F6A3E4asftscjjlhi1lfixF6nablA3C11A8C6D2B4A4G2F3A3==",
      events: {
        'contentChanged': () => {
          console.log('contentChanged event');
          this.saveTraining(false);
        },
        'blur': () => {
          console.log('blur event');

        }
      }
    })
  }

  bumpPatchLevel(): string {
    const versionArray = this.currentSelectedTrainingVersions[0].version.split('_', 3);
    let majorNum = parseInt(versionArray[0], 10);
    let minorNum = parseInt(versionArray[1], 10);
    let patchNum = parseInt(versionArray[2], 10);

    patchNum++;
    return majorNum + '_' + minorNum + '_' + patchNum;
  }
  onJobTitleChange(value: string): void {
    this.matchingJobTitles = this.jobTitles.filter(jobTitle => jobTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }
  setJobTitle(value) {
    this.jobTitleService.addJobTitle(this.selectedTraining.jobTitle);
    this.saveTraining(true);
  }

  onSubcategoryChange(value: string): void {
    this.matchingSubcategories = this.subcategories.filter(subcategory => subcategory.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }
  setSubcategory(value) {
    this.trainingService.addSubcategory(this.selectedTraining.subcategory);
    this.saveTraining(true);
  }

  onCategoryChange(value: string): void {
    this.matchingCategories = this.categories.filter(category => category.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }
  setCategory(value) {
    this.trainingService.addCategory(this.selectedTraining.category);
    this.saveTraining(true);
  }

  unlockTraining() {
    this.selectedTraining.status = 'unlocked';
    this.saveTraining(false);
  }

  loadVersion(version, index) {
    if (index === 0) {
      this.viewingArchiveVersion = false;
      this.trainingService.selectTrainingVersion(this.currentTraining);
    } else {
      this.viewingArchiveVersion = true;
      this.trainingService.selectTrainingArchive(this.currentTraining._id + '-' + version.version);
    }
    this.currentVersionIndex = index;
  }

  rollback() {
    this.selectedTraining = cloneDeep(this.previousVersion);
    this.selectedTraining.isDirty = false;
    this.currentTraining = this.selectedTraining;
    this.saveTraining(true);
    this.trainingService.selectTrainingVersion(this.selectedTraining);
  }
  cancelLockTraining() {
    this.lockTrainingModalIsVisible = false;
    this.changeLevel = '';
    this.changeLog = '';
  }

  showVersionModal() {
    this.isNewVersionModalVisible = true;
  }

  openPicker(type: string, page: Page): void {
    if (type === 'doc') {
      this.fileService.openDocPicker(page);
    } else if (type === 'video') {
      this.fileService.openVideoPicker(page);
    } else if (type === 'audio') {
      this.fileService.openAudioPicker(page);
    } else if (type === 'image') {
      this.fileService.openImagePicker(page);
    } else if (type === 'all') {
      this.fileService.openAllPicker(page);
    }
  }


  dismissNewVersionModal() {
    this.isNewVersionModalVisible = false;
  }


  handleLockTraining() {
    this.error1 = false;
    this.error2 = false;

    if (!this.changeLevel) {
      this.error1 = true;
      this.lockTrainingModalIsVisible = true;
      return;
    }

    const versionArray = this.currentSelectedTrainingVersions[0].version.split('_', 3);
    let majorNum = parseInt(versionArray[0], 10);
    let minorNum = parseInt(versionArray[1], 10);
    let patchNum = parseInt(versionArray[2], 10);
    if (this.changeLevel === 'major') {
      majorNum++;
      minorNum = 0;
      patchNum = 0;
    } else if (this.changeLevel === 'minor') {
      minorNum++;
      patchNum = 0;
      this.sendNotifications();
    } else if (this.changeLevel === 'patch') {
      patchNum++;
    }
    let newVersion = majorNum + '_' + minorNum + '_' + patchNum;

    this.selectedTraining.status = 'locked';
    this.selectedTraining.isDirty = false;
    let newTrainingVersionObj: TrainingVersion = {
      _id: String(new Date().getTime()),
      version: newVersion,
      pending: false,
      changeLog: this.changeLog,
      ownerId: this.authenticatedUser._id,
      dateCreated: new Date().getTime(),
      title: this.selectedTraining.title,
      iconClass: this.selectedTraining.iconClass,
      iconColor: this.selectedTraining.iconColor,
    };
    this.selectedTraining.versions.unshift(newTrainingVersionObj);
    //    this.currentSelectedTrainingVersions.unshift(newTrainingVersionObj);
    let trainingClone = cloneDeep(this.selectedTraining);

    // if the job title being saved for this version is not the same as the previous version
    // then we have some work to do.   Remove the training from the users with the old job title
    // and assign the training to the users with the new jopb title

    this.trainingService.saveNewVersion(trainingClone);
    this.trainingService.selectTrainingVersion(trainingClone);

    this.lockTrainingModalIsVisible = false;

    /*
          for (let userId of this.assignedToUsers) {
            if (this.myTeamHash[userId].jobTitle === this.trainingArchiveList[0].jobTitle) {
              this.userTrainingService.deleteUserTrainingByTidUid(this.selectedTraining._id, userId);
              this.removedFromJobTitle.push(userId);
            }
          }
    */
    for (let userId of this.assignableUsers) {
      if (this.myTeamHash[userId].jobTitle === this.selectedTraining.jobTitle) {
        if (this.selectedTraining.versions.length > 1) {
          if (this.myTeamHash[userId].trainingStatus === 'none') {
            this.myTeamHash[userId].trainingStatus = 'upToDate';
            this.userService.updateUser(this.myTeamHash[userId], true);
          }
          this.userTrainingService.assignTraining(userId, this.selectedTraining._id, this.authenticatedUser._id, newVersion);
          this.assignedFromJobTitle.push(userId);
        }
      }
    }
    if (this.assignedFromJobTitle.length > 0) {
      this.assignedFromJobTitleDialogIsVisible = true;
    }
    if (this.changeLevel === 'major') {
      this.resetTrainingStatus(newVersion);
    }

    for (let user of this.assignedToUsers) {
      this.userTrainingService.updateUTVersion(user, this.selectedTraining._id, newVersion);
    }
  }


  saveNewVersion() {
    this.introEditorHash = {};
    if (this.selectedTraining.useFinalAssessment && (this.selectedTraining.pages[this.selectedTraining.pages.length - 1].type !== 'assessment' || !this.selectedTraining.pages[this.selectedTraining.pages.length - 1].content.assessment.isFinal)) {
      console.log('saveNewVersion...Assessment Alert');
      this.showAssessmentAlertConfirm();
      return;
    }
    if (this.selectedTraining.versions.length === 1) {

      this.selectedTraining.status = 'locked';
      let newTrainingVersionObj: TrainingVersion = {
        _id: String(new Date().getTime()),
        version: '1_0_0',
        pending: false,
        changeLog: 'Create Training',
        ownerId: this.authenticatedUser._id,
        dateCreated: new Date().getTime(),
        title: this.selectedTraining.title,
        iconClass: this.selectedTraining.iconClass,
        iconColor: this.selectedTraining.iconColor,
      };
      this.selectedTraining.versions.unshift(newTrainingVersionObj);
      //      this.currentSelectedTrainingVersions.unshift(newTrainingVersionObj);
      this.trainingClone = cloneDeep(this.selectedTraining);
      this.trainingService.saveNewVersion(this.trainingClone);
      this.trainingService.selectTrainingVersion(this.trainingClone);
      if (this.selectedTraining.jobTitle) {
        for (let userId of this.assignableUsers) {
          if (this.myTeamHash[userId].jobTitle === this.selectedTraining.jobTitle) {
            this.userTrainingService.assignTraining(userId, this.selectedTraining._id, this.authenticatedUser._id, '1_0_0');
            this.assignedFromJobTitle.push(userId);
          }
        }
        if (this.assignedFromJobTitle.length > 0) {
          this.assignedFromJobTitleDialogIsVisible = true;
        }
      }
    } else {
      this.lockTrainingModalIsVisible = true;
    }
  }

  createMessage(type: string, msg: string): void {
    this.message.create(type, msg);
  }

  versionFormatter(version) {
    if (!version) {
      return;
    }
    let re = /_/g;
    return version.replace(re, '.');
    version
  }

  htmlContentChanged(data) {
    this.saveTraining(false);
  }

  froalaBlur(data, page) {
    console.log('froalaBlur', data, page);
    this.saveTraining(false);
  }


  resetTrainingStatus(version: string) {
    this.userTrainingService.resetUserTrainingStatus(this.selectedTraining._id, version);
    this.subject = 'Urgent: Must retake a training'
    this.messageBody = "Training '" + this.selectedTraining.title + "' has been updated and you are required to retake it.";
    for (let user of this.assignedToUsers) {
      let msg = <TemplateMessageModel>{
        to: this.myTeamHash[user].email,
        from: this.authenticatedUser.email,
        templateId: 'd-b4679d4de1fb41e18d1e2487995f9bdf',
        dynamicTemplateData: {
          firstName: this.myTeamHash[user].firstName,
          trainingTitle: this.selectedTraining.title,
        }
      }
      this.mailService.sendTemplateMessage(msg);
    }
  }

  sendNotifications() {
    for (let user of this.assignedToUsers) {
      let msg = <TemplateMessageModel>{
        to: this.myTeamHash[user].email,
        from: this.authenticatedUser.email,
        templateId: 'd-3d4ee355e8164a999bbd8a4dd3d106dc',
        dynamicTemplateData: {
          firstName: this.myTeamHash[user].firstName,
          trainingTitle: this.selectedTraining.title,
        }
      }
      this.mailService.sendTemplateMessage(msg);
    }
  }

  pageUrlChanged() {
    if (this.pageUrl === '') {
      return;
    }

    this.badUrl = false;
    if (this.pageUrl !== '' && !this.pageUrl.startsWith('https://')) {
      if (this.pageUrl.startsWith('http://')) {
        this.pageUrl = 'https://' + this.pageUrl.substring(7);
      } else {
        this.pageUrl = 'https://' + this.pageUrl;
      }
    }
    let safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.pageUrl));

    this.safeUrlHash[this.pageUrl] = safeUrl;
    this.currentPage.type = 'url';
    //    this.currentPage = this.mainContentPageHash[this.currentPageId];

    this.currentPage.content.dateUploaded = new Date().getTime();
    this.currentPage.content.webUrl = this.pageUrl;

    this.currentPage.content.type = 'url';
    this.currentPage.title = this.pageUrl;

    this.saveTraining(false);
    this.embeddedPageDialogIsVisible = false;
    this.pageUrl = '';
  }

  selectSection(sectionName: string) {
    this.currentSection = sectionName;
  }

  addNewPage(pageType: string, contentType: string) {

    const content = <Content>{
      _id: String(new Date().getTime()),
      type: contentType,
    }
    const newPage = <Page>{
      _id: String(new Date().getTime()),
      type: pageType,
      title: 'New Page',
      text: 'Your page introduction goes here.',
      content: content
    }

    this.selectedTraining.pages.push(newPage);
    this.saveTraining(false);
    this.currentPage = newPage;
    this.currentPageId = newPage._id;
    this.buildPageHashes();
    if (pageType === 'file') {
      if (contentType === 'file') {
        this.openPicker('doc', this.currentPage);
      }
      if (contentType === 'video') {
        this.openPicker('video', this.currentPage);
      }
      if (contentType === 'image') {
        this.openPicker('image', this.currentPage);
      }
      this.introHash[this.currentPageId] = 'yes';
    } else if (pageType === 'url') {
      this.embeddedPageDialogIsVisible = true;
      this.introHash[this.currentPageId] = 'yes';
    } else if (pageType === 'assessment') {
      this.currentPage.content.assessment = <Assessment>{
        _id: String(new Date().getTime()),
        passingGrade: 60,
        items: [],
        isFinal: false
      }
      this.assessmentHash[this.currentPage.content.assessment._id] = this.currentPage.content.assessment;
      this.currentPage.title = 'Assessment';
      this.currentPage.type = 'assessment';
      this.currentPage.content.type = 'assessment';
      this.selectedTraining.useFinalAssessment = true;
      this.introHash[this.currentPageId] = 'yes';
    } else if (pageType === 'text') {
      this.currentPage.title = 'HTML Page';
      this.currentPage.content.type = 'html';
      this.currentPage.content.text = '';
      this.introHash[this.currentPageId] = 'no';
    }
    //    this.setCurrentPage(newPage._id, undefined);
    //    this.cd.detectChanges();
  }

  buildPageHashes() {
    this.pageIndexHash = {};
    this.mainContentPageHash = {};
    for (let pageIndex in this.selectedTraining.pages) {
      this.pageIndexHash[this.selectedTraining.pages[pageIndex]._id] = pageIndex;
      this.mainContentPageHash[this.selectedTraining.pages[pageIndex]._id] = this.selectedTraining.pages[pageIndex];
    }
  }

  onPlayerReady(api: VgAPI) {
    this.vgApi = api;
    /*
        this.vgApi.getDefaultMedia().subscriptions.loadedMetadata.subscribe(
          this.playVideo.bind(this)
        );
    */
    this.vgApi.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        this.nextIsActive = true;
      }
    );
  }

  isFirstPage(pageId: string): boolean {
    if (this.pageIndexHash[pageId] === '0') {
      return true;
    } else {
      return false;
    }
  }
  isLastPage(pageId: string): boolean {
    if (this.pageIndexHash[pageId] === String(this.selectedTraining.pages.length - 1)) {
      return true;
    } else {
      return false;
    }
  }

  startTour(section) {
    let steps = this.tourStepsHash[section];
    this.joyrideService.startTour({ steps: steps });
  }

  playVideo() {
    this.vgApi.play();
  }

  /*
    setCurrentStepPanel(newIndex) {
      this.currentStep = newIndex;
      //    this.runningTour = true;
    }
    */
  /*
    viewVersion(index) {
      this.currentVersionIndex = index;
      this.fileService.selectFsHandle(this.pageFileHash[this.currentPageId], index);
    }
    */
  /*
    setPage(page) {
      this.currentPage = page;
    }
    */

  loadNextPage() {
    this.currentPageIndex++;
    this.setCurrentPage(this.selectedTraining.pages[this.currentPageIndex]._id, undefined);
  }

  loadPrevPage() {
    this.currentPageIndex--;
    this.setCurrentPage(this.selectedTraining.pages[this.currentPageIndex]._id, undefined);
  }

  setCurrentPageFromIcon(pageId) {
    if (this.production === 'true' || this.mode === 'Preview') {
      console.log('production or preview', this.production, this.mode);
      return;
    }
    this.setCurrentPage(pageId, -1);
  }

  setIcon(event) {
    this.tempIcon = event.icon;
    this.tempIconColor = event.color;
    this.okDisabled = false;
  }

  deleteAssignedUser() {
    this.userTrainingService.deleteUserTrainingByTidUid(this.selectedTraining._id, this.assignedUserIdSelected);
    this.userTrainingService.getUTForTraining(this.selectedTraining._id);
    //    this.trainingService.reloadAllTrainings();
  }

  addItemToNotifySchedule() {
    this.selectedTraining.notifySchedule.push(this.notifyPeriod);
    this.notifyPeriod = 7;
    this.saveTraining(false);
  }

  deleteNotifyScheduleItem(index) {
    this.selectedTraining.notifySchedule.splice(index, 1);
    this.saveTraining(false);
  }
  configChanged(event, property) {

    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId, undefined);
  }

  contentChanged(newVal: string, propName: string) {
    this.selectedTraining[propName] = newVal;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId, undefined);
  }

  pageContentChanged(newVal: string, page: Page, propName: string) {
    page[propName] = newVal;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId, undefined);
  }
  /*
    pageChanged(newVal: string, index: number, propName: string) {
      let page: Page;
      page = this.selectedTraining.pages[index];
      page[propName] = newVal;
      this.saveTraining(false);
      this.setCurrentPage(this.currentPageId);
    }
  */
  handleIconSelectCancel() {
    this.tempIconColor = '';
    this.tempIcon = '';
    this.isIconSelectModalVisible = false;
    this.okDisabled = true;
  }
  handleIconSelectConfirm() {
    this.selectedTraining.iconClass = this.tempIcon;
    this.selectedTraining.iconColor = this.tempIconColor;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId, undefined);

    this.isIconSelectModalVisible = false;
    this.okDisabled = true;
  }

  closeViewer() {
    this.trainingService.selectTrainingVersion(this.currentTraining);
    this.currentTraining = null;
    this.previousVersion = null;
    this.userTrainingService.stopSession(this.currentUT);
    //    this.trainingService.reloadAllTrainings();
    this.trainingService.selectTraining(null);
    this.assessmentInProgress = false;
    this.currentVersionIndex = 0;
    this.currentPageIndex = 0;
    this.currentPageId = 'training-introduction';
    this.currentPage = this.selectedTraining.pages[0];
    this.mode = 'Edit';
    this.trainingService.reloadAllTrainings();
  }
  /*
    toggleTOC() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.pageContainerMarginLeft = '270';
      } else {
        this.pageContainerMarginLeft = '20';
      }
    }
  */
  saveTraining(reload: boolean) {
    if (this.production === 'true') {
      return;
    }
    if (this.selectedTraining.teamId === 'mytrainingdocs') {
      return;
    }
    this.trainingService.saveTraining(this.selectedTraining, false);
    console.log('saveTraining', this.currentPageId);
    this.setCurrentPage(this.currentPageId, undefined);
  }

  cancelAssignToUser() {
    this.currentSelectedUserToAssign = '';
    this.showAssignToUserDialog = false;
  }

  confirmAssignmentToUser() {
    this.showAssignToUserDialog = false;
    this.userTrainingService.assignTraining(this.assignToUser._id, this.selectedTraining._id, this.authenticatedUser._id, this.selectedTraining.versions[0].version);
    this.userTrainingService.getUTForTraining(this.selectedTraining._id);
  }

  selectTeamMemberToAssign(uid: string) {
    this.assignToUser = this.myTeamHash[uid];
    this.currentSelectedUserToAssign = uid;
  }

  showAssignmentDialog() {
    this.showAssignToUserDialog = true;
    this.teamMembers = Object.values(this.myTeamHash);
  }

  showRollbackConfirm(): void {
    this.modalService.confirm({
      nzTitle: 'Revert back to the previous version?',
      nzContent: 'All changes you have made since unlocking this training will be lost',
      nzOkText: 'Yes, revert to previous version.',
      nzOkType: 'danger',
      nzOnOk: () => this.rollback(),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
  showAssessmentAlertConfirm(): void {
    this.modalService.error({
      nzTitle: 'Assesssment Error',
      nzContent: 'When using assessments, the last page of the training must be an assessment marked as Final.'
    });
  }
  showChangeLog(): void {
    this.modalService.info({
      nzTitle: 'Change Log',
      nzContent: this.currentSelectedTrainingVersionObj.changeLog,
      nzOnOk: () => console.log('Info OK')
    });
  }
  showRollbackModal() {
    this.showRollbackModalFlag = true;
  }

  showConfirmDelete() {
    this.usersAffected = [];
    this.userTrainingService.getUTForTraining$(this.selectedTraining._id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
      for (let ut of userTrainings) {
        this.usersAffected.push(this.myTeamHash[ut.uid]);
      }
      if (this.usersAffected.length > 0) {
        this.showConfirmDeleteTrainingWithAffectedUsers = true;
      } else {
        this.showConfirmDeleteTrainingWithoutAffectedUsers = true;
      }
    });
  }

  cancelDelete() {
    this.showConfirmDeleteTrainingWithoutAffectedUsers = false;
    this.showConfirmDeleteTrainingWithAffectedUsers = false;
    this.usersAffected = [];
  }

  confirmDelete() {
    this.userTrainingService.getUTForTraining$(this.selectedTraining._id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(userTrainings => {
      for (let ut of userTrainings) {
        this.userTrainingService.deleteUserTraining$(ut._id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(item => {
          this.userTrainingService.initUserTrainingsForUser(ut.uid);
        })
      }
    });
    this.trainingService.deleteTraining(this.selectedTraining._id);
    this.trainingService.selectTraining(null);
    this.usersAffected = [];
  }

  showIconSelectModal() {
    this.tempIcon = this.selectedTraining.iconClass;
    this.tempIconColor = this.selectedTraining.iconColor;

    this.isIconSelectModalVisible = true;
  }

  setMode(newMode: string) {
    this.assessmentInProgress = false;
    this.currentAssessmentItemIndex = -1;
    this.mode = newMode;
    if (newMode === 'Preview') {
      this.introEditorHash[this.currentPageId] = null;
      this.percentageOfBrowserHeight = .4;
      this.contentHeight = Math.floor((window.innerHeight - (.40 * window.innerHeight)) * .90);
    } else {
      this.introEditorHash[this.currentPageId] = null;
      this.percentageOfBrowserHeight = .55;
      this.contentHeight = Math.floor((window.innerHeight - (.55 * window.innerHeight)) * .90);
    }
    //    this.resetAssessment();
  }

  confirmDeleteQuestion(page, questionIndex) {
    page.content.assessment.items.splice(questionIndex, 1);
    this.saveTraining(false);
  }

  confirmDeletePage() {
    this.pageIndex = parseInt(this.pageIndexHash[this.currentPageId], 10);
    this.selectedTraining.pages.splice(this.pageIndex, 1);

    if (this.pageIndex === this.selectedTraining.pages.length) {
      this.setCurrentPage(this.selectedTraining.pages[this.pageIndex - 1]._id, undefined);
    } else if (this.pageIndex < this.selectedTraining.pages.length) {
      this.setCurrentPage(this.selectedTraining.pages[this.pageIndex]._id, undefined);
    }

    this.saveTraining(false);

  }

  showComments() {
    this.commentsVisible = !this.commentsVisible;
  }

  markCompleted(training) {
    this.markCompletedModalIsVisible = true;
  }

  handleMarkAsCompletedCancel() {
    this.markCompletedModalIsVisible = false;
  }

  markTrainingAsComplete(training) {
    training.rating.push(this.rating);
  }

  addEmailToInterestList() {
    if (this.emailAddr === '') {
      return;
    }
    this.selectedTraining.interestList.push(this.emailAddr);
    this.emailAddr = '';
    this.saveTraining(false);
  }

  deleteInterestListItem(index) {
    this.selectedTraining.interestList.splice(index, 1);
    this.saveTraining(false);
  }

  //  setCurrentHelpPanel(panelName: string): void {
  //    this.currentHelpPanel = panelName;
  //  }

  postMessageDialog() {
    this.messageDialogVisible = true;
  }

  emailInterestList() {
    let msg = <MessageModel>{
      to: this.selectedTraining.interestList[0],
      from: this.authenticatedUser.email,
      subject: this.subject,
      text: this.messageBody
    }
    this.mailService.sendMessage(msg);
    this.messageDialogVisible = false;
  }

  handleEmailInterestListCancel() {
    this.messageDialogVisible = false;
  }
  /*
  beginTour() {
    this.runningTour = true;
  }
  
  endTour() {
    this.currentStep = -1;
    this.runningTour = false;
    this.setValidation('trainingWizardTour', true);
    this.saveTraining(false);
  }
  */

  movePageUp(page) {
    // can't move first page up
    let currentIndex: number = parseInt(this.pageIndexHash[page._id], 10);
    if (currentIndex === 0) {
      return;
    }

    let tmpPage: Page = this.selectedTraining.pages[currentIndex - 1];
    this.selectedTraining.pages[currentIndex - 1] = page;
    this.selectedTraining.pages[currentIndex] = tmpPage;

    this.pageIndexHash = {};
    for (let pageIndex in this.selectedTraining.pages) {
      this.pageIndexHash[this.selectedTraining.pages[pageIndex]._id] = pageIndex;
    }

    this.saveTraining(false);
  }
  movePageDown(page) {
    let currentIndex: number = parseInt(this.pageIndexHash[page._id], 10);
    if (currentIndex === this.selectedTraining.pages.length - 1) {
      return;
    }

    let tmpPage: Page = this.selectedTraining.pages[currentIndex + 1];
    this.selectedTraining.pages[currentIndex + 1] = page;
    this.selectedTraining.pages[currentIndex] = tmpPage;

    this.pageIndexHash = {};
    for (let pageIndex in this.selectedTraining.pages) {
      this.pageIndexHash[this.selectedTraining.pages[pageIndex]._id] = pageIndex;
    }

    this.saveTraining(false);
  }

  setCurrentPage(pageId: string, pageIndex: number) {
    /*
    if (!pageId || this.currentPageId === pageId) {
      return;
    }
    this.introEditorHash[this.currentPageId] = false;
    if (this.currentPage && this.currentPage.text.length === 0) {
      this.currentPage.text = 'Your page description goes here';
    }
    */
    this.currentPageId = pageId;

    if (this.mainContentPageHash[this.currentPageId]) {
      this.currentPage = this.mainContentPageHash[this.currentPageId];
      this.currentPageIndex = parseInt(this.pageIndexHash[pageId], 10);
      if (this.currentPage.type === 'assessment') {
        let status = this.assessmentStatusHash[this.currentPage.content.assessment._id];
        if (!status) {
          this.assessmentStatusHash[this.currentPage.content.assessment._id] = 'firstTime';
        }
      }
    }

  }
  /*
    createEmbeddedPage() {
      this.addNewPage('url');
      this.embeddedPageDialogIsVisible = true;
    }
  
    createAssessment() {
      this.addNewPage('assessment');
    }
  
    createHTMLPage() {
      this.addNewPage('text');
      this.saveTraining(false);
    }
    */


  addNewQuestion() {

    this.questionEditorVisible = true;
    let newQuestionIndex = this.currentPage.content.assessment.items.length;

    this.currentPage.content.assessment.items.push({ question: '', choices: [], correctChoice: -1 });
    this.editQuestion(newQuestionIndex);
  }

  addNewChoice(event, itemIndex) {
    const newChoice = 'New Choice';
    this.currentPage.content.assessment.items[itemIndex].choices.push(newChoice);
  }

  questionChanged(event, item, itemIndex) {
    this.currentPage.content.assessment.items[itemIndex] = item;
  }

  choiceContentChanged(event, choice: string, itemIndex: number, choiceIndex: number) {
    this.currentPage.content.assessment.items[itemIndex].choices[choiceIndex] = choice;
  }

  correctChoiceChanged(event, item, itemIndex) {
    this.currentPage.content.assessment.items[itemIndex] = item;
  }

  answeredQuestion(itemIndex) {
    this.showNext = true;
    this.assessmentResponse.answers[itemIndex] = this.assessmentResponseHash[this.currentAssessmentItemIndex];
    if (this.assessmentResponseHash[this.currentAssessmentItemIndex] === this.currentPage.content.assessment.items[itemIndex].correctChoice) {
      this.answerIsCorrect = true;
      this.assessmentCorrectCnt++;
      this.assessmentResponse.score = (this.assessmentCorrectCnt / this.currentPage.content.assessment.items.length) * 100;
    } else {
      this.answerIsCorrect = false;
      this.assessmentIncorrectCnt++;
    }
  }


  nextQuestion() {
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = false;
    this.currentAssessmentItemIndex++;
    this.showNext = false;
    if (this.currentAssessmentItemIndex === this.currentPage.content.assessment.items.length) {
      this.currentAssessmentItemIndex = -1;
      this.currentPage.content.assessment.complete = true;
      this.assessmentResponse.score = (this.assessmentCorrectCnt / this.currentPage.content.assessment.items.length) * 100.0;

      if (this.assessmentResponse.score < this.currentPage.content.assessment.passingGrade) {
        this.assessmentStatusHash[this.currentPage.content.assessment._id] = 'failed'
        this.assessmentResponse.passed = false;
        this.assessmentResponse.executionDate = new Date().getTime();
        if (this.currentUT) {
          console.log('FAILURE', this.assessmentResponse);
          this.currentUT.assessmentResponses.push(this.assessmentResponse);
          this.userTrainingService.saveUserTraining(this.currentUT);
        }
      } else {
        this.assessmentStatusHash[this.currentPage.content.assessment._id] = 'passed'
        this.assessmentResponse.passed = true;
        this.assessmentResponse.executionDate = new Date().getTime();
        if (this.currentUT) {
          console.log('SUCCESS', this.assessmentResponse);
          this.currentUT.assessmentResponses.push(this.assessmentResponse);
          this.userTrainingService.saveUserTraining(this.currentUT);
        }
        if (this.currentUT && this.assessmentResponse.isFinal) {
          this.assessmentResult.emit(this.currentUT._id);
        }
        this.assessmentResponse = {
          tid: undefined,
          uid: undefined,
          assessmentId: undefined,
          executionDate: 0,
          passed: false,
          score: -1,
          answers: [],
          isFinal: false
        }
      }
      this.resetAssessment();
    } else {
      this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
    }
  }


  resetAssessment() {
    this.showNext = false;
    this.assessmentInProgress = false;
    this.currentAssessmentItemIndex = -1;
    this.assessmentResponse.executionDate = 0;
    this.assessmentResponse.passed = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.currentPage.content.assessment.items.length; i++) {
      this.slideNewQuestionHash[i] = false;
      this.assessmentResponseHash[i] = null;
    }
  }

  beginAssessment() {
    this.assessmentInProgress = true;
    this.currentAssessmentItemIndex = -1;
    this.assessmentResponse.assessmentId = this.currentPage.content.assessment._id;
    this.assessmentResponse.tid = this.selectedTraining._id;
    this.assessmentResponse.uid = this.authenticatedUser._id;
    this.assessmentResponse.isFinal = this.currentPage.content.assessment.isFinal;
    this.nextQuestion();
  }

  retake() {
    this.assessmentInProgress = true;
    this.currentAssessmentItemIndex = -1;
    this.assessmentResponse.passed = false;
    this.assessmentResponse.assessmentId = this.currentPage.content.assessment._id;
    this.assessmentResponse.tid = this.selectedTraining._id;
    this.assessmentResponse.uid = this.authenticatedUser._id;
    this.assessmentResponse.isFinal = this.currentPage.content.assessment.isFinal;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.currentPage.content.assessment.items.length; i++) {
      this.assessmentResponseHash[i] = null;
    }
    this.nextQuestion();
    //    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
  }

  assessmentChanged(event) {
    this.currentPage.content.assessment.passingGrade = event;
    this.saveTraining(false);
  }


  updateQuestion() {
    this.currentQuestion.correctChoice = Number(this.currentCorrectChoice);
    this.currentPage.content.assessment.items[this.currentQuestionIndex] = this.currentQuestion;
    this.saveTraining(false);
    this.questionEditorVisible = false;
    this.matchingQuestions = this.questions;
  }

  handleQuestionEditCancel() {
    this.questionEditorVisible = false;
  }

  editQuestion(itemIndex) {
    this.currentQuestion = {
      question: this.currentPage.content.assessment.items[itemIndex].question,
      choices: this.currentPage.content.assessment.items[itemIndex].choices,
      extraInfo: this.currentPage.content.assessment.items[itemIndex].extraInfo,
      correctChoice: this.currentPage.content.assessment.items[itemIndex].correctChoice
    }
    this.currentCorrectChoice = this.currentPage.content.assessment.items[itemIndex].correctChoice.toString();
    this.currentQuestionIndex = itemIndex;
    this.questionEditorVisible = true;
  }

  resetPageContent(page: Page) {
    if (page.type === 'file') {
      page.content.file = null;
    } else if (page.type === 'url') {
      page.content.webUrl = undefined;
    } else if (page.type === 'text') {
      page.content.text = undefined;
    } else if (page.type === 'assessment') {
      page.content.assessment = null;
    }
    page.type = 'none';
    page.content.type = 'none';
    page.title = 'Reset Content';
    this.saveTraining(false);
  }
  /*
    addFinalAssessmentPage() {
  
      const newPage = <Page>{
        _id: 'final-assessment',
        type: 'assessment',
        title: 'Final Assessment',
        text: '',
        content: {
          _id: 'final-assessment',
          type: 'assessment',
          assessment: {
            _id: String(new Date().getTime()),
            passingGrade: 60,
            items: []
          }
        }
      }
  
      this.selectedTraining.pages.push(newPage);
      this.buildPageHashes();
      this.saveTraining(false);
    }
    */
}