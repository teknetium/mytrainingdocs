import { Component, OnInit, HostListener, Input, Output, EventEmitter, ElementRef, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FileService } from '../../shared/services/file.service';
import { TrainingService } from '../../shared/services/training.service';
import { UserService } from '../../shared/services/user.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { AuthService } from '../../shared/services/auth.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { TrainingModel, Page, Content, TrainingVersion, Assessment, AssessmentItem } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileModel } from 'src/app/shared/interfaces/file.type';
import { UserModel, UserIdHash } from 'src/app/shared/interfaces/user.type';
import { VgAPI } from 'videogular2/compiled/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { merge, take } from 'rxjs/operators';
import { SendmailService } from '../../shared/services/sendmail.service';
import { MessageModel } from '../../shared/interfaces/message.type';
import { NzMessageService } from 'ng-zorro-antd';
import * as cloneDeep from 'lodash/cloneDeep';
import { NzModalService } from 'ng-zorro-antd/modal';
import { read } from 'fs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';
// import { TrainingViewerModule } from './training-viewer.module';
import { JoyrideService } from 'ngx-joyride';
import { AssessmentService } from '../../shared/services/assessment.service';



@Component({
  selector: 'app-training-viewer',
  templateUrl: './training-viewer.component.html',
  styleUrls: ['./training-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tocToggle', [
      // ...
      state('closed', style({
        'margin-left': '-200px'
      })),
      state('open', style({
        'margin-left': '0',
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

  assessment$: Observable<Assessment>;
  page$ = new BehaviorSubject<Page>(null);
  trainingIsDirty$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  isIconSelectModalVisible = false;
  selectedTraining$: Observable<TrainingModel>;
  trainingArchiveList$: Observable<TrainingModel[]>;
  selectedTrainingVersions$: Observable<TrainingVersion[]>;
  //  selectedTrainingIndex$: Observable<number>;
  fileUploaded$: Observable<FileModel>;
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
  assessmentResponse = [];
  showNext = false;
  //  runningTour = false;

  @Input() mode = 'Edit';
  @Input() trainingStatus = 'unlocked';
  @Input() trainingId = null;
  @Input() production = 'false';
  @Output() assessmentResult = new EventEmitter<{ tid: string, score: number, pass: boolean }>();
  pageFileHash = {};
  pageIdHash = {};
  commentsVisible = false;
  questionEditorVisible = false;
  assessmentType = {
    choice: false,
    question: false,
    assessment: false
  }
  newChoice: string;

  selectedTrainingIndex = -1;
  error1 = false;
  error2 = false;
  changeLevel = '';


  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedFile: FileModel;
  safeFileUrlHash = {};

  data: any[] = [];
  submitting = false;
  user = {
    author: 'Han Solo',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  };
  inputValue = '';
  currentHelpPanel = '';
  currentAssessmentItemIndex = -1;
  assessmentComplete = false;
  assessmentInProgress = false;
  assessmentCorrectCnt = 0;
  assessmentIncorrectCnt = 0;
  answerIsCorrect = false;
  passedAssessment = false;
  score;

  currentQuestion: AssessmentItem = {
    question: '',
    choices: [],
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

  trainingIntroShiftHash = {
    introduction: 0,
    execSummaryLabel: 1,
    execSummary: 2,
    //    goalsLabel: 3,
    //    goals: 4
  };
  validationItems = ['config', 'intro', 'mainContent', 'assessment'];
  itemNameHash = {
    //    trainingWizardTour: 'Training Wizard Tour',
    config: 'Training Configuration',
    intro: 'Training Introduction',
    mainContent: 'Main Content',
    assessment: 'Assessment'
  }
  trainingIsValidBS$ = new BehaviorSubject<boolean>(false);
  trainingIsValid$: Observable<boolean> = this.trainingIsValidBS$.asObservable();
  introFieldMask = 0;
  trainingValidMask = 0;
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
  percentageOfBrowserHeight = .55;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    this.contentHeight = Math.floor((window.innerHeight - (this.percentageOfBrowserHeight * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);
  }
  embeddedPageDialogIsVisible = false;

  constructor(
    private trainingService: TrainingService,
    private modalService: NzModalService,
    private fileService: FileService,
    private assessmentService: AssessmentService,
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
    this.assessment$ = this.assessmentService.getAssessmentStream();
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
    console.log('ngOnInit');
    if (this.production === 'true') {
      this.percentageOfBrowserHeight = .35;
    }
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    
    this.contentHeight = Math.floor((window.innerHeight - (this.percentageOfBrowserHeight * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);

    /*
      this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.tid = params.get('tid');
        this.trainingService.selectTraining(this.tid);
      });
      */
    this.currentVersionIndex = 0;
    this.mode = 'Edit';
    this.currentTraining = null;

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

      this.currentPageId = 'training-introduction';
      this.currentPage = this.selectedTraining.pages[0];
      this.currentPageIndex = 0;


      for (let pageIndex in this.selectedTraining.pages) {
        this.pageIndexHash[this.selectedTraining.pages[pageIndex]._id] = pageIndex;
      }

      this.currentPageIndex = parseInt(this.pageIndexHash[this.currentPageId], 10);

      if (this.selectedTraining.pages) {
        for (let page of this.selectedTraining.pages) {
          if (page.content) {
              if (page.content.type === 'video') {
                this.safeUrlHash[page.content.file.fileStackUrl] = page.content.file.fileStackUrl;
              } else if (page.content.type === 'file') {
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

    this.fileUploaded$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(file => {
      if (!file) {
        return;
      }
      this.currentPage = this.mainContentPageHash[this.currentPageId];

      if (!this.currentPage) {
        return;
      }

      let newContent = <Content>{
        _id: String(new Date().getTime()),
        type: undefined,
        file: file,
      };
      if (file.mimeType.includes('video')) {
        newContent.type = 'video';
        this.safeUrlHash[file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(file.fileStackUrl));
      } else if (file.mimeType.includes('application') || file.mimeType.includes('image')) {
        newContent.type = 'file';
        this.safeUrlHash[file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.previewBase + file.fileStackId));
      }

      this.currentPage.title = file.name;
      this.currentPage.type = 'file';

      this.currentPage.content = newContent;


      this.saveTraining(false);
      this.cd.detectChanges();
    });

    this.myTeamHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamHash => {
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
    this.assessment$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(assessment => {
      if (!assessment) {
        return;
      }
      console.log('assessment$', assessment);
      this.currentPage.content.assessmentId = assessment._id;
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

  bumpPatchLevel(): string {
    const versionArray = this.currentSelectedTrainingVersions[0].version.split('_', 3);
    let majorNum = parseInt(versionArray[0], 10);
    let minorNum = parseInt(versionArray[1], 10);
    let patchNum = parseInt(versionArray[2], 10);

    patchNum++;
    return majorNum + '_' + minorNum + '_' + patchNum;
  }
  /*
    selectPageTemplate(templateName: string) {
      if (templateName === 'singleContent') {
        let newPage = <Page>{
   
        }
      }
    }
  */
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
      this.trainingService.selectTrainingVersion(this.currentTraining);
    } else {
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

  openPicker(type: string): void {
    if (type === 'doc') {
      this.fileService.openDocPicker();
    } else if (type === 'video') {
      this.fileService.openVideoPicker();
    } else if (type === 'audio') {
      this.fileService.openAudioPicker();
    } else if (type === 'image') {
      this.fileService.openImagePicker();
    } else if (type === 'text') {
      this.fileService.openTextPicker();
    } else if (type === 'all') {
      this.fileService.openAllPicker();
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
      this.resetTrainingStatus();
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
    if (this.selectedTraining.jobTitle !== this.previousVersion.jobTitle) {
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
          this.userTrainingService.assignTraining(userId, this.selectedTraining._id);
          this.assignedFromJobTitle.push(userId);
        }
      }
      if (this.assignedFromJobTitle.length > 0) {
        this.assignedFromJobTitleDialogIsVisible = true;
      }
    }

    this.trainingService.saveNewVersion(trainingClone);
    this.trainingService.selectTrainingVersion(trainingClone);

    this.lockTrainingModalIsVisible = false;
  }

  saveNewVersion() {

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
            this.userTrainingService.assignTraining(userId, this.selectedTraining._id);
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
  /*
    setValidation(item: string, value: boolean) {
      this.selectedTraining.isValid[item] = value;
      this.saveTraining(false);
   
      let trainingIsValid = true;
      for (let item of this.validationItems) {
        if (!this.selectedTraining.isValid[item]) {
          trainingIsValid = false;
          return;
        }
      }
      this.trainingIsValidBS$.next(trainingIsValid);
    }
  */
  htmlContentChanged(data) {
    this.saveTraining(false);
  }

  quillBlur(data) {
    this.saveTraining(false);
  }


  resetTrainingStatus() {
    this.userTrainingService.resetUserTrainingStatus(this.selectedTraining._id);
  }

  sendNotifications() {
    this.subject = 'The Content of a Training has changed!'
    this.messageBody = "Training '" + this.selectedTraining.title + "' has been updated.  Please review the training."
    for (let user of this.assignedToUsers) {
      let msg = <MessageModel>{
        to: this.myTeamHash[user].email,
        from: this.authenticatedUser.email,
        subject: this.subject,
        text: this.messageBody
      }
      this.mailService.sendMessage(msg);
    }
  }

  pageUrlChanged() {
    if (this.pageUrl === '') {
      return;
    }

    this.badUrl = false;
    if (this.pageUrl !== '' && !this.pageUrl.startsWith('https://')) {
      this.badUrl = true;
      this.pageUrl = '';
      return;
    }
    let safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.pageUrl));

    this.safeUrlHash[this.pageUrl] = safeUrl;
    this.currentPage.type = 'url';
    this.currentPage = this.mainContentPageHash[this.currentPageId];

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

  addNewPage() {

    const content = <Content>{
      _id: String(new Date().getTime()),
      type: 'none',
    }
    const newPage = <Page>{
      _id: String(new Date().getTime()),
      type: 'none',
      title: 'New Page',
      text: '<p class=\"ql-align-center\"><span class=\"ql-size-large\" style=\"color: rgb(0, 0, 0);\">Sample Page Introduction<\/span><\/p><p><span style=\"color: rgb(0, 0, 0);\">This is a sample page introduction.<\/span><\/p>',
      content: content
    }

    this.selectedTraining.pages.push(newPage);
    this.currentPage = newPage;
    this.pageIndexHash[newPage._id] = this.selectedTraining.pages.length - 1;
    this.mainContentPageHash[newPage._id] = newPage;
    this.saveTraining(false);
    this.setCurrentPage(newPage._id, undefined);
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

  startTour() {
    this.joyrideService.startTour(
      { steps: ['viewerStep1', 'viewerStep2', 'viewerStep3'] }
    );

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

  setCurrentPage(pageId: string, pageIndex: number) {
    this.currentPageId = pageId;

    if (this.mainContentPageHash[this.currentPageId]) {
      this.currentPage = this.mainContentPageHash[this.currentPageId];
      this.currentPageIndex = parseInt(this.pageIndexHash[pageId], 10);
    }

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

  configChanged(event) {
    //    this.setValidation('config', true);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId, undefined);
  }

  contentChanged(newVal: string, propName: string) {
    this.selectedTraining[propName] = newVal;
    this.introFieldMask = this.introFieldMask | 1 << this.trainingIntroShiftHash[propName];
    //    if (this.introFieldMask === 7) {
    //      this.setValidation('intro', true);
    //    }
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
    this.currentTraining = null;
    this.previousVersion = null;
    this.userTrainingService.stopSession(this.selectedTraining._id);
    //    this.trainingService.reloadAllTrainings();
    this.trainingService.selectTraining(null);
    this.assessmentInProgress = false;
    this.currentVersionIndex = 0;
    this.currentPageIndex = 0;
    this.currentPageId = 'training-introduction';
    this.currentPage = this.selectedTraining.pages[0];
    this.mode = 'Edit';
  }

  toggleTOC() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.pageContainerMarginLeft = '270';
    } else {
      this.pageContainerMarginLeft = '20';
    }
  }

  saveTraining(reload: boolean) {
    if (this.selectedTraining.teamId === 'mytrainingdocs') {
      return;
    }
    this.trainingService.saveTraining(this.selectedTraining, reload);
    console.log('saveTraining', this.currentPageId);
    this.setCurrentPage(this.currentPageId, undefined);
  }

  cancelAssignToUser() {
    this.currentSelectedUserToAssign = '';
    this.showAssignToUserDialog = false;
  }

  confirmAssignmentToUser() {
    this.showAssignToUserDialog = false;
    this.userTrainingService.assignTraining(this.assignToUser._id, this.selectedTraining._id);
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
      this.percentageOfBrowserHeight = .4;
      this.contentHeight = Math.floor((window.innerHeight - (.40 * window.innerHeight)) * .90);
    } else {
      this.percentageOfBrowserHeight = .55;
      this.contentHeight = Math.floor((window.innerHeight - (.55 * window.innerHeight)) * .90);
    }
    //    this.resetAssessment();
  }

  confirmDeleteQuestion(questionIndex) {
    /*
    this.selectedTraining.assessment.items.splice(questionIndex, 1);
    if (this.selectedTraining.assessment.items.length === 0) {
      this.setValidation('assessment', false);
    }
    this.saveTraining(false);
    */
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
  setCurrentHelpPanel(panelName: string): void {
    this.currentHelpPanel = panelName;
  }

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

  createAssessment() {
    this.currentPage.content.assessment = <Assessment>{
      _id: String(new Date().getTime()),
      passingGrade: 60,
      items: []
    }
    this.currentPage.title = 'Assessment';
    this.currentPage.type = 'assessment';
    this.currentPage.content.type = 'assessment';
    this.saveTraining(false);
  }

  createHTMLPage() {
    this.currentPage.type = 'text';
    this.currentPage.title = 'HTML Page';
    this.currentPage.content.type = 'html';
    this.saveTraining(false);
  }

  beginAssessment() {
    this.assessmentInProgress = true;
    this.currentAssessmentItemIndex = -1;
    this.nextQuestion();
  }

  addNewQuestion() {

    this.questionEditorVisible = true;
    let newQuestionIndex = this.currentPage.content.assessment.items.length;
    let newItem = {
      question: '',
      choices: [],
      correctChoice: -1
    };

    this.currentPage.content.assessment.items.push(newItem);
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
    if (this.assessmentResponseHash[this.currentAssessmentItemIndex] === this.currentPage.content.assessment.items[itemIndex].correctChoice) {
      this.answerIsCorrect = true;
      this.assessmentCorrectCnt++;
      this.score = (this.assessmentCorrectCnt / this.currentPage.content.assessment.items.length) * 100;
    } else {
      this.answerIsCorrect = false;
      this.assessmentIncorrectCnt++;
    }
  }


  resetAssessment() {
    this.showNext = false;
    this.assessmentInProgress = false;
    this.assessmentComplete = false;
    this.currentAssessmentItemIndex = -1;
    this.passedAssessment = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.currentPage.content.assessment.items.length; i++) {
      this.slideNewQuestionHash[i] = false;
      this.assessmentResponseHash[i] = null;
    }
  }

  nextQuestion() {
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = false;
    this.currentAssessmentItemIndex++;
    this.showNext = false;
    if (this.currentAssessmentItemIndex === this.currentPage.content.assessment.items.length) {
      this.currentAssessmentItemIndex = -1;
      this.assessmentComplete = true;
      this.assessmentInProgress = false;
      this.score = (this.assessmentCorrectCnt / this.currentPage.content.assessment.items.length) * 100.0;
      if (this.score < this.currentPage.content.assessment.passingGrade) {
        this.passedAssessment = false;
      } else {
        this.passedAssessment = true;
        this.assessmentResult.emit({ tid: this.selectedTraining._id, score: this.score, pass: true });
      }
    } else {
      this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
    }
  }

  retake() {
    this.assessmentInProgress = true;
    this.assessmentComplete = false;
    this.currentAssessmentItemIndex = 0;
    this.passedAssessment = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.currentPage.content.assessment.items.length; i++) {
      this.assessmentResponseHash[i] = null;
    }
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
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
  }

  handleQuestionEditCancel() {
    this.questionEditorVisible = false;
  }

  editQuestion(itemIndex) {
    this.currentQuestion = {
      question: this.currentPage.content.assessment.items[itemIndex].question,
      choices: this.currentPage.content.assessment.items[itemIndex].choices,
      correctChoice: this.currentPage.content.assessment.items[itemIndex].correctChoice
    }
    this.currentCorrectChoice = this.currentPage.content.assessment.items[itemIndex].correctChoice.toString();
    this.currentQuestionIndex = itemIndex;
    this.questionEditorVisible = true;
  }
}