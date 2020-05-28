import { Component, OnInit, HostListener, Input, Output, EventEmitter, ElementRef, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FileService } from '../../shared/services/file.service';
import { TrainingService } from '../../shared/services/training.service';
import { UserService } from '../../shared/services/user.service';
import { JobTitleService } from '../../shared/services/jobtitle.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { AuthService } from '../../shared/services/auth.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { TrainingModel, Page, Content, TrainingVersion } from 'src/app/shared/interfaces/training.type';
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



@Component({
  selector: 'app-training-viewer',
  templateUrl: './training-viewer.component.html',
  styleUrls: ['./training-viewer.component.css'],
  //  changeDetection: ChangeDetectionStrategy.OnPush,
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

  alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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
  slideNewQuestionHash = {};

  score = 0;
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
  currentQuestionIndex = -1;
  currentCorrectChoice: string;
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
  currentPageIndex: number;
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
  contentHeight: number;
  showCloseButton = false;
  percentageOfBrowserHeight = .35
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    this.contentHeight = Math.floor((window.innerHeight - (this.percentageOfBrowserHeight * window.innerHeight)) * .90);
    this.contentWidth = Math.floor(window.innerWidth * .9);
  }


  constructor(
    private trainingService: TrainingService,
    private modalService: NzModalService,
    private fileService: FileService,
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
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;
    
    this.contentHeight = Math.floor((window.innerHeight - (.35 * window.innerHeight)) * .90);
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

      if (!this.currentPageId) {
        this.currentPageId = this.selectedTraining.pages[0]._id;
      }

      for (let pageIndex in this.selectedTraining.pages) {
        this.pageIndexHash[this.selectedTraining.pages[pageIndex]._id] = pageIndex;
      }

      this.currentPageIndex = parseInt(this.pageIndexHash[this.currentPageId]);

      if (this.selectedTraining.pages) {
        for (let page of this.selectedTraining.pages) {
          if (page.content) {
            for (let contentItem of page.content) {
              if (contentItem.type === 'video') {
                this.safeUrlHash[contentItem.file.fileStackUrl] = contentItem.file.fileStackUrl;
              } else if (contentItem.type === 'file') {
                this.safeUrlHash[contentItem.file.fileStackUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.previewBase + contentItem.file.fileStackId));
              } else if (contentItem.type === 'url') {
                this.safeUrlHash[contentItem.webUrl] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(contentItem.webUrl));
              }
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
    });

    this.selectedTrainingVersions$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(versions => {
      if (!versions) {
        console.log('selectedTrainingVersions$ : ERROR', versions);
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

      this.currentPage.content.push(newContent);

      let fileExt = file.name.substring(file.name.indexOf('.') + 1);
      this.currentPage.icon = this.fileExtensionHash[fileExt];

      this.saveTraining(false);
      //      this.cd.detectChanges();
    });

    this.myTeamHash$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(myTeamHash => {
      this.myTeamHash = myTeamHash;
    })

    this.users$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(userList => {
      console.log('TrainingViewer:users$.subscribe userList', userList);
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

      for (let userId of this.assignedToUsers) {
        if (this.myTeamHash[userId].jobTitle === this.trainingArchiveList[0].jobTitle) {
          this.userTrainingService.deleteUserTrainingByTidUid(this.selectedTraining._id, userId);
          this.removedFromJobTitle.push(userId);
        }
      }

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
  useAssessmentChanged(event) {
    console.log('useAssessmentChanged', event);
    //    this.setValidation('assessment', true);
  }

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
    console.log('sending notification message');
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
    this.currentPage = this.mainContentPageHash[this.currentPageId];

    this.currentPage.content[0].versions[0].dateUploaded = new Date().getTime();
    this.currentPage.content[0].versions[0].version = '1_0_0';
    this.currentPage.content[0].versions[0].webUrl = this.pageUrl;

    this.currentPage.content[0].type = 'url';
    this.currentPage.title = this.pageUrl;

    this.saveTraining(true);

    this.pageUrl = '';
  }

  selectSection(sectionName: string) {
    this.currentSection = sectionName;
  }

  addNewPage(type: string) {
    const content = <Content>{
      _id: String(new Date().getTime()),
      type: type,
      name: undefined,
    }

    const page = <Page>{
      _id: String(new Date().getTime()),
      type: 'single',
      content: new Array(content),
    }

    let newPage = cloneDeep(page);

    this.selectedTraining.pages.push(newPage);
    this.currentPage = newPage;
    this.pageIndexHash[newPage._id] = this.selectedTraining.pages.length - 1;
    this.mainContentPageHash[newPage._id] = newPage;
    this.saveTraining(true);
    this.setCurrentPage(newPage._id);
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
      console.log('isFirstPage ... TRUE');
      return true;
    } else {
      console.log('isFirstPage ... False');
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
    this.setCurrentPage(this.selectedTraining.pages[this.currentPageIndex]._id);
  }

  loadPrevPage() {
    this.currentPageIndex--;
    this.setCurrentPage(this.selectedTraining.pages[this.currentPageIndex]._id);
  }

  setCurrentPage(pageId: string) {
    this.currentPageId = pageId;

    if (this.mainContentPageHash[this.currentPageId]) {
      this.currentPage = this.mainContentPageHash[this.currentPageId];
      this.currentPageIndex = Number(this.pageIndexHash[pageId]);
      /*
    if (this.currentPageIndex > 0) {
      this.prevIsActive = true;
      if (this.currentPageIndex < this.selectedTraining.pages.length - 1 && this.currentPage.content[0].type !== 'video') {
        this.nextIsActive = true;
      } else {
        this.nextIsActive = false;
      }
    } else {
      this.prevIsActive = false;
    }
      */
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
    this.setCurrentPage(this.currentPageId);
  }

  contentChanged(newVal: string, propName: string) {
    this.selectedTraining[propName] = newVal;
    this.introFieldMask = this.introFieldMask | 1 << this.trainingIntroShiftHash[propName];
    //    if (this.introFieldMask === 7) {
    //      this.setValidation('intro', true);
    //    }
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  pageContentChanged(newVal: string, page: Page, propName: string) {
    console.log('pageContentChanged', newVal, propName);
    page[propName] = newVal;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
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
    this.setCurrentPage(this.currentPageId);

    this.isIconSelectModalVisible = false;
    this.okDisabled = true;
  }

  closeViewer() {
    console.log('closeViewer');
    this.currentTraining = null;
    this.previousVersion = null;
    this.userTrainingService.stopSession(this.selectedTraining._id);
    //    this.trainingService.reloadAllTrainings();
    this.trainingService.selectTraining(null);
    this.assessmentInProgress = false;
    this.currentVersionIndex = 0;
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
    console.log('TrainingViewerComponent:saveTraining', this.selectedTraining);
    this.trainingService.saveTraining(this.selectedTraining, true);
    this.setCurrentPage(this.currentPageId);
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
    if (newMode === 'Preview' && (this.currentPageId === 'config')) {
      this.currentPageId = 'intro'
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
    this.pageIndex = this.pageIndexHash[this.currentPageId];
    this.selectedTraining.pages.splice(this.pageIndex, 1);

    this.saveTraining(false);
    if (this.selectedTraining.pages.length > 0 && (this.pageIndex < this.selectedTraining.pages.length)) {
      this.setCurrentPage(this.selectedTraining.pages[this.pageIndex]._id);
    } else if (this.selectedTraining.pages.length > 0 && (this.pageIndex === this.selectedTraining.pages.length)) {
      this.setCurrentPage(this.selectedTraining.pages[this.pageIndex - 1]._id);
    } else {
      this.setCurrentPage('intro');
    }

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

  movePage(page, positions) {
    // can't move first page up
    let currentIndex = this.pageIndexHash[page._id];
    console.log('movePage', currentIndex, this.selectedTraining.pages.length);
    if (currentIndex === '0' && positions === -1) {
      return;
    }

    // can't move last page down
    if (currentIndex === String(this.selectedTraining.pages.length - 1) && positions === 1) {
      return;
    }

    let pageToMove = this.selectedTraining.pages.splice(currentIndex, 1);
    this.selectedTraining.pages.splice(currentIndex + positions, 0, pageToMove[0]);

    this.pageIndexHash = {};
    for (let pageIndex in this.selectedTraining.pages) {
      this.pageIndexHash[this.selectedTraining.pages[pageIndex]._id] = pageIndex;
    }

    this.saveTraining(false);
  }
  /*
  beginAssessment() {
    this.assessmentInProgress = true;
    this.currentAssessmentItemIndex = -1;
    this.nextQuestion();
  }
*/
}